import { authenMeApi } from "@/api/AuthApi";
import LoadingComp from "@/components/LoadingComp";
import Provider from "@/services/providerService";
import { ProfileModel } from "@/types/ProfileModel";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";

const HomePage = () => {
  const token = Provider.Token;
  const router = useRouter();
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
    <View className="flex-1 items-center justify-center">
      {loading ? (
        <LoadingComp></LoadingComp>
      ) : (
        <Text>{Provider.Profile?.name}</Text>
      )}
    </View>
  );
};

export default HomePage;
