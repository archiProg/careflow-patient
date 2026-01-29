import { CARD } from "@/constants/styles";
import Provider from "@/services/providerService";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
    useColorScheme
} from "react-native";
import DeviceInfo from 'react-native-device-info';



export default function SettingPage() {
    const colorScheme = useColorScheme();
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [biometric, setBiometric] = useState(false);
    const [appVersion, setAppVersion] = useState('');
    const [buildNumber, setBuildNumber] = useState('');
    const router = useRouter();

    const logout = async () => {
        try {
            Provider.Token = "";
            Provider.Profile = null;
            router.replace("/");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    useEffect(() => {
        const appVersion = DeviceInfo.getVersion();
        const buildNumber = DeviceInfo.getBuildNumber();
        setAppVersion(appVersion);
        setBuildNumber(buildNumber);
    }, []);



    return (
        <View className="flex-1 p-4">
            <View className="flex flex-row w-full pb-4 justify-between items-center ">
                <Pressable
                    className="flex-row items-center justify-start px-3 rounded-full"
                    onPress={() => {
                        router.back();
                    }}
                >
                    <FontAwesome
                        name="angle-left"
                        size={36}
                        className=" text-black dark:text-white"
                        color={colorScheme === "dark" ? "#fff" : "#000"}
                    />
                </Pressable>
                <Text className="text-xl font-bold text-black dark:text-white">{t('setting')}</Text>
                <View className="flex-row items-center justify-start px-3 rounded-full w-[36px]"></View>
            </View>
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Header */}
                <View className="flex-row items-center bg-white p-4 dark:bg-gray-800 dark:border-gray-800 dark:border rounded-2xl">
                    {/* Profile Image */}
                    <View className="relative">
                        {Provider.Profile?.profile_image_url ? (
                            <View>
                                <Image
                                    source={{
                                        uri: Provider.HostAPI_URL + Provider.Profile.profile_image_url,
                                    }}
                                    className="absolute w-20 h-20 rounded-2xl"
                                />
                                <View className="w-20 h-20 rounded-2xl bg-blue-500 dark:bg-blue-600 rounded-full items-center justify-center">
                                    <Text className="text-white text-2xl font-bold">{Provider.Profile?.name.charAt(0).toUpperCase()}</Text>
                                </View>
                            </View>
                        ) : (
                            <View className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 dark:from-blue-600 to-purple-500 dark:to-purple-600 items-center justify-center">
                                <FontAwesome name="user-md" size={32} color="" />
                            </View>
                        )}
                    </View>

                    {/* Profile Info */}
                    <View className="flex-1 ml-4">
                        <Text className={`text-black dark:text-white mb-1`}>
                            {Provider.Profile?.name || ""}
                        </Text>
                        <Text
                            className={`${CARD.subtitle} text-gray-500 dark:text-gray-400 mb-1`}
                        >
                            {t("home-screen-id-card")} : {Provider.Profile?.id_card}
                        </Text>

                        <Text
                            className={`${CARD.subtitle} text-gray-500 dark:text-gray-400 mb-1`}
                        >
                            {t("home-screen-blood-type")} : {Provider.Profile?.patient_profile?.blood_group ? Provider.Profile?.patient_profile?.blood_group : "N/A"}
                        </Text>
                    </View>
                </View>

                {/* Account */}
                <View className="mt-6">
                    <Text className="text-xs font-semibold text-gray-500 uppercase px-6 mb-2">
                        {t('account')}
                    </Text>
                    <View className="bg-white dark:bg-gray-800 dark:border-gray-800 dark:border rounded-2xl">
                        <Pressable className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100" onPress={() => router.push("/pages/settings/ManageProfile")}>
                            <View className="flex-row items-center">
                                <FontAwesome name="user" size={20} color="#6B7280" />
                                <Text className="ml-4 text-gray-800 dark:text-white">{t('manage-profile')}</Text>
                            </View>
                            <FontAwesome name="chevron-right" size={16} color="#9CA3AF" />
                        </Pressable>
                        <Pressable className="flex-row items-center justify-between px-6 py-4" onPress={() => router.push("/pages/settings/ChangePasswordPage")}>
                            <View className="flex-row items-center">
                                <FontAwesome name="lock" size={20} color="#6B7280" />
                                <Text className="ml-4 text-gray-800 dark:text-white">{t('change-password')}</Text>
                            </View>
                            <FontAwesome name="chevron-right" size={16} color="#9CA3AF" />
                        </Pressable>
                    </View>
                </View>

                {/* Preferences */}
                <View className="mt-6">
                    <Text className="text-xs font-semibold text-gray-500 uppercase px-6 mb-2">
                        {t('preferences')}
                    </Text>
                    <View className="bg-white dark:bg-gray-800 dark:border-gray-800 dark:border rounded-2xl">
                        <View className="">
                            <Pressable className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
                                <View className="flex-row items-center">
                                    <FontAwesome name="bell" size={20} color="#6B7280" />
                                    <Text className="ml-4 text-gray-800 dark:text-white">{t('notifications')}</Text>
                                </View>
                                <View className={`w-12 h-7 rounded-full ${notifications ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                    <View className={`w-5 h-5 rounded-full bg-white mt-1 ${notifications ? 'ml-6' : 'ml-1'}`} />
                                </View>
                            </Pressable>

                        </View>
                        <View className="">
                            <Pressable className="flex-row items-center justify-between px-6 py-4 " onPress={() => router.push("/pages/settings/LanguagePage")}>
                                <View className="flex-row items-center">
                                    <FontAwesome name="language" size={20} color="#6B7280" />
                                    <Text className="ml-4 text-gray-800 dark:text-white">{t('language')}</Text>
                                </View>
                                <FontAwesome name="chevron-right" size={16} color="#9CA3AF" />
                            </Pressable>
                        </View>
                    </View>

                </View>

                {/* Legal */}
                <View className="mt-6">
                    <Text className="text-xs font-semibold text-gray-500 uppercase px-6 mb-2">
                        {t('legal')}
                    </Text>
                    <View className="bg-white dark:bg-gray-800 dark:border-gray-800 dark:border rounded-2xl">
                        <Pressable className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
                            <View className="flex-row items-center">
                                <FontAwesome name="shield" size={20} color="#6B7280" />
                                <Text className="ml-4 text-gray-800 dark:text-white">{t('privacy-policy')}</Text>
                            </View>
                            <FontAwesome name="chevron-right" size={16} color="#9CA3AF" />
                        </Pressable>
                        <Pressable className="flex-row items-center justify-between px-6 py-4">
                            <View className="flex-row items-center">
                                <FontAwesome name="file-text-o" size={20} color="#6B7280" />
                                <Text className="ml-4 text-gray-800 dark:text-white">{t('terms-conditions')}</Text>
                            </View>
                            <FontAwesome name="chevron-right" size={16} color="#9CA3AF" />
                        </Pressable>
                    </View>
                </View>

                {/* Logout */}
                <View className="mt-6 ">
                    <Pressable
                        onPress={() => {
                            logout();
                        }}
                        className="bg-red-500 py-4 rounded-lg items-center"
                    >
                        <Text className="text-white font-semibold text-base">{t('logout')}</Text>
                    </Pressable>
                </View>

                {/* Version */}
                <View className="items-center py-6 mb-20" >
                    <Text className="text-gray-400 text-sm">
                        {t('version')} {appVersion}
                    </Text>
                </View>
            </ScrollView>
        </View >
    );
}