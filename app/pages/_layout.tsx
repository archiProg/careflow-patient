


import Provider from "@/services/providerService";
import { clearConsultResume, setConsultResume } from "@/store/recall";
import { CaseResumePayload } from "@/types/DoctorConsultModel";
import {
    closeSocket,
    getSocket,
    listenSocket,
    offSocket
} from "@/utils/socket";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { Alert, useColorScheme, View } from "react-native";
import { useDispatch } from "react-redux";

export default function MainLayout() {
    const router = useRouter();
    const dispatch = useDispatch();
    const token = Provider.Token;
    const colorScheme = useColorScheme();

    useEffect(() => {
        console.log("token", token);
    }, [token]);

    useEffect(() => {
        if (token) {
            getSocket();
            listenSocket({
                "case:ended": () => {
                    dispatch(clearConsultResume());
                },
                "case:resume": (data: CaseResumePayload) => {
                    dispatch(setConsultResume(data));
                },
                "force-logout": () => {
                    Alert.alert(
                        "ออกจากระบบ",
                        "บัญชีของคุณถูกออกจากระบบจากอุปกรณ์อื่น",
                        [
                            {
                                text: "ตกลง",
                                onPress: async () => {
                                    closeSocket();
                                    Provider.setProfile(null);
                                    Provider.setToken("");
                                    router.replace("/");
                                },
                            },
                        ]
                    );
                },

            });

            return () => {
                offSocket("case:ended");
                offSocket("case:resume");
                offSocket("force-logout");
            };
        }
        else {
            closeSocket();
        }
    }, [token]);







    return (
        <View className="flex-1 bg-white dark:bg-gray-900">
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: {
                        backgroundColor: colorScheme === "dark" ? "#111827" : "#fff"
                    },
                }}
            />
        </View>
    );
}
