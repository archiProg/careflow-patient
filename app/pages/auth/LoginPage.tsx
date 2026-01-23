import LoginCardComp from "@/components/LoginCardComp";
import LoginFaceComp from "@/components/LoginFaceComp";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, useColorScheme, View } from "react-native";

const LoginPage = () => {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const [statePage, setStatePage] = useState('main');

    const handleMainPage = () => {
        setStatePage('main');
    };

    const handleIdCardPage = () => {
        setStatePage('idCard');
    };

    const handleFaceRecognitionPage = () => {
        setStatePage('faceRecognition');
    };

    const handleSignUpPage = () => {
        router.push('/pages/auth/RegistorPage');
    };

    const handleBack = () => {
        setStatePage('main');
    };

    return (
        <View className="flex-1">
            {statePage === 'main' && (
                <View className="flex-1 w-full items-center justify-center">
                    <View className="flex-1 h-1/2 items-center justify-center w-full px-4">
                        <Text className="text-3xl font-semibold text-center text-black/80 dark:text-gray-500">Welcome to CareFlow</Text>
                        <Text className="text-md font-semibold text-center text-black/80 dark:text-gray-500 mt-4">A better way to stay connected</Text>
                    </View>
                    <View className="flex-1 h-1/2 items-center justify-center w-full px-4">
                        <Text className="text-xl font-semibold text-center text-black/80 dark:text-gray-500">Authentication with</Text>
                        <Pressable onPress={handleIdCardPage} className="flex items-center justify-center w-full bg-blue-500 h-[56px] rounded-[24px] mt-4">
                            <Text className="text-white text-md">ID Card</Text>
                        </Pressable>
                        <Pressable onPress={handleFaceRecognitionPage} className="flex items-center justify-center w-full bg-white border-2 border-blue-500 h-[56px] rounded-[24px] mt-6">
                            <Text className="text-blue-500 text-md">Face Recognition</Text>
                        </Pressable>
                        <View className="flex flex-row items-center justify-center w-full gap-2 mt-4">
                            <Text className="text-md font-semibold text-center text-black/80 dark:text-gray-500">Don't have an account?
                            </Text>
                            <Pressable onPress={handleSignUpPage}><Text className="text-blue-500">Sign Up</Text></Pressable>
                        </View>
                    </View>
                </View>
            )}
            {statePage === 'idCard' && (
                <View className="flex-1 w-full h-full px-4">
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
                    <LoginCardComp />
                </View>
            )}
            {statePage === 'faceRecognition' && (
                <View className="flex-1 w-full h-full px-4">
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