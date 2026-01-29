import { loginIdCardApi } from "@/api/AuthApi";
import Provider from "@/services/providerService";
import { setToken } from "@/store/authSlice";
import { LoginResponseModel } from "@/types/LoginModel";
import { Dispatch } from "@reduxjs/toolkit";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { useDispatch } from "react-redux";

const LoginCardComp = () => {
  const router = useRouter();
  const [idCard, setIDCard] = useState("1609900493012");
  const dispatch: Dispatch = useDispatch();

  const handleLogin = async () => {
    try {
      const payload = {
        action: "id_card",
        content: {
          id_card: idCard,
        },
      };
      let getResponse: LoginResponseModel;

      const response = await loginIdCardApi(payload);
      if (response.success) {
        getResponse = JSON.parse(response.response);
        if (getResponse.token) {
          dispatch(setToken(getResponse.token));
          Provider.setToken(getResponse.token);
          router.back();
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
          <View className="w-full">
            <Text className="text-md font-bold text-black my-[16px] dark:text-white">
              ID Card
            </Text>
            <TextInput
              className="h-[56px] mb-[16px] rounded-[24px]  border-[1px] border-gray-900 focus:border-[#2196F3] focus:outline-none focus:ring-1 focus:ring-[#2196F3] placeholder:text-gray-400 p-4 
                dark:border-gray-200 dark:text-white"
              placeholder="ID Card"
              keyboardType="numeric"
              value={idCard}
              onChangeText={setIDCard}
            />
          </View>
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
