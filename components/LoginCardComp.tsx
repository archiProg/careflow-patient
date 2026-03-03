import { loginIdCardApi } from "@/api/AuthApi";
import nativeSmartcard from "@/hooks/nativeSmartcard";
import Provider from "@/services/providerService";
import { setToken } from "@/store/authSlice";
import { LoginResponseModel } from "@/types/LoginModel";
import { Colors } from "@/constants/theme";
import { FontAwesome } from "@expo/vector-icons";
import { Dispatch } from "@reduxjs/toolkit";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  NativeEventEmitter,
  NativeModules,
  Pressable,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { useDispatch } from "react-redux";

const { SmartcardModule } = NativeModules;

const LoginCardComp = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch: Dispatch = useDispatch();

  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const smartcardEmitter = useRef(
    new NativeEventEmitter(SmartcardModule)
  ).current;

  const [idCard, setIDCard] = useState("");
  const [status, setStatus] = useState(t("card.insert_prompt"));

  const isLoggingInRef = useRef(false);
  const lastIdRef = useRef<string | null>(null);
  const waitingForRemoveRef = useRef(false);
  const isReadingRef = useRef(false);

  const handleLogin = async (cardId: string) => {
    if (isLoggingInRef.current) return;
    if (waitingForRemoveRef.current) return;
    if (lastIdRef.current === cardId) return;

    try {
      isLoggingInRef.current = true;
      lastIdRef.current = cardId;

      setStatus(t("card.logging_in"));

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
          router.back();
          return;
        }
      }

      setStatus(t("card.login_failed"));
      waitingForRemoveRef.current = true;
    } catch {
      setStatus(t("card.error_retry"));
      waitingForRemoveRef.current = true;
    } finally {
      isLoggingInRef.current = false;
    }
  };

  const readSmartcard = async () => {
    if (isReadingRef.current) return;

    try {
      isReadingRef.current = true;
      setStatus(t("card.reading"));

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
    isLoggingInRef.current = false;
    lastIdRef.current = null;
    waitingForRemoveRef.current = false;
    isReadingRef.current = false;

    try {
      SmartcardModule.startCardMonitor?.(1000);
    } catch {}

    const usbListener = smartcardEmitter.addListener(
      "USB_CONNECTED",
      () => setStatus(t("card.reader_found"))
    );

    const usbDiscListener = smartcardEmitter.addListener(
      "USB_DISCONNECTED",
      () => {
        setStatus(t("card.reader_not_found"));
        waitingForRemoveRef.current = false;
        lastIdRef.current = null;
        setIDCard("");
      }
    );

    const cardInsertListener = smartcardEmitter.addListener(
      "CARD_INSERTED",
      () => {
        setStatus(t("card.detected_reading"));
        readSmartcard();
      }
    );

    const cardRemoveListener = smartcardEmitter.addListener(
      "CARD_REMOVED",
      () => {
        setStatus(t("card.insert_prompt"));
        waitingForRemoveRef.current = false;
        lastIdRef.current = null;
        setIDCard("");
      }
    );

    return () => {
      usbListener.remove();
      usbDiscListener.remove();
      cardInsertListener.remove();
      cardRemoveListener.remove();
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        backgroundColor: theme.background,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 16,
          color: theme.text,
        }}
      >
        {status}
      </Text>

      <View
        style={{
          flexDirection: "row",
          width: "100%",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <TextInput
          style={{
            flex: 1,
            height: 56,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: theme.border,
            paddingHorizontal: 16,
            color: theme.text,
            backgroundColor: theme.card,
          }}
          placeholder="ID Card"
          placeholderTextColor={theme.icon}
          keyboardType="numeric"
          value={idCard}
          onChangeText={setIDCard}
        />

        <Pressable
          onPress={() => setIDCard("")}
          style={{
            height: 56,
            width: 56,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FontAwesome
            name="refresh"
            size={20}
            color={theme.icon}
          />
        </Pressable>
      </View>

      <Pressable
        onPress={() => handleLogin(idCard)}
        style={{
          height: 56,
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 999,
          backgroundColor: theme.primary,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          {t("login")}
        </Text>
      </Pressable>
    </View>
  );
};

export default LoginCardComp;