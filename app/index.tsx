import LoadingComp from "@/components/LoadingComp";
import { loadLanguage } from "@/hooks/useI18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
export default function StartupPage() {
  const router = useRouter();


  const initApp = async (): Promise<void> => {
    await loadLanguage();

    const token = await AsyncStorage.getItem("token");

    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (token) {
      router.replace("/pages/main/HomePage");
    } else {
      router.replace("/pages/auth/LoginPage");
    }

  };

  useEffect(() => {
    initApp();
  }, []);

  return (
    <View className="flex-1 justify-center items-center">
      <LoadingComp />
    </View>
  );
}

