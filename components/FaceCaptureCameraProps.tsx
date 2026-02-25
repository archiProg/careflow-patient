import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Animated,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Mask, Rect, Stop } from "react-native-svg";
import {
    useCameraDevice,
    useCameraPermission,
    Camera as VisionCamera,
} from "react-native-vision-camera";
import {
    Camera,
    Face,
    FrameFaceDetectionOptions,
} from "react-native-vision-camera-face-detector";

type Step =
    | "PREPARE"
    | "BLINK"
    | "LOOK_UP"
    | "LOOK_DOWN"
    | "RIGHT"
    | "LEFT"
    | "CENTER"
    | "DONE";

interface FaceCaptureCameraProps {
    onCapture: (uri: string) => void;
    IsActive: boolean;
}

const PREPARE_TIPS = [
    { icon: "💡", text: "อยู่ในที่ที่มีแสงสว่างเพียงพอ" },
    { icon: "👓", text: "ถอดแว่นตาออกก่อนสแกน" },
    { icon: "😐", text: "แสดงสีหน้าปกติ ไม่ยิ้มหรือขมวดคิ้ว" },
    { icon: "📱", text: "ถือโทรศัพท์ให้ตั้งตรง ระดับสายตา" },
    { icon: "🔄", text: "ทำตามคำแนะนำบนหน้าจอทีละขั้นตอน" },
];

