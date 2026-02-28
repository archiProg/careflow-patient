import { loginFaceApi } from "@/api/AuthApi";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import Provider from "@/services/providerService";
import { setToken } from "@/store/authSlice";
import { LoginResponseModel } from "@/types/LoginModel";
import { Dispatch } from "@reduxjs/toolkit";
import { useRouter } from "expo-router";
import { File } from "expo-file-system";
import LoadingComp from "./LoadingComp";
import { useTranslation } from "react-i18next";

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
import Svg, { Mask, Rect } from "react-native-svg";

const LoginFaceComp = () => {
  const dispatch: Dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation();

  const { hasPermission } = useCameraPermission();
  const device = useCameraDevice("front");
  const cameraRef = useRef<VisionCamera>(null);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const ovalSize = containerSize.width * 0.8;
  const ovalTop = (containerSize.height - ovalSize) / 3;
  const ovalLeft = (containerSize.width - ovalSize) / 2;

  const [blinked, setBlinked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(t("face.pressToScan"));
  const [isScanning, setIsScanning] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

  const isCapturingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /* ================= Pulse Animation ================= */
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /* ================= Permission ================= */
  useEffect(() => {
    VisionCamera.requestCameraPermission();
  }, []);

  /* ================= Face Detection Options ================= */
  const faceDetectionOptions = useMemo<FrameFaceDetectionOptions>(
    () => ({
      performanceMode: "accurate",
      landmarkMode: "all",
      classificationMode: "all",
      trackingEnabled: false,
      windowWidth: containerSize.width,
      windowHeight: containerSize.height,
    }),
    [containerSize]
  );

  /* ================= Start Scan ================= */
  const startScan = () => {
    setIsScanning(true);
    setStatus(t("face.blinkToVerify"));
    setBlinked(false);
    setFaceDetected(false);

    timeoutRef.current = setTimeout(() => {
      setIsScanning(false);
      setStatus(t("face.timeout"));
    }, 10000);
  };

  /* ================= Capture ================= */
  const captureAndLogin = async () => {
    if (!cameraRef.current) return;
    if (isCapturingRef.current) return;

    isCapturingRef.current = true;
    setIsScanning(false);

    try {
      setStatus(t("face.takingPhoto"));

      const photo = await cameraRef.current.takePhoto({ flash: "off" });

      if (!photo?.path) throw new Error("No photo path");

      const file = new File(`file://${photo.path}`);
      const base64 = await file.base64();

      if (!base64) throw new Error("Base64 failed");

      setStatus(t("face.verifying"));
      setLoading(true);

      await handleAuth(base64);
    } catch (err) {
      console.error("Capture error:", err);
      setLoading(false);
    } finally {
      isCapturingRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  };

  /* ================= Face Detection ================= */
  const handleFacesDetection = async (faces: Face[]) => {
    if (!isScanning || loading) return;

    if (!faces?.length) {
      setFaceDetected(false);
      return;
    }

    const face = faces[0];
    setFaceDetected(true);
    setStatus(t("face.faceDetectedBlink"));

    const EYE_OPEN = 0.7;
    const EYE_CLOSE = 0.3;

    const eyeClosed =
      face.leftEyeOpenProbability < EYE_CLOSE &&
      face.rightEyeOpenProbability < EYE_CLOSE;

    const eyeOpened =
      face.leftEyeOpenProbability > EYE_OPEN &&
      face.rightEyeOpenProbability > EYE_OPEN;

    if (eyeClosed) setBlinked(true);

    if (eyeOpened && blinked) {
      await captureAndLogin();
    }
  };

  /* ================= Login ================= */
  const handleAuth = async (base64: string) => {
    try {
      const response = await loginFaceApi(base64);
      console.log(response);

      if (response.success) {
        const getResponse: LoginResponseModel = JSON.parse(response.response);

        if (getResponse.token) {
          dispatch(setToken(getResponse.token));
          Provider.setToken(getResponse.token);
          setStatus(t("face.loginSuccess"));
          router.back();
        } else {
          Alert.alert(t("face.loginFailed"), t("face.invalidToken"));
        }
      } else {
        Alert.alert(t("face.loginFailed"), t("face.tryAgain"));
      }
    } catch (error) {
      Alert.alert(t("face.loginFailed"), t("face.serverError"));
    } finally {
      setLoading(false);
      setIsScanning(false);
      setBlinked(false);
    }
  };

  if (!hasPermission || !device) {
    return (
      <Text className="mt-12 text-center">{t("face.cameraUnavailable")}</Text>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View
        className="flex-1"
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setContainerSize({ width, height });
        }}
      >
        {containerSize.width > 0 && (
          <>
            <Camera
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={!loading}
              photo
              faceDetectionCallback={handleFacesDetection}
              faceDetectionOptions={faceDetectionOptions}
            />

            {/* ===== Overlay ===== */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <Svg width={containerSize.width} height={containerSize.height}>
                <Mask id="mask">
                  <Rect width={containerSize.width} height={containerSize.height} fill="white" />
                  <Rect
                    x={ovalLeft}
                    y={ovalTop}
                    width={ovalSize}
                    height={ovalSize}
                    rx={ovalSize / 2}
                    ry={ovalSize / 2}
                    fill="black"
                  />
                </Mask>
                <Rect
                  width={containerSize.width}
                  height={containerSize.height}
                  fill="rgba(0,0,0,0.7)"
                  mask="url(#mask)"
                />
              </Svg>

              <View
                style={{
                  position: "absolute",
                  top: ovalTop,
                  left: ovalLeft,
                  width: ovalSize,
                  height: ovalSize,
                  borderRadius: ovalSize / 2,
                  borderWidth: 4,
                  borderColor: faceDetected ? "#00FF88" : "#FFFFFF",
                }}
              />
            </View>

            {/* Status */}
            <View className="absolute bottom-[18%] w-full items-center" pointerEvents="none">
              <Text className="text-white text-base">{status}</Text>
            </View>

            {/* Start Button */}
            {!isScanning && !loading && (
              <View className="absolute bottom-[6%] w-full items-center" pointerEvents="box-none">
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <TouchableOpacity
                    onPress={startScan}
                    className="bg-blue-500 px-8 py-4 rounded-[30px]"
                  >
                    <Text className="text-white text-base font-bold">
                      {t("face.startScan")}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            )}

            {/* Loading */}
            {loading && (
              <View className="absolute inset-0 bg-white/70 justify-center items-center">
                <LoadingComp />
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default LoginFaceComp;