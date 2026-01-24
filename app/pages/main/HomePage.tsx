import { authenMeApi } from "@/api/AuthApi";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Alert, Text, View } from "react-native";
import { useSelector } from "react-redux";

const HomePage = () => {
  const token = useSelector((state: any) => state.auth.token);

  const router = useRouter();

  const handleAuthenMe = async () => {
    try {
      const response = await authenMeApi(token);
      if (response.success) {
        if (response.response) {
          console.log(response.response);
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

  useEffect(() => {
    handleAuthenMe();
  }, []);

  return (
    <View>
      <Text>HomePage</Text>
    </View>
  );
};

export default HomePage;
