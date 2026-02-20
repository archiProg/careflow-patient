import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Animated,
    Image,
    Pressable,
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

export const FaceCaptureCamera: React.FC<FaceCaptureCameraProps> = ({ onCapture, IsActive }) => {
    const { t } = useTranslation();
    const { hasPermission } = useCameraPermission();
    const device = useCameraDevice("front");
    const { width, height } = useWindowDimensions();

    // ย้ายมาคำนวณภายใน component
    const ovalWidth = width * 0.75;
    const ovalHeight = height * 0.55;

    const cameraRef = useRef<VisionCamera>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    const [step, setStep] = useState<Step>("BLINK");
    const [blinked, setBlinked] = useState(false);
    const [distanceStatus, setDistanceStatus] = useState("Good distance");
    const [cameraActive, setCameraActive] = useState(false);

    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [selected, setSelected] = useState<number | null>(null);
    const isCapturingRef = useRef(false);

    useEffect(() => {
        setCapturedImages([]);
        setSelected(null);
        setStep("BLINK");
        setBlinked(false);
        setDistanceStatus("Good distance");
        setCameraActive(false);
    }, [IsActive]);

    useEffect(() => {
        VisionCamera.requestCameraPermission();
    }, []);

    useEffect(() => {
        setCameraActive(IsActive);
    }, [IsActive]);

    // Fade in animation
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
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
        if (!cameraRef.current) return;
        if (isCapturingRef.current) return;

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
        const texts = {
            BLINK: "Blink your eyes",
            LOOK_UP: "Look up",
            LOOK_DOWN: "Look down",
            RIGHT: "Turn right",
            LEFT: "Turn left",
            CENTER: "Look at center",
            DONE: "Done",
        };
        return texts[currentStep];
    };

    const handleFacesDetection = async (faces: Face[]) => {
        if (!cameraActive || !faces?.length) return;

        const face = faces[0];
        const { width: fw, height: fh, x: fx, y: fy } = face.bounds;

        // 1. คำนวณ center ของหน้า
        const faceCenterX = fx + fw / 2;
        const faceCenterY = fy + fh / 2;

        // 2. center ของวงรี
        const ovalCenterX = width / 2;
        const ovalCenterY = height / 2;
        const ovalRadiusX = ovalWidth / 2;
        const ovalRadiusY = ovalHeight / 2;

        // 3. เช็กว่าอยู่ในวงรีหรือไม่
        const dx = faceCenterX - ovalCenterX;
        const dy = faceCenterY - ovalCenterY;
        const normalizedDistance = (dx * dx) / (ovalRadiusX * ovalRadiusX) +
            (dy * dy) / (ovalRadiusY * ovalRadiusY);
        const isInsideOval = normalizedDistance <= 1;

        // 4. คำนวณระยะโดยใช้ความสูงของหน้า
        const faceToOvalRatio = fh / ovalHeight;

        // ปรับค่าตามความเหมาะสม
        const minRatio = 0.55;  // หน้าควรสูงอย่างน้อย 55% ของวงรี
        const maxRatio = 0.80;  // ไม่เกิน 80%

        let distanceMsg = "Good distance";

        if (!isInsideOval) {
            distanceMsg = "Center your face";
        } else if (faceToOvalRatio < minRatio) {
            distanceMsg = `Move closer`;
        } else if (faceToOvalRatio > maxRatio) {
            distanceMsg = `Move back`;
        }

        // Debug log
        console.log('Face ratio:', (faceToOvalRatio * 100).toFixed(1) + '%',
            'Distance:', distanceMsg,
            'Inside oval:', isInsideOval);

        setDistanceStatus(distanceMsg);

        const EYE_OPEN = 0.7;
        const EYE_CLOSE = 0.3;

        const eyeClosed =
            face.leftEyeOpenProbability < EYE_CLOSE &&
            face.rightEyeOpenProbability < EYE_CLOSE;
        const eyeOpened =
            face.leftEyeOpenProbability > EYE_OPEN &&
            face.rightEyeOpenProbability > EYE_OPEN;

        // ต้องอยู่ในระยะที่ดีและในวงรีก่อน
        if (distanceMsg !== "Good distance") return;

        if (step === "BLINK") {
            if (eyeClosed) setBlinked(true);
            if (eyeOpened && blinked) {
                setStep("LOOK_UP");
                setBlinked(false);
            }
        }

        if (step === "LOOK_UP" && face.pitchAngle > 15) setStep("LOOK_DOWN");
        if (step === "LOOK_DOWN" && face.pitchAngle < -10) setStep("RIGHT");
        if (step === "RIGHT" && face.yawAngle < -15) setStep("LEFT");
        if (step === "LEFT" && face.yawAngle > 15) setStep("CENTER");

        if (step === "CENTER" && Math.abs(face.yawAngle) < 10) {
            setDistanceStatus("Perfect! Hold still...");
            await new Promise(res => setTimeout(res, 1000));
            await captureRandomImages();
        }
    };

    if (!hasPermission) return <Text className="text-white text-center text-base mt-12">Camera permission is required.</Text>;
    if (!device) return <Text className="text-white text-center text-base mt-12">No camera device found.</Text>;

    return (
        <SafeAreaView style={StyleSheet.absoluteFill} className="flex-1">
            {step === "DONE" ? (
                <View style={{ flex: 1, padding: 16, backgroundColor: "white" }}>
                    <Text style={{ textAlign: "center", fontSize: 18, marginBottom: 16 }}>
                        {t("select_your_best_photo")}
                    </Text>

                    <View className="flex-1 items-center justify-center ">
                        {selected !== null && capturedImages[selected] && (
                            <Image
                                source={{ uri: `file://${capturedImages[selected]}` }}
                                className="w-full h-full rounded-lg mb-4"
                            />
                        )}
                    </View>
                    <View className="flex justify-end ">
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
                        <View >
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
            ) : (
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
                                    x={(width - ovalWidth) / 2}
                                    y={(height - ovalHeight) / 2}
                                    width={ovalWidth}
                                    height={ovalHeight}
                                    rx={ovalWidth / 2}
                                    ry={ovalHeight / 2}
                                    fill="black"
                                />
                            </Mask>

                            <Rect width={width} height={height} fill="rgba(0,0,0,0.75)" mask="url(#mask)" />

                            {/* Gradient border */}
                            <Rect
                                x={(width - ovalWidth) / 2}
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
                        className="absolute top-[60px] self-center bg-gray-900/95 rounded-[20px] px-6 py-4 min-w-[80%] border border-purple-500/30"
                        style={{
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
                        {["BLINK", "LOOK_UP", "LOOK_DOWN", "RIGHT", "LEFT", "CENTER"].map((s, idx) => {
                            const stepIndex = ["BLINK", "LOOK_UP", "LOOK_DOWN", "RIGHT", "LEFT", "CENTER"].indexOf(step);
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
            )}
        </SafeAreaView>
    );
};