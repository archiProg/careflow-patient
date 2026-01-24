import { loginIdCardApi } from "@/api/AuthApi";
import { setToken } from "@/store/authSlice";
import { LoginResponseModel } from "@/types/LoginModel";
import { Dispatch } from "@reduxjs/toolkit";
import { useRouter } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import { useDispatch } from "react-redux";
const LoginCardComp = () => {
  const router = useRouter();

  const dispatch: Dispatch = useDispatch();

  const handleLogin = async () => {
    try {
      const payload = {
        action: "id_card",
        content: {
          id_card: "1609900493012",
        },
      };
      let getResponse: LoginResponseModel;

      const response = await loginIdCardApi(payload);
      if (response.success) {
        getResponse = JSON.parse(response.response);
        dispatch(setToken(getResponse.token));
        if (getResponse.token) {
          router.replace("/pages/main/HomePage");
        } else {
          Alert.alert("Login failed", "Please try again");
        }
      } else {
        Alert.alert("Login failed", "Please try again");
      }
    } catch (error: any) {
      Alert.alert("Login failed", "Please try again");
    }
  };

  return (
    <View className="flex-1 w-full h-full items-center justify-center">
      <View className="w-full h-1/2 items-center justify-center">
        <View className="w-full h-full items-center justify-start">
          <Text className="text-xl font-semibold text-center text-black/80 dark:text-gray-500">
            Login with ID Card
          </Text>
        </View>
      </View>
      <View className="w-full h-1/2 items-center justify-center mb-10">
        <View className="w-full h-full items-center justify-end">
          <Pressable
            onPress={() => handleLogin()}
            className="flex h-[56px] w-full items-center justify-center px-3 rounded-full bg-blue-500"
          >
            <Text className="text-white text-md">Login</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default LoginCardComp;
