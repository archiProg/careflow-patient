import LoadingComp from "@/components/LoadingComp";
import { loadLanguage } from "@/hooks/useI18n";
import { RootState } from "@/store";
import { clearAll } from "@/store/authSlice";
import { getJwtExp } from "@/utils/jwt";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";
export default function StartupPage() {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);

  const initApp = async (): Promise<void> => {
    await loadLanguage();

    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (token) {
      if (getJwtExp(token) <= Date.now() / 1000) {
        clearAll();
        router.replace("/pages/auth/LoginPage");
      }
      router.replace("/pages/main/HomePage");
    } else {
      router.replace("/pages/auth/LoginPage");
    }
  };

  useEffect(() => {
    initApp();
  }, [token]);

  return (
    <View className="flex-1 justify-center items-center">
      <LoadingComp />
    </View>
  );
}
