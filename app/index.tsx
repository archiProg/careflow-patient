import { authenMeApi } from "@/api/AuthApi";
import { getDoctorSpecialty } from "@/api/UserApi";
import LoadingComp from "@/components/LoadingComp";
import { loadLanguage } from "@/hooks/useI18n";
import Provider from "@/services/providerService";
import { DoctorSpecialtyModel } from "@/types/DoctorSpecialtyModel";
import { ProfileModel } from "@/types/ProfileModel";
import { getJwtExp } from "@/utils/jwt";
import { closeSocket, getSocket } from "@/utils/socket";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Alert, View } from "react-native";

export default function StartupPage() {
  const router = useRouter();
  const token = Provider.Token;

  const initApp = async (): Promise<void> => {
    await loadLanguage();

    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (token) {
      if (getJwtExp(token) <= Date.now() / 1000) {
        Provider.setProfile(null);
        Provider.setToken("");
        router.push("/pages/auth/LoginPage");
      } else {
        router.replace("/pages/main/HomePage");
      }
    } else {
      router.push("/pages/auth/LoginPage");
    }
  };

  const handleAuthenMe = async () => {
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
    }
  };


  const handleDoctorSpecialty = async () => {
    try {
      const response = await getDoctorSpecialty(token);
      let getResponse: DoctorSpecialtyModel[];
      if (response.success) {
        if (response.response) {
          getResponse = JSON.parse(response.response);

          Provider.setDoctorSpecialty(getResponse);
        } else {
          Alert.alert("Doctor specialty failed", "Please try again");
        }
      } else {
        Alert.alert("Doctor specialty failed", "Please try again");
      }
    } catch (error: any) {
      Alert.alert("Doctor specialty failed", "Please try again");
    }
  };

  useEffect(() => {
    initApp();
  }, [token]);

  useEffect(() => {
    if (token) {
      getSocket();
      handleAuthenMe();
      handleDoctorSpecialty();
    }
    else {
      closeSocket();
    }
  }, [token]);

  return (
    <View className="flex-1 justify-center items-center">
      <LoadingComp />
    </View>
  );
}
