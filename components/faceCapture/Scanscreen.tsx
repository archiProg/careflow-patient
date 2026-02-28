import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import Svg, { Defs, LinearGradient, Mask, Rect, Stop } from "react-native-svg";
import { Camera as VisionCamera } from "react-native-vision-camera";
import {
    Camera,
    Face,
    FrameFaceDetectionOptions,
} from "react-native-vision-camera-face-detector";
import { Step } from "@/types/FaceCaptureModel";

interface ScanScreenProps {
    cameraRef: React.RefObject<VisionCamera>;
    device: NonNullable<ReturnType<typeof import("react-native-vision-camera").useCameraDevice>>;
    cameraActive: boolean;
    fadeAnim: Animated.Value;
    slideAnim: Animated.Value;
    faceDetectionOptions: FrameFaceDetectionOptions;
    onFacesDetected: (faces: Face[]) => void;
    step: Step;
    distanceStatus: string;
    getStepText: (step: Step) => string;
    width: number;
    height: number;
    isTablet: boolean;
    ovalWidth: number;
    ovalHeight: number;
}

const SCAN_STEPS: Step[] = ["BLINK", "LOOK_UP", "LOOK_DOWN", "RIGHT", "LEFT", "CENTER"];

export const ScanScreen: React.FC<ScanScreenProps> = ({
    cameraRef,
    device,
    cameraActive,
    fadeAnim,
    slideAnim,
    faceDetectionOptions,
    onFacesDetected,
    step,
    distanceStatus,
    getStepText,
    width,
    height,
    isTablet,
    ovalWidth,
    ovalHeight,
}) => {
    const { t } = useTranslation();

    const ovalX = isTablet
        ? (width - ovalWidth) / 3.5 + width * 0.08
        : (width - ovalWidth) / 2;
    const ovalY = (height - ovalHeight) / 2;
    const stepIndex = SCAN_STEPS.indexOf(step as Step);
    const isGoodDistance = distanceStatus === "face_scan.distance.good";

    return (
        <SafeAreaView style={StyleSheet.absoluteFill} className="flex-1 bg-[#ffffff]">
            <View className="flex-1">
                <Camera
                    ref={cameraRef}
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={cameraActive}
                    photo
                    faceDetectionCallback={onFacesDetected}
                    faceDetectionOptions={faceDetectionOptions}
                />

                {/* Oval overlay */}
                <View className="absolute inset-0">
                    <Svg width={width} height={height}>
                        <Defs>
                            <LinearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <Stop offset="0%"   stopColor="#3b82f6" stopOpacity="0.9" />
                                <Stop offset="50%"  stopColor="#8b5cf6" stopOpacity="0.9" />
                                <Stop offset="100%" stopColor="#ec4899" stopOpacity="0.9" />
                            </LinearGradient>
                        </Defs>

                        <Mask id="mask">
                            <Rect width={width} height={height} fill="white" />
                            <Rect
                                x={ovalX} y={ovalY}
                                width={ovalWidth} height={ovalHeight}
                                rx={ovalWidth / 2} ry={ovalHeight / 2}
                                fill="black"
                            />
                        </Mask>

                        <Rect width={width} height={height} fill="rgba(0,0,0,0.75)" mask="url(#mask)" />

                        <Rect
                            x={ovalX} y={ovalY}
                            width={ovalWidth} height={ovalHeight}
                            rx={ovalWidth / 2} ry={ovalHeight / 2}
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
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }}
                    className="bg-[#111827] rounded-[20px] px-6 py-4 border border-[#6d28d9]"
                >
                    <View className="flex-row items-center">
                        <View className="flex-1">
                            <Text className="text-[#ffffff] text-lg font-bold tracking-wide">
                                {isGoodDistance ? getStepText(step) : t(distanceStatus)}
                            </Text>
                            {isGoodDistance && (
                                <Text className="text-[#ffffff99] text-xs mt-0.5">
                                    {t("face_scan.instruction_hint")}
                                </Text>
                            )}
                        </View>
                    </View>
                </Animated.View>

                {/* Progress indicator */}
                <View className="absolute bottom-20 self-center flex-row gap-2 bg-[#111827] px-4 py-3 rounded-[20px]">
                    {SCAN_STEPS.map((s, idx) => {
                        const isActive    = step === s;
                        const isCompleted = stepIndex > idx;
                        return (
                            <View
                                key={s}
                                className={`h-2.5 rounded-full ${
                                    isActive    ? "w-6 bg-[#3b82f6]"   :
                                    isCompleted ? "w-2.5 bg-[#10b981]" :
                                                  "w-2.5 bg-[#ffffff4d]"
                                }`}
                            />
                        );
                    })}
                </View>
            </View>
        </SafeAreaView>
    );
};