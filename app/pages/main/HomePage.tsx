import { authenMeApi } from "@/api/AuthApi";
import LoadingComp from "@/components/LoadingComp";
import { TEXT_SIZE } from "@/constants/styles";
import Provider from "@/services/providerService";
import { ProfileModel } from "@/types/ProfileModel";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Text, View } from "react-native";

const HomePage = () => {
  const token = Provider.Token;
  const router = useRouter();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);

  const handleAuthenMe = async () => {
    setLoading(true);
    try {
      const response = await authenMeApi(token);
      let getResponse: ProfileModel;
      if (response.success) {
        if (response.response) {
          getResponse = JSON.parse(response.response);
          Provider.setProfile(getResponse);
        } else {
          Alert.alert("Authen failed", "Please try again");
          router.replace("/pages/auth/LoginPage");
        }
      } else {
        Alert.alert("Authen failed", "Please try again");
        router.replace("/pages/auth/LoginPage");
      }
    } catch (error: any) {
      Alert.alert("Authen failed", "Please try again");
      router.replace("/pages/auth/LoginPage");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleAuthenMe();
  }, []);

  return (
    <View className="flex-1 w-full items-center justify-center">
      {loading ? (
        <LoadingComp></LoadingComp>
      ) : (
        <View className="flex-1 w-full items-center justify-center bg-red-500">
          {/* Greeting Section */}
          <View className="pt-4 pb-6">
            <Text className={`${TEXT_SIZE.default} text-gray-500 dark:text-gray-400 mb-1`}>
              {new Date().getHours() < 12
                ? t("home-screen-good-morning")
                : new Date().getHours() < 18
                  ? t("home-screen-good-afternoon")
                  : t("home-screen-good-evening")}
            </Text>
            <Text className={`${TEXT_SIZE.big} font-bold text-black dark:text-white`}>
              {t("home-screen-welcome")}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default HomePage;
