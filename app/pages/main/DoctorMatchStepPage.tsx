import DoctorSpecialtyCard from "@/components/DoctorSpecialtyCard";
import Provider from "@/services/providerService";
import { DoctorSpecialtyModel } from "@/types/DoctorSpecialtyModel";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, useColorScheme, View } from "react-native";

const DoctorMatchStepPage = () => {
    const router = useRouter();
    const specialties = Provider.DoctorSpecialty;
    const colorScheme = useColorScheme();
    const { t } = useTranslation();
    return (
        <View className="flex-1 w-full items-center justify-center p-4">
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
                <Text className="text-xl font-bold text-black dark:text-white">{t('doctor_match')}</Text>
                <View className="flex-row items-center justify-start px-3 rounded-full w-[36px]"></View>
            </View>
            <View className="flex-1 w-full">
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <View className="md:flex-row flex-wrap">
                        {specialties.map((item: DoctorSpecialtyModel) => (
                            <View key={item.id} className="md:w-1/2 p-2">
                                <DoctorSpecialtyCard specialty={item} />
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

export default DoctorMatchStepPage;