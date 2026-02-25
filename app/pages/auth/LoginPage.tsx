import LoginCardComp from "@/components/LoginCardComp";
import LoginFaceComp from "@/components/LoginFaceComp";
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
  const colorScheme = useColorScheme();
  const [statePage, setStatePage] = useState("main");

  const handleIdCardPage = () => {
    setStatePage("idCard");
  };

  const handleFaceRecognitionPage = () => {
    setStatePage("faceRecognition");
  };

  const handleSignUpPage = () => {
    router.push("/pages/auth/RegistorPage");
  };

  const handleBack = () => {
    setStatePage("main");
  };


  const handleLanguageSelector = () => {
    router.push("/pages/settings/LanguagePage");
  };

  useEffect(() => {
    const backAction = () => {
      if (statePage == "main") {
        return false;
      } else {
        setStatePage("main");
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => backHandler.remove();
  }, [statePage]);

  return (
    <View className="flex-1">
      {statePage === "main" && (
        <View className="flex-1 w-full items-center justify-center">
          <View className="flex flex-row items-center justify-end w-full px-4">
            <Pressable
              className="flex-row items-center justify-center bg-white px-3 py-2 rounded-full shadow"
              onPress={() => handleLanguageSelector()}
            >
              <FontAwesome
                name="globe"
                size={24}
                className=" text-black dark:text-white"
              />
            </Pressable>
          </View>
          <View className="flex-1 h-1/2 items-center justify-center w-full px-4">
            <Text className="text-3xl font-semibold text-center text-black/80 dark:text-gray-500">
              {t("welcome_to_careflow")}
            </Text>
            <Text className="text-md font-semibold text-center text-black/80 dark:text-gray-500 mt-4">
              {t("welcome_to_careflow_description")}
            </Text>
          </View>
          <View className="flex-1 h-1/2 items-center justify-center w-full px-4">
            <Text className="text-xl font-semibold text-center text-black/80 dark:text-gray-500">
              {t("authentication_with")}
            </Text>
            <Pressable
              onPress={handleIdCardPage}
              className="flex items-center justify-center w-full bg-blue-500 h-[56px] rounded-[24px] mt-4"
            >
              <Text className="text-white text-md">{t("id_card")}</Text>
            </Pressable>
            <Pressable
              onPress={handleFaceRecognitionPage}
              className="flex items-center justify-center w-full bg-white border-2 border-blue-500 h-[56px] rounded-[24px] mt-6"
            >
              <Text className="text-blue-500 text-md">{t("face_recognition")}</Text>
            </Pressable>
            <View className="flex flex-row items-center justify-center w-full gap-2 mt-4">
              <Text className="text-md font-semibold text-center text-black/80 dark:text-gray-500">
                {t("don_t_have_an_account")}
              </Text>
              <Pressable onPress={handleSignUpPage}>
                <Text className="text-blue-500">{t("sign_up")}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
      {statePage === "idCard" && (
        <View className="flex-1 w-full h-full px-4">
          <View className="flex flex-row w-full py-4 pb-6 justify-between items-center">
            <Pressable
              className=" flex-row items-center justify-start px-3 rounded-full"
              onPress={() => {
                handleBack();
              }}
            >
              <FontAwesome
                name="angle-left"
                size={36}
                className=" text-black dark:text-white"
                color={colorScheme === "dark" ? "#fff" : "#000"}
              />
            </Pressable>
            <Text className="text-xl font-semibold text-center text-black/80 dark:text-gray-500">
              {t("login_with_id_card")}
            </Text>
            <View className="w-[36px]" />
          </View>
          <LoginCardComp />
        </View>
      )}
      {statePage === "faceRecognition" && (
        <View className="flex-1 w-full h-full">
          <View className="flex w-full py-4 justify-start items-start">
            <Pressable
              className="flex-row items-center justify-start px-3 rounded-full"
              onPress={() => {
                handleBack();
              }}
            >
              <FontAwesome
                name="angle-left"
                size={36}
                className=" text-black dark:text-white"
                color={colorScheme === "dark" ? "#fff" : "#000"}
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