export const FaceCaptureCamera: React.FC<FaceCaptureCameraProps> = ({ onCapture, IsActive }) => {
    const { t } = useTranslation();
    const { hasPermission } = useCameraPermission();
    const device = useCameraDevice("front");
    const { width, height } = useWindowDimensions();

    const isTablet = useMemo(() => {
        const aspectRatio = Math.max(width, height) / Math.min(width, height);
        return aspectRatio < 1.6;
    }, [width, height]);

    const ovalWidth = isTablet ? width * 0.75 : width * 0.8;
    const ovalHeight = isTablet ? height * 0.60 : height * 0.5;

    const cameraRef = useRef<VisionCamera>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    // Prepare screen animations
    const prepareFadeAnim = useRef(new Animated.Value(0)).current;
    const prepareSlideAnim = useRef(new Animated.Value(30)).current;
    const tipAnims = useRef(PREPARE_TIPS.map(() => new Animated.Value(0))).current;
    const tipSlideAnims = useRef(PREPARE_TIPS.map(() => new Animated.Value(20))).current;
    const buttonScaleAnim = useRef(new Animated.Value(0.9)).current;
    const buttonGlowAnim = useRef(new Animated.Value(0)).current;

    const [step, setStep] = useState<Step>("PREPARE");
    const [blinked, setBlinked] = useState(false);
    const [distanceStatus, setDistanceStatus] = useState("Good distance");
    const [cameraActive, setCameraActive] = useState(false);

    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [selected, setSelected] = useState<number | null>(null);
    const isCapturingRef = useRef(false);

    // Responsive scale — phone stays as-is, tablet gets larger text & spacing
    const rs = useMemo(() => ({
        hPadding:        isTablet ? 56   : 24,
        pTop:            isTablet ? 32   : 16,
        pBottom:         isTablet ? 48   : 24,
        iconSize:        isTablet ? 96   : 64,
        iconFontSize:    isTablet ? 44   : 28,
        iconMB:          isTablet ? 20   : 12,
        titleFontSize:   isTablet ? 30   : 17,
        titleMB:         isTablet ? 10   : 6,
        subFontSize:     isTablet ? 17   : 11,
        subLineHeight:   isTablet ? 26   : 18,
        headerMB:        isTablet ? 36   : 20,
        cardPadding:     isTablet ? 28   : 16,
        cardBorderR:     isTablet ? 28   : 20,
        cardMB:          isTablet ? 32   : 20,
        labelFontSize:   isTablet ? 15   : 11,
        labelMB:         isTablet ? 20   : 12,
        tipPY:           isTablet ? 18   : 10,
        tipIconSize:     isTablet ? 52   : 24,
        tipIconBorderR:  isTablet ? 14   : 10,
        tipIconFontSize: isTablet ? 26   : 11,
        tipIconMR:       isTablet ? 18   : 12,
        tipFontSize:     isTablet ? 18   : 11,
        tipLineHeight:   isTablet ? 28   : 20,
        checkSize:       isTablet ? 32   : 20,
        checkFontSize:   isTablet ? 15   : 10,
        btnHeight:       isTablet ? 72   : 48,
        btnBorderR:      isTablet ? 36   : 20,
        btnFontSize:     isTablet ? 21   : 17,
        btnIconFontSize: isTablet ? 26   : 18,
    }), [isTablet]);

    useEffect(() => {
        setCapturedImages([]);
        setSelected(null);
        setStep("PREPARE");
        setBlinked(false);
        setDistanceStatus("Good distance");
        setCameraActive(false);
    }, [IsActive]);

    useEffect(() => {
        VisionCamera.requestCameraPermission();
    }, []);

    // Animate prepare screen
    useEffect(() => {
        if (step === "PREPARE") {
            prepareFadeAnim.setValue(0);
            prepareSlideAnim.setValue(30);
            buttonScaleAnim.setValue(0.9);
            tipAnims.forEach(a => a.setValue(0));
            tipSlideAnims.forEach(a => a.setValue(20));

            Animated.parallel([
                Animated.timing(prepareFadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(prepareSlideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]).start();

            PREPARE_TIPS.forEach((_, i) => {
                Animated.parallel([
                    Animated.timing(tipAnims[i], { toValue: 1, duration: 400, delay: 200 + i * 120, useNativeDriver: true }),
                    Animated.timing(tipSlideAnims[i], { toValue: 0, duration: 400, delay: 200 + i * 120, useNativeDriver: true }),
                ]).start();
            });

            Animated.spring(buttonScaleAnim, {
                toValue: 1, delay: 900, useNativeDriver: true, tension: 120, friction: 8,
            }).start();

            const glowLoop = Animated.loop(
                Animated.sequence([
                    Animated.timing(buttonGlowAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
                    Animated.timing(buttonGlowAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
                ])
            );
            glowLoop.start();
            return () => glowLoop.stop();
        }
    }, [step]);

    // Fade in for scan steps
    useEffect(() => {
        if (step !== "PREPARE") {
            fadeAnim.setValue(0);
            slideAnim.setValue(50);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
            ]).start();
        }
    }, [step]);

    const faceDetectionOptions = useMemo<FrameFaceDetectionOptions>(
        () => ({
            performanceMode: "accurate",
            landmarkMode: "all",
            contourMode: "none",
            classificationMode: "all",
            trackingEnabled: false,
            windowWidth: Math.max(width, 1),
            windowHeight: Math.max(height, 1),
        }),
        [width, height]
    );

    const captureRandomImages = async () => {
        if (!cameraRef.current || isCapturingRef.current) return;
        isCapturingRef.current = true;
        try {
            const images: string[] = [];
            for (let i = 0; i < 3; i++) {
                const photo = await cameraRef.current.takePhoto({ flash: "off" });
                images.push(photo.path);
                await new Promise(res => setTimeout(res, 300));
            }
            setCapturedImages(images);
            setSelected(0);
            setStep("DONE");
            setCameraActive(false);
        } catch (e) {
            console.error("Capture failed:", e);
        } finally {
            isCapturingRef.current = false;
        }
    };

    const getStepText = (currentStep: Step) => {
        const texts: Record<Step, string> = {
            PREPARE: "เตรียมพร้อม",
            BLINK: "กะพริบตา",
            LOOK_UP: "มองขึ้น",
            LOOK_DOWN: "มองลง",
            RIGHT: "หันขวา",
            LEFT: "หันซ้าย",
            CENTER: "มองตรง",
            DONE: "เสร็จสิ้น",
        };
        return texts[currentStep];
    };

    const handleFacesDetection = async (faces: Face[]) => {
        if (!cameraActive || !faces?.length) return;

        const face = faces[0];
        const { width: fw, height: fh, x: fx, y: fy } = face.bounds;

        const faceCenterX = fx + fw / 2;
        const faceCenterY = fy + fh / 2;

        const ovalCenterX = isTablet
            ? (width - ovalWidth) / 3.5 + width * 0.08 + ovalWidth / 2
            : (width - ovalWidth) / 2 + ovalWidth / 2;
        const ovalCenterY = height / 2;
        const ovalRadiusX = ovalWidth / 2;
        const ovalRadiusY = ovalHeight / 2;

        const dx = faceCenterX - ovalCenterX;
        const dy = faceCenterY - ovalCenterY;
        const normalizedDistance =
            (dx * dx) / (ovalRadiusX * ovalRadiusX) +
            (dy * dy) / (ovalRadiusY * ovalRadiusY);

        const isMovementStep = step === "LOOK_UP" || step === "LOOK_DOWN";
        const OVAL_TOLERANCE = isMovementStep ? 2.5 : (isTablet ? 1.35 : 1.0);
        const isInsideOval = normalizedDistance <= OVAL_TOLERANCE;

        const faceToOvalRatio = fh / ovalHeight;
        const minRatio = isTablet ? 0.40 : 0.55;
        const maxRatio = isMovementStep ? 1.5 : (isTablet ? 0.90 : 0.80);

        let distanceMsg = "Good distance";
        if (!isInsideOval) distanceMsg = "Center your face";
        else if (faceToOvalRatio < minRatio) distanceMsg = "Move closer";
        else if (faceToOvalRatio > maxRatio) distanceMsg = "Move back";

        setDistanceStatus(distanceMsg);

        const EYE_OPEN = 0.7;
        const EYE_CLOSE = 0.3;
        const eyeClosed = face.leftEyeOpenProbability < EYE_CLOSE && face.rightEyeOpenProbability < EYE_CLOSE;
        const eyeOpened = face.leftEyeOpenProbability > EYE_OPEN && face.rightEyeOpenProbability > EYE_OPEN;

        if (distanceMsg !== "Good distance") return;

        if (step === "BLINK") {
            if (eyeClosed) setBlinked(true);
            if (eyeOpened && blinked) { setStep("LOOK_UP"); setBlinked(false); }
        }

        if (step === "LOOK_UP" && face.pitchAngle > 8) setStep("LOOK_DOWN");
        if (step === "LOOK_DOWN" && face.pitchAngle < -8) setStep("RIGHT");
        if (step === "RIGHT" && face.yawAngle < -8) setStep("LEFT");
        if (step === "LEFT" && face.yawAngle > 8) setStep("CENTER");

        const centerTolerance = isTablet ? 15 : 10;
        if (step === "CENTER" && Math.abs(face.yawAngle) < centerTolerance) {
            setDistanceStatus("Perfect! Hold still...");
            await new Promise(res => setTimeout(res, 1000));
            await captureRandomImages();
        }
    };

    const handleStartScan = () => {
        setStep("BLINK");
        setCameraActive(true);
    };

    if (!hasPermission) return (
        <Text style={{ color: "white", textAlign: "center", fontSize: 16, marginTop: 48 }}>
            Camera permission is required.
        </Text>
    );
    if (!device) return (
        <Text style={{ color: "white", textAlign: "center", fontSize: 16, marginTop: 48 }}>
            No camera device found.
        </Text>
    );

    // ─── PREPARE SCREEN ───────────────────────────────────────────────────────
    if (step === "PREPARE") {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#0a0a0f" }}>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        paddingHorizontal: rs.hPadding,
                        paddingTop: rs.pTop,
                        paddingBottom: rs.pBottom,
                    }}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    {/* Header */}
                    <Animated.View
                        style={{
                            opacity: prepareFadeAnim,
                            transform: [{ translateY: prepareSlideAnim }],
                            alignItems: "center",
                            marginBottom: rs.headerMB,
                        }}
                    >
                        <View style={{
                            width: rs.iconSize,
                            height: rs.iconSize,
                            borderRadius: rs.iconSize / 2,
                            backgroundColor: "#1a1a2e",
                            borderWidth: isTablet ? 3 : 2,
                            borderColor: "#3b82f6",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: rs.iconMB,
                            shadowColor: "#3b82f6",
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.6,
                            shadowRadius: 12,
                        }}>
                            <Text style={{ fontSize: rs.iconFontSize }}>🤳</Text>
                        </View>

                        <Text style={{
                            fontSize: rs.titleFontSize,
                            fontWeight: "700",
                            color: "#ffffff",
                            letterSpacing: 0.5,
                            marginBottom: rs.titleMB,
                        }}>
                            สแกนใบหน้า
                        </Text>
                        <Text style={{
                            fontSize: rs.subFontSize,
                            color: "#94a3b8",
                            textAlign: "center",
                            lineHeight: rs.subLineHeight,
                        }}>
                            กรุณาเตรียมพร้อมก่อนเริ่มสแกน{"\n"}เพื่อให้ได้ผลลัพธ์ที่ดีที่สุด
                        </Text>
                    </Animated.View>

                    {/* Tips card */}
                    <View style={{
                        backgroundColor: "#111827",
                        borderRadius: rs.cardBorderR,
                        padding: rs.cardPadding,
                        borderWidth: 1,
                        borderColor: "#1e293b",
                        marginBottom: rs.cardMB,
                    }}>
                        <Text style={{
                            fontSize: rs.labelFontSize,
                            fontWeight: "600",
                            color: "#64748b",
                            letterSpacing: 1,
                            textTransform: "uppercase",
                            marginBottom: rs.labelMB,
                        }}>
                            คำแนะนำ
                        </Text>

                        {PREPARE_TIPS.map((tip, index) => (
                            <Animated.View
                                key={index}
                                style={{
                                    opacity: tipAnims[index],
                                    transform: [{ translateX: tipSlideAnims[index] }],
                                    flexDirection: "row",
                                    alignItems: "center",
                                    paddingVertical: rs.tipPY,
                                    borderBottomWidth: index < PREPARE_TIPS.length - 1 ? 1 : 0,
                                    borderBottomColor: "#1e293b",
                                }}
                            >
                                <View style={{
                                    width: rs.tipIconSize,
                                    height: rs.tipIconSize,
                                    borderRadius: rs.tipIconBorderR,
                                    backgroundColor: "#1e293b",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginRight: rs.tipIconMR,
                                }}>
                                    <Text style={{ fontSize: rs.tipIconFontSize }}>{tip.icon}</Text>
                                </View>

                                <Text style={{
                                    flex: 1,
                                    fontSize: rs.tipFontSize,
                                    color: "#e2e8f0",
                                    lineHeight: rs.tipLineHeight,
                                }}>
                                    {tip.text}
                                </Text>

                                <View style={{
                                    width: rs.checkSize,
                                    height: rs.checkSize,
                                    borderRadius: rs.checkSize / 2,
                                    backgroundColor: "#052e16",
                                    borderWidth: 1.5,
                                    borderColor: "#10b981",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}>
                                    <Text style={{ fontSize: rs.checkFontSize, color: "#10b981" }}>✓</Text>
                                </View>
                            </Animated.View>
                        ))}
                    </View>

          {/* Start button */}
          <Pressable onPress={handleStartScan}>
            <Animated.View
              style={{
                opacity: prepareFadeAnim,
                transform: [{ translateY: prepareSlideAnim }],
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                backgroundColor: "#2563eb",
                height: rs.btnHeight,
                borderRadius: rs.btnBorderR,
              }}
            >
              <Text
                style={{
                  fontSize: rs.btnIconFontSize,
                  marginRight: rs.tipIconMR,
                }}
              >
📷              
</Text>
              <Text
                style={{
                  fontSize: rs.btnFontSize,
                  fontWeight: "700",
                  color: "#ffffff",
                  letterSpacing: 0.5,
                }}
              >
                เริ่มสแกนใบหน้า
              </Text>
            </Animated.View>
          </Pressable>

                </ScrollView>
            </SafeAreaView>
        );
    }

    // ─── DONE SCREEN ──────────────────────────────────────────────────────────
    if (step === "DONE") {
        return (
            <SafeAreaView style={StyleSheet.absoluteFill} className="flex-1 bg-white">
                <View style={{ flex: 1, padding: 16, backgroundColor: "white" }}>
                    <Text style={{ textAlign: "center", fontSize: 18, marginBottom: 16 }}>
                        {t("select_your_best_photo")}
                    </Text>

                    <View className="flex-1 items-center justify-center">
                        {selected !== null && capturedImages[selected] && (
                            <Image
                                source={{ uri: `file://${capturedImages[selected]}` }}
                                className="w-full h-full rounded-lg mb-4"
                            />
                        )}
                    </View>
                    <View className="flex justify-end">
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            {capturedImages.map((uri, index) => (
                                <Pressable
                                    key={index}
                                    onPress={() => setSelected(index)}
                                    style={{
                                        borderWidth: 2,
                                        borderRadius: 12,
                                        borderColor: selected === index ? "green" : "transparent",
                                    }}
                                >
                                    <Image
                                        source={{ uri: `file://${uri}` }}
                                        className="w-20 h-32 rounded-lg"
                                    />
                                </Pressable>
                            ))}
                        </View>
                        <View>
                            <Pressable
                                onPress={() => {
                                    if (selected !== null && capturedImages[selected]) {
                                        onCapture(`file://${capturedImages[selected]}`);
                                    }
                                }}
                                className="flex items-center justify-center w-full bg-blue-500 h-[56px] rounded-[24px] mt-4"
                            >
                                <Text className="text-white text-md">{t("confirm")}</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    // ─── SCAN SCREEN ──────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={StyleSheet.absoluteFill} className="flex-1 bg-white">
            <View className="flex-1">
                <Camera
                    ref={cameraRef}
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={cameraActive}
                    photo
                    faceDetectionCallback={handleFacesDetection}
                    faceDetectionOptions={faceDetectionOptions}
                />

                {/* Oval overlay */}
                <View className="absolute inset-0">
                    <Svg width={width} height={height}>
                        <Defs>
                            <LinearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <Stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
                                <Stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.9" />
                                <Stop offset="100%" stopColor="#ec4899" stopOpacity="0.9" />
                            </LinearGradient>
                        </Defs>

                        <Mask id="mask">
                            <Rect width={width} height={height} fill="white" />
                            <Rect
                                x={isTablet ? (width - ovalWidth) / 3.5 + width * 0.08 : (width - ovalWidth) / 2}
                                y={(height - ovalHeight) / 2}
                                width={ovalWidth}
                                height={ovalHeight}
                                rx={ovalWidth / 2}
                                ry={ovalHeight / 2}
                                fill="black"
                            />
                        </Mask>

                        <Rect width={width} height={height} fill="rgba(0,0,0,0.75)" mask="url(#mask)" />

                        <Rect
                            x={isTablet ? (width - ovalWidth) / 3.5 + width * 0.08 : (width - ovalWidth) / 2}
                            y={(height - ovalHeight) / 2}
                            width={ovalWidth}
                            height={ovalHeight}
                            rx={ovalWidth / 2}
                            ry={ovalHeight / 2}
                            fill="none"
                            stroke="url(#borderGradient)"
                            strokeWidth="5"
                        />
                    </Svg>
                </View>

                {/* Instruction card */}
                <Animated.View
                    style={{
                        position: "absolute",
                        top: 60,
                        left: width * 0.1,
                        right: width * 0.1,
                        backgroundColor: "rgba(17,24,39,0.95)",
                        borderRadius: 20,
                        paddingHorizontal: 24,
                        paddingVertical: 16,
                        borderWidth: 1,
                        borderColor: "rgba(168,85,247,0.3)",
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }}
                >
                    <View className="flex-row items-center">
                        <View className="flex-1">
                            <Text className="text-white text-lg font-bold tracking-wide">
                                {distanceStatus === "Good distance" ? getStepText(step) : distanceStatus}
                            </Text>
                            {distanceStatus === "Good distance" && (
                                <Text className="text-white/70 text-xs mt-0.5">
                                    Follow the instructions carefully
                                </Text>
                            )}
                        </View>
                    </View>
                </Animated.View>

                {/* Progress indicator */}
                <View className="absolute bottom-20 self-center flex-row gap-2 bg-gray-900/80 px-4 py-3 rounded-[20px]">
                    {(["BLINK", "LOOK_UP", "LOOK_DOWN", "RIGHT", "LEFT", "CENTER"] as Step[]).map((s, idx) => {
                        const steps: Step[] = ["BLINK", "LOOK_UP", "LOOK_DOWN", "RIGHT", "LEFT", "CENTER"];
                        const stepIndex = steps.indexOf(step as Step);
                        const isActive = step === s;
                        const isCompleted = stepIndex > idx;

                        return (
                            <View
                                key={s}
                                className={`h-2.5 rounded-full ${isActive
                                    ? 'w-6 bg-blue-500'
                                    : isCompleted
                                        ? 'w-2.5 bg-emerald-500'
                                        : 'w-2.5 bg-white/30'
                                    }`}
                            />
                        );
                    })}
                </View>
            </View>
        </SafeAreaView>
    );
};