import LoginCardComp from "@/components/LoginCardComp";
import LoginFaceComp from "@/components/LoginFaceComp";
import { Colors } from "@/constants/theme";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BackHandler,
  Pressable,
  Text,
  useColorScheme,
  View,
} from "react-native";

const LoginPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const [statePage, setStatePage] = useState("main");

  const handleIdCardPage = () => setStatePage("idCard");
  const handleFaceRecognitionPage = () => setStatePage("faceRecognition");
  const handleSignUpPage = () => router.push("/pages/auth/RegistorPage");
  const handleBack = () => setStatePage("main");
  const handleLanguageSelector = () =>
    router.push("/pages/settings/LanguagePage");

  useEffect(() => {
    const backAction = () => {
      if (statePage === "main") return false;
      setStatePage("main");
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [statePage]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {statePage === "main" && (
        <View style={{ flex: 1, justifyContent: "center" }}>
          {/* Language Button */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              paddingHorizontal: 16,
              paddingTop: 16,
            }}
          >
            <Pressable
              onPress={handleLanguageSelector}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.card,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <FontAwesome
                name="globe"
                size={22}
                color={theme.icon}
              />
            </Pressable>
          </View>

          {/* Welcome Section */}
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              paddingHorizontal: 24,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: "600",
                textAlign: "center",
                color: theme.text,
                marginBottom: 16,
              }}
            >
              {t("welcome_to_careflow")}
            </Text>

            <Text
              style={{
                fontSize: 16,
                textAlign: "center",
                color: theme.text,
                opacity: 0.7,
              }}
            >
              {t("welcome_to_careflow_description")}
            </Text>
          </View>

          {/* Authentication Section */}
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              paddingHorizontal: 24,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                textAlign: "center",
                color: theme.text,
                marginBottom: 20,
              }}
            >
              {t("authentication_with")}
            </Text>

            {/* ID Card Button */}
            <Pressable
              onPress={handleIdCardPage}
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                backgroundColor: theme.primary,
                height: 56,
                borderRadius: 24,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16 }}>
                {t("id_card")}
              </Text>
            </Pressable>

            {/* Face Recognition Button */}
            <Pressable
              onPress={handleFaceRecognitionPage}
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                backgroundColor: theme.card,
                borderWidth: 2,
                borderColor: theme.primary,
                height: 56,
                borderRadius: 24,
                marginTop: 20,
              }}
            >
              <Text
                style={{
                  color: theme.primary,
                  fontSize: 16,
                }}
              >
                {t("face_recognition")}
              </Text>
            </Pressable>

            {/* Sign Up */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: theme.text,
                  opacity: 0.7,
                }}
              >
                {t("don_t_have_an_account")}{" "}
              </Text>

              <Pressable onPress={handleSignUpPage}>
                <Text
                  style={{
                    color: theme.primary,
                    fontWeight: "600",
                  }}
                >
                  {t("sign_up")}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* ID Card Page */}
      {statePage === "idCard" && (
        <View
          style={{
            flex: 1,
            paddingHorizontal: 16,
            backgroundColor: theme.background,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 16,
              justifyContent: "space-between",
            }}
          >
            <Pressable onPress={handleBack}>
              <FontAwesome
                name="angle-left"
                size={36}
                color={theme.icon}
              />
            </Pressable>

            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: theme.text,
              }}
            >
              {t("login_with_id_card")}
            </Text>

            <View style={{ width: 36 }} />
          </View>

          <LoginCardComp />
        </View>
      )}

      {/* Face Recognition Page */}
      {statePage === "faceRecognition" && (
        <View
          style={{
            flex: 1,
            backgroundColor: theme.background,
          }}
        >
          <View
            style={{
              paddingVertical: 16,
              paddingHorizontal: 16,
            }}
          >
            <Pressable onPress={handleBack}>
              <FontAwesome
                name="angle-left"
                size={36}
                color={theme.icon}
              />
            </Pressable>
          </View>

          <LoginFaceComp />
        </View>
      )}
    </View>
  );
};

export default LoginPage;