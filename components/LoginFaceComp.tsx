import { loginFaceApi } from "@/api/AuthApi";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import LoadingComp from "./LoadingComp";
import { useDispatch } from "react-redux";
import Provider from "@/services/providerService";
import { setToken } from "@/store/authSlice";
import { LoginResponseModel } from "@/types/LoginModel";
import { Dispatch } from "@reduxjs/toolkit";
import { useRouter } from "expo-router";


const LoginFaceComp = () => {
  const cameraRef = useRef<CameraView | null>(null);
  const router = useRouter();
  const dispatch: Dispatch = useDispatch();
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Preparing camera...");

  /* ================= Permission ================= */
  useEffect(() => {
    if (!permission) return;

    if (!permission.granted) {
      requestPermission();
    } else {
      setStatus("Align your face and press Scan");
    }
  }, [permission]);

  /* ================= Capture & Login ================= */
  const handleCapture = async () => {
    if (!cameraRef.current || loading) return;

    try {
      setLoading(true);
      setStatus("Capturing image...");
      console.log("888");

      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.8,
        skipProcessing: true,
      });

      if (!photo.base64) {
        throw new Error("Image capture failed");
      }

      setStatus("Authenticating...");
      console.log("66666");
      await handleAuth(photo.base64);
      console.log("7777");

      setStatus("Login success");
    } catch (err: any) {
      console.log(err);
      Alert.alert("Login failed", err?.message || "Something went wrong");
      setStatus("Try again");
    } finally {
      setLoading(false);
    }
  };

const handleAuth = async (base64: string) => {
  try {
    const response = await loginFaceApi(base64);

    if (response.success) {
      const getResponse: LoginResponseModel = JSON.parse(response.response);

      if (getResponse.token) {
        // ✅ save token
        dispatch(setToken(getResponse.token));
        Provider.setToken(getResponse.token);

        // ✅ กลับหน้าก่อนหน้า
        router.back();
      } else {
        Alert.alert("Login failed", "Please try again");
      }
    } else {
      Alert.alert("Login failed", "Please try again");
    }
  } catch (error: any) {
    console.error("Face login error:", error);
    Alert.alert("Login failed", "Please try again");
  }
};

  /* ================= UI ================= */
  if (!permission) {
    return <Text>Checking camera permission...</Text>;
  }

  if (!permission.granted) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      {/* Camera */}
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front" />

      {/* Face Guide */}
      <View
        style={{
          position: "absolute",
          top: "20%",
          alignSelf: "center",
          width: 260,
          height: 260,
          borderRadius: 130,
          borderWidth: 3,
          borderColor: "#60a5fa",
        }}
      />

      {/* Bottom Panel */}
      <View
        style={{
          position: "absolute",
          bottom: 40,
          width: "100%",
          paddingHorizontal: 24,
        }}
      >
        <TouchableOpacity
          onPress={handleCapture}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#94a3b8" : "#2563eb",
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: "white", fontSize: 18 }}>Scan Face</Text>
          )}
        </TouchableOpacity>

        <Text
          style={{
            textAlign: "center",
            color: "white",
            marginTop: 12,
            fontSize: 14,
          }}
        >
          {status}
        </Text>
      </View>

      {loading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <LoadingComp />
        </View>
      )}
    </View>
  );
};

export default LoginFaceComp;
