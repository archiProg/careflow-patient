import ActionCard from "@/components/ActionCard";
import { CARD, TEXT_SIZE } from "@/constants/styles";
import Provider from "@/services/providerService";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Image, ScrollView, Text, TouchableOpacity, View, useColorScheme } from "react-native";

const HomePage = () => {
  const token = Provider.Token;
  const colorScheme = useColorScheme();

  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View className="flex-1 w-full items-center justify-center">
      <View className="flex-1 w-full p-4">
        <ScrollView className="flex-1 px-2" showsVerticalScrollIndicator={false}>
          {/* Greeting Section */}
          <View className="flex flex-row justify-between items-center pt-4 pb-6">
            <View>
              <Text className={`${TEXT_SIZE.default} text-gray-500 dark:text-gray-400 mb-1`}>
                {new Date().getHours() < 12
                  ? t("home-screen-good-morning")
                  : new Date().getHours() < 18
                    ? t("home-screen-good-afternoon")
                    : t("home-screen-good-evening")}
              </Text>
              <Text className={`${TEXT_SIZE.big} font-bold text-black dark:text-white`}>
                {t("home-screen-welcome")}
              </Text>
            </View>
            <View>
              <TouchableOpacity onPress={() => router.push("/pages/main/SettingPage")}>
                <FontAwesome name="gear" size={24} color={colorScheme === "dark" ? "#fff" : "#000"}
                />

              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Card */}
          <View
            className={`${CARD.body} bg-white border-gray-100 dark:bg-gray-700 dark:border-gray-700 shadow-md`}
          >
            <View className="flex-row items-center">
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
                    <View className="w-20 h-20 rounded-2xl bg-blue-500 rounded-full items-center justify-center">
                      <Text className="text-white text-2xl font-bold">{Provider.Profile?.name.charAt(0).toUpperCase()}</Text>
                    </View>
                  </View>
                ) : (
                  <View className="w-20 h-20 rounded-2xl bg-blue-500 rounded-full items-center justify-center">
                    <Text className="text-white text-2xl font-bold">{Provider.Profile?.name.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
              </View>
              {/* Profile Info */}
              <View className="flex-1 ml-4">
                <Text className={`${CARD.title} text-black dark:text-white mb-1`}>
                  {Provider.Profile?.name}
                </Text>
                <Text
                  className={`${CARD.subtitle} text-gray-500 dark:text-gray-400 mb-1`}
                >
                  {t("home-screen-id-card")} : {Provider.Profile?.id_card}
                </Text>
                <Text
                  className={`${CARD.subtitle} text-gray-500 dark:text-gray-400`}
                >
                  {t("home-screen-blood-type")} : {Provider.Profile?.patient_profile?.blood_group ? Provider.Profile?.patient_profile?.blood_group : "N/A"}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Card */}
          <ActionCard
            title={t("search-doctor")}
            description={t("search-doctor-description")}
            textButton={t("search")}
            onPress={() => { router.push("/pages/main/DoctorMatchStepPage") }} />
        </ScrollView>
      </View>
    </View>
  );
};

export default HomePage;
