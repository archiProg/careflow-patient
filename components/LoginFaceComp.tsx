import { loginFaceApi } from "@/api/AuthApi";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
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

  const { hasPermission } = useCameraPermission();
  const device = useCameraDevice("front");
  const cameraRef = useRef<VisionCamera>(null);

  const { width, height } = useWindowDimensions();
  const ovalSize = width * 0.7;

  const [blinked, setBlinked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("กดเริ่มเพื่อสแกนใบหน้า");
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
      windowWidth: width,
      windowHeight: height,
    }),
    [width, height]
  );

  /* ================= Start Scan ================= */
  const startScan = () => {
    setIsScanning(true);
    setStatus("กระพริบตาเพื่อยืนยันตัวตน");
    setBlinked(false);
    setFaceDetected(false);

    timeoutRef.current = setTimeout(() => {
      setIsScanning(false);
      setStatus("หมดเวลา กรุณาลองใหม่");
    }, 10000);
  };

  /* ================= Capture ================= */
  const captureAndLogin = async () => {
    if (!cameraRef.current) return;
    if (isCapturingRef.current) return;

    isCapturingRef.current = true;
    setIsScanning(false);

    try {
      setStatus("กำลังถ่ายภาพ...");

      const photo = await cameraRef.current.takePhoto({ flash: "off" });

      if (!photo?.path) throw new Error("No photo path");

      const file = new File(`file://${photo.path}`);
      const base64 = await file.base64();

      if (!base64) throw new Error("Base64 failed");

      setStatus("กำลังตรวจสอบ...");
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
    setStatus("ตรวจพบใบหน้าแล้ว กรุณากระพริบตา");

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
          setStatus("เข้าสู่ระบบสำเร็จ");
          router.back();
        } else {
          Alert.alert("Login failed", "Invalid token");
        }
      } else {
        Alert.alert("Login failed", "Please try again");
      }
    } catch (error) {
      Alert.alert("Login failed", "Server error");
    } finally {
      setLoading(false);
      setIsScanning(false);
      setBlinked(false);
    }
  };

  if (!hasPermission || !device) {
    return (
      <Text style={{ marginTop: 50, textAlign: "center" }}>
        Camera unavailable
      </Text>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
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
      <View style={StyleSheet.absoluteFill}>
        <Svg width={width} height={height}>
          <Mask id="mask">
            <Rect width={width} height={height} fill="white" />
            <Rect
              x={(width - ovalSize) / 2}
              y={(height - ovalSize) / 2}
              width={ovalSize}
              height={ovalSize}
              rx={ovalSize / 2}
              ry={ovalSize / 2}
              fill="black"
            />
          </Mask>

          <Rect
            width={width}
            height={height}
            fill="rgba(0,0,0,0.7)"
            mask="url(#mask)"
          />
        </Svg>

        {/* วงรีเปลี่ยนสี */}
        <View
          style={{
            position: "absolute",
            top: (height - ovalSize) / 2,
            left: (width - ovalSize) / 2,
            width: ovalSize,
            height: ovalSize,
            borderRadius: ovalSize / 2,
            borderWidth: 4,
            borderColor: faceDetected ? "#00FF88" : "#FFFFFF",
          }}
        />
      </View>

      {/* Status */}
      <View
        style={{
          position: "absolute",
          bottom: 120,
          width: "100%",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 16 }}>{status}</Text>
      </View>

      {/* Start Button */}
      {!isScanning && !loading && (
        <View
          style={{
            position: "absolute",
            bottom: 50,
            width: "100%",
            alignItems: "center",
          }}
        >
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              onPress={startScan}
              style={{
                backgroundColor: "#007AFF",
                paddingHorizontal: 30,
                paddingVertical: 14,
                borderRadius: 30,
              }}
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
                เริ่มสแกนใบหน้า
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {loading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255,255,255,0.7)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <LoadingComp />
        </View>
      )}
    </SafeAreaView>
  );
};

export default LoginFaceComp;