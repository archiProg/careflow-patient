
import { loginApi } from "@/api/AuthApi";
import { Pressable, Text, View } from "react-native";

const handleLogin = async () => {
    try {
        const payload = { email: "test@mail.com", password: "1234" };
        const response = await loginApi(payload);

        console.log(response.response);


    } catch (error: any) {
        console.error("Login failed:", error.response?.data || error.message);
    }
};


const LoginCardComp = () => {
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
                    <Pressable onPress={() => handleLogin()} className="flex h-[56px] w-full items-center justify-center px-3 rounded-full bg-blue-500">
                        <Text className="text-white text-md">Login</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

export default LoginCardComp;
