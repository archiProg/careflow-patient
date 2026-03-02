import { loginIdCardApi } from "@/api/AuthApi";
import nativeSmartcard from "@/hooks/nativeSmartcard";
import Provider from "@/services/providerService";
import { setToken } from "@/store/authSlice";
import { LoginResponseModel } from "@/types/LoginModel";
import { FontAwesome } from "@expo/vector-icons";
import { Dispatch } from "@reduxjs/toolkit";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  NativeEventEmitter,
  NativeModules,
  Pressable,
  Text,
  TextInput,
  View
} from "react-native";
import { useDispatch } from "react-redux";

const { SmartcardModule } = NativeModules;
const smartcardEmitter = useRef(
  new NativeEventEmitter(NativeModules.SmartcardModule)
).current;

const LoginCardComp = () => {
  const router = useRouter();
  const dispatch: Dispatch = useDispatch();

  const [idCard, setIDCard] = useState("");
  const [status, setStatus] = useState("กรุณาเสียบบัตรประชาชน");
  const isLoggingInRef = useRef(false);
  const lastIdRef = useRef<string | null>(null);
  const waitingForRemoveRef = useRef(false);
  const isReadingRef = useRef(false);

  // 🔥 LOGIN FUNCTION
  const handleLogin = async (cardId: string) => {
    if (isLoggingInRef.current) return;
    if (waitingForRemoveRef.current) return;

    if (lastIdRef.current === cardId) return;

    try {
      isLoggingInRef.current = true;
      lastIdRef.current = cardId;

      setStatus("กำลังเข้าสู่ระบบ...");

      const payload = {
        action: "id_card",
        content: { id_card: cardId },
      };

      const response = await loginIdCardApi(payload);

      if (response.success) {
        const getResponse: LoginResponseModel = JSON.parse(response.response);

        if (getResponse.token) {
          dispatch(setToken(getResponse.token));
          Provider.setToken(getResponse.token);

          // (no polling)
          router.back();
          return;
        }
      }

      // ❌ login fail
      setStatus("เข้าสู่ระบบไม่สำเร็จ กรุณาถอดบัตรแล้วเสียบใหม่");

      waitingForRemoveRef.current = true;
      // (no polling)
    } catch {
      setStatus("เกิดข้อผิดพลาด กรุณาถอดบัตรแล้วเสียบใหม่");
      waitingForRemoveRef.current = true;
      // (no polling)
    } finally {
      isLoggingInRef.current = false;
    }
  };

  // 🔥 READ CARD
  const readSmartcard = async () => {
    if (isReadingRef.current) return;   // 🔒 กันรัว
    try {
      isReadingRef.current = true;
      setStatus("กำลังอ่านบัตร...");
      const result = await nativeSmartcard.readSmartcardData();
      if (result?.citizenId) {
        setIDCard(result.citizenId);
        handleLogin(result.citizenId);
      }
    } finally {
      isReadingRef.current = false;
    }
  };

  useEffect(() => {
    // reset flags
    isLoggingInRef.current = false;
    lastIdRef.current = null;
    waitingForRemoveRef.current = false;
    isReadingRef.current = false;

    try {
      SmartcardModule.startCardMonitor?.(1000);
    } catch { }

    const usbListener = smartcardEmitter.addListener("USB_CONNECTED", () => {
      setStatus("พบเครื่องอ่านบัตร");
    });

    const usbDiscListener = smartcardEmitter.addListener("USB_DISCONNECTED", () => {
      setStatus("ไม่พบเครื่องอ่านบัตร");
      waitingForRemoveRef.current = false;
      lastIdRef.current = null;
      setIDCard("");
    });

    const cardInsertListener = smartcardEmitter.addListener("CARD_INSERTED", () => {
      setStatus("ตรวจพบบัตร กำลังอ่าน...");
      readSmartcard();
    });

    const cardRemoveListener = smartcardEmitter.addListener("CARD_REMOVED", () => {
      setStatus("กรุณาเสียบบัตรประชาชน");
      waitingForRemoveRef.current = false;
      lastIdRef.current = null;
      setIDCard("");
    });

    return () => {
      usbListener.remove();
      usbDiscListener.remove();
      cardInsertListener.remove();
      cardRemoveListener.remove();
    };
  }, []);

  return (
    <View className="flex-1 w-full items-center justify-center px-6">
      <Text className="text-lg font-bold mb-4">{status}</Text>

      <View className="flex flex-row w-full gap-2">
        <TextInput
          className="flex-1 h-[56px]  mb-4 rounded-[24px] border-[1px] border-gray-900 p-4"
          placeholder="ID Card"
          keyboardType="numeric"
          value={idCard}
          onChangeText={setIDCard}
        />
        <Pressable
          onPress={() => readSmartcard()}
          className="h-[56px] items-center justify-center rounded-full"
        >
          <FontAwesome
            name="refresh"
            size={20} color="#6B7280"
          />
        </Pressable>
      </View>

      <Pressable
        onPress={() => handleLogin(idCard)}
        className="h-[56px] w-full items-center justify-center rounded-full bg-blue-500"
      >
        <Text className="text-white">Login</Text>
      </Pressable>


    </View>
  );
};

export default LoginCardComp;
