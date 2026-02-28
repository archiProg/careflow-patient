import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Text, useWindowDimensions } from "react-native";
import {
    useCameraDevice,
    useCameraPermission,
    Camera as VisionCamera,
} from "react-native-vision-camera";
import { Face, FrameFaceDetectionOptions } from "react-native-vision-camera-face-detector";

import { PREPARE_TIPS, Step } from "@/types/FaceCaptureModel";
import { PrepareScreen } from "./faceCapture/Preparescreen";
import { DoneScreen } from "./faceCapture/Donescreen";
import { ScanScreen } from "./faceCapture/Scanscreen";

interface FaceCaptureCameraProps {
    onCapture: (uri: string) => void;
    IsActive: boolean;
}

export const FaceCaptureCamera: React.FC<FaceCaptureCameraProps> = ({ onCapture, IsActive }) => {
    const { t } = useTranslation();
    const { hasPermission } = useCameraPermission();
    const device = useCameraDevice("front");
    const { width, height } = useWindowDimensions();

    const isTablet = useMemo(() => {
        const aspectRatio = Math.max(width, height) / Math.min(width, height);
        return aspectRatio < 1.8;
    }, [width, height]);

    const ovalWidth  = isTablet ? width * 0.75  : width * 0.8;
    const ovalHeight = isTablet ? height * 0.60 : height * 0.5;

    const cameraRef    = useRef<VisionCamera>(null);
    const fadeAnim     = useRef(new Animated.Value(0)).current;
    const slideAnim    = useRef(new Animated.Value(50)).current;

    // Prepare screen animations
    const prepareFadeAnim  = useRef(new Animated.Value(0)).current;
    const prepareSlideAnim = useRef(new Animated.Value(30)).current;
    const tipAnims         = useRef(PREPARE_TIPS.map(() => new Animated.Value(0))).current;
    const tipSlideAnims    = useRef(PREPARE_TIPS.map(() => new Animated.Value(20))).current;
    const buttonScaleAnim  = useRef(new Animated.Value(0.9)).current;
    const buttonGlowAnim   = useRef(new Animated.Value(0)).current;

    const [step, setStep]                   = useState<Step>("PREPARE");
    const [blinked, setBlinked]             = useState(false);
    const [distanceStatus, setDistanceStatus] = useState("face_scan.distance.good");
    const [cameraActive, setCameraActive]   = useState(false);
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [selected, setSelected]           = useState<number | null>(null);
    const isCapturingRef = useRef(false);

    // ─── Responsive scale ─────────────────────────────────────────────────────
    const rs = useMemo(() => ({
        hPadding:        isTablet ? 56  : 24,
        pTop:            isTablet ? 32  : 16,
        pBottom:         isTablet ? 48  : 24,
        iconSize:        isTablet ? 96  : 64,
        iconFontSize:    isTablet ? 44  : 28,
        iconMB:          isTablet ? 20  : 12,
        titleFontSize:   isTablet ? 30  : 17,
        titleMB:         isTablet ? 10  : 6,
        subFontSize:     isTablet ? 17  : 11,
        subLineHeight:   isTablet ? 26  : 18,
        headerMB:        isTablet ? 36  : 20,
        cardPadding:     isTablet ? 28  : 16,
        cardBorderR:     isTablet ? 28  : 20,
        cardMB:          isTablet ? 32  : 20,
        labelFontSize:   isTablet ? 15  : 11,
        labelMB:         isTablet ? 20  : 12,
        tipPY:           isTablet ? 18  : 10,
        tipIconSize:     isTablet ? 52  : 24,
        tipIconBorderR:  isTablet ? 14  : 10,
        tipIconFontSize: isTablet ? 26  : 11,
        tipIconMR:       isTablet ? 18  : 12,
        tipFontSize:     isTablet ? 18  : 11,
        tipLineHeight:   isTablet ? 28  : 20,
        checkSize:       isTablet ? 32  : 20,
        checkFontSize:   isTablet ? 15  : 10,
        btnHeight:       isTablet ? 72  : 48,
        btnBorderR:      isTablet ? 36  : 20,
        btnFontSize:     isTablet ? 21  : 17,
        btnIconFontSize: isTablet ? 26  : 18,
    }), [isTablet]);

    // ─── Reset on IsActive change ──────────────────────────────────────────────
    useEffect(() => {
        setCapturedImages([]);
        setSelected(null);
        setStep("PREPARE");
        setBlinked(false);
        setDistanceStatus("face_scan.distance.good");
        setCameraActive(false);
    }, [IsActive]);

    useEffect(() => {
        VisionCamera.requestCameraPermission();
    }, []);

    // ─── Prepare screen animations ────────────────────────────────────────────
    useEffect(() => {
        if (step !== "PREPARE") return;

        prepareFadeAnim.setValue(0);
        prepareSlideAnim.setValue(30);
        buttonScaleAnim.setValue(0.9);
        tipAnims.forEach(a => a.setValue(0));
        tipSlideAnims.forEach(a => a.setValue(20));

        Animated.parallel([
            Animated.timing(prepareFadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(prepareSlideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();

        PREPARE_TIPS.forEach((_, i) => {
            Animated.parallel([
                Animated.timing(tipAnims[i],      { toValue: 1, duration: 400, delay: 200 + i * 120, useNativeDriver: true }),
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
    }, [step]);

    // ─── Scan step fade-in animation ──────────────────────────────────────────
    useEffect(() => {
        if (step === "PREPARE") return;
        fadeAnim.setValue(0);
        slideAnim.setValue(50);
        Animated.parallel([
            Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();
    }, [step]);

    // ─── Face detection options ────────────────────────────────────────────────
    const faceDetectionOptions = useMemo<FrameFaceDetectionOptions>(
        () => ({
            performanceMode:    "accurate",
            landmarkMode:       "all",
            contourMode:        "none",
            classificationMode: "all",
            trackingEnabled:    false,
            windowWidth:        Math.max(width, 1),
            windowHeight:       Math.max(height, 1),
        }),
        [width, height]
    );

    // ─── Capture ──────────────────────────────────────────────────────────────
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

    // ─── Step text helper ─────────────────────────────────────────────────────
    const getStepText = (currentStep: Step) => {
        const keys: Record<Step, string> = {
            PREPARE:   "face_scan.step.prepare",
            BLINK:     "face_scan.step.blink",
            LOOK_UP:   "face_scan.step.look_up",
            LOOK_DOWN: "face_scan.step.look_down",
            RIGHT:     "face_scan.step.right",
            LEFT:      "face_scan.step.left",
            CENTER:    "face_scan.step.center",
            DONE:      "face_scan.step.done",
        };
        return t(keys[currentStep]);
    };

    // ─── Face detection handler ───────────────────────────────────────────────
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
        const ovalRadiusX = ovalWidth  / 2;
        const ovalRadiusY = ovalHeight / 2;

        const dx = faceCenterX - ovalCenterX;
        const dy = faceCenterY - ovalCenterY;
        const normalizedDistance =
            (dx * dx) / (ovalRadiusX * ovalRadiusX) +
            (dy * dy) / (ovalRadiusY * ovalRadiusY);

        const isMovementStep  = step === "LOOK_UP" || step === "LOOK_DOWN";
        const OVAL_TOLERANCE  = isMovementStep ? 2.5 : (isTablet ? 1.35 : 1.0);
        const isInsideOval    = normalizedDistance <= OVAL_TOLERANCE;

        const faceToOvalRatio = fh / ovalHeight;
        const minRatio        = isTablet ? 0.40 : 0.55;
        const maxRatio        = isMovementStep ? 1.5 : (isTablet ? 0.90 : 0.80);

        let distanceMsg = "face_scan.distance.good";
        if (!isInsideOval)                       distanceMsg = "face_scan.distance.center_face";
        else if (faceToOvalRatio < minRatio)     distanceMsg = "face_scan.distance.move_closer";
        else if (faceToOvalRatio > maxRatio)     distanceMsg = "face_scan.distance.move_back";

        setDistanceStatus(distanceMsg);

        if (distanceMsg !== "face_scan.distance.good") return;

        const EYE_OPEN  = 0.7;
        const EYE_CLOSE = 0.3;
        const eyeClosed = face.leftEyeOpenProbability  < EYE_CLOSE && face.rightEyeOpenProbability < EYE_CLOSE;
        const eyeOpened = face.leftEyeOpenProbability  > EYE_OPEN  && face.rightEyeOpenProbability > EYE_OPEN;

        if (step === "BLINK") {
            if (eyeClosed) setBlinked(true);
            if (eyeOpened && blinked) { setStep("LOOK_UP"); setBlinked(false); }
        }

        if (step === "LOOK_UP"   && face.pitchAngle >  8) setStep("LOOK_DOWN");
        if (step === "LOOK_DOWN" && face.pitchAngle < -8) setStep("RIGHT");
        if (step === "RIGHT"     && face.yawAngle   < -8) setStep("LEFT");
        if (step === "LEFT"      && face.yawAngle   >  8) setStep("CENTER");

        const centerTolerance = isTablet ? 15 : 10;
        if (step === "CENTER" && Math.abs(face.yawAngle) < centerTolerance) {
            setDistanceStatus("face_scan.distance.hold_still");
            await new Promise(res => setTimeout(res, 1000));
            await captureRandomImages();
        }
    };

    // ─── Guards ────────────────────────────────────────────────────────────────
    if (!hasPermission) return (
        <Text className="text-[#ffffff] text-center text-base mt-12">
            {t("face_scan.error.no_permission")}
        </Text>
    );
    if (!device) return (
        <Text className="text-[#ffffff] text-center text-base mt-12">
            {t("face_scan.error.no_camera")}
        </Text>
    );

    // ─── Screens ──────────────────────────────────────────────────────────────
    if (step === "PREPARE") {
        return (
            <PrepareScreen
                rs={rs}
                isTablet={isTablet}
                prepareFadeAnim={prepareFadeAnim}
                prepareSlideAnim={prepareSlideAnim}
                tipAnims={tipAnims}
                tipSlideAnims={tipSlideAnims}
                onStart={() => { setStep("BLINK"); setCameraActive(true); }}
            />
        );
    }

    if (step === "DONE") {
        return (
            <DoneScreen
                capturedImages={capturedImages}
                selected={selected}
                onSelect={setSelected}
                onConfirm={() => {
                    if (selected !== null && capturedImages[selected]) {
                        onCapture(`file://${capturedImages[selected]}`);
                    }
                }}
            />
        );
    }

    return (
        <ScanScreen
            cameraRef={cameraRef}
            device={device}
            cameraActive={cameraActive}
            fadeAnim={fadeAnim}
            slideAnim={slideAnim}
            faceDetectionOptions={faceDetectionOptions}
            onFacesDetected={handleFacesDetection}
            step={step}
            distanceStatus={distanceStatus}
            getStepText={getStepText}
            width={width}
            height={height}
            isTablet={isTablet}
            ovalWidth={ovalWidth}
            ovalHeight={ovalHeight}
        />
    );
};