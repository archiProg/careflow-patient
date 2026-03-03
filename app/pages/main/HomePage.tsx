import ActionCard from "@/components/ActionCard";
import { CARD, TEXT_SIZE } from "@/constants/styles";
import { Colors } from "@/constants/theme";
import Provider from "@/services/providerService";
import { RootState } from "@/store";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSelector } from "react-redux";

const HomePage = () => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const router = useRouter();
  const { t } = useTranslation();

  const consultInfo = useSelector(
    (state: RootState) => state.recall.consultInfo
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, padding: 16 }}>
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting Section */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 16,
              paddingBottom: 24,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.text,
                  opacity: 0.7,
                  marginBottom: 4,
                }}
              >
                {new Date().getHours() < 12
                  ? t("home-screen-good-morning")
                  : new Date().getHours() < 18
                  ? t("home-screen-good-afternoon")
                  : t("home-screen-good-evening")}
              </Text>

              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "bold",
                  color: theme.text,
                }}
              >
                {t("home-screen-welcome")}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/pages/main/SettingPage")}
            >
              <FontAwesome
                name="gear"
                size={24}
                color={theme.icon}
              />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View
            style={{
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderWidth: 1,
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {/* Avatar */}
              <View>
                {Provider.Profile?.profile_image_url ? (
                  <Image
                    source={{
                      uri:
                        Provider.HostAPI_URL +
                        Provider.Profile.profile_image_url,
                    }}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 16,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 16,
                      backgroundColor: theme.primary,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 28,
                        fontWeight: "bold",
                      }}
                    >
                      {Provider.Profile?.name
                        ?.charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              {/* Profile Info */}
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: theme.text,
                    marginBottom: 4,
                  }}
                >
                  {Provider.Profile?.name}
                </Text>

                <Text
                  style={{
                    color: theme.text,
                    opacity: 0.7,
                    marginBottom: 4,
                  }}
                >
                  {t("home-screen-id-card")} :{" "}
                  {Provider.Profile?.id_card}
                </Text>

                <Text
                  style={{
                    color: theme.text,
                    opacity: 0.7,
                  }}
                >
                  {t("home-screen-blood-type")} :{" "}
                  {Provider.Profile?.patient_profile?.blood_group ??
                    "N/A"}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Card */}
          <ActionCard
            title={t("search-doctor")}
            description={t("search-doctor-description")}
            textButton={t("search")}
            onPress={() =>
              router.push("/pages/main/DoctorMatchStepPage")
            }
          />

          {/* Resume Case Banner */}
          {consultInfo && (
            <View style={{ marginTop: 24 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: theme.text,
                  marginBottom: 8,
                }}
              >
                {t("home-screen-incomplete-consultation")}
              </Text>

              <View
                style={{
                  backgroundColor: theme.card,
                  borderColor: theme.warning,
                  borderWidth: 1,
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: theme.text,
                      marginBottom: 4,
                    }}
                  >
                    {t("doctor")}:{" "}
                    {consultInfo.doctorInfo.name}
                  </Text>

                  <Text
                    style={{
                      color: theme.text,
                      opacity: 0.7,
                    }}
                  >
                    {t("specialty")}:{" "}
                    {consultInfo.doctorInfo.specialization_name}
                  </Text>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: theme.primary,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 12,
                    }}
                    onPress={() =>
                      router.replace({
                        pathname: "/pages/main/PreCallPage",
                        params: {
                          consultId: consultInfo.caseId,
                        },
                      })
                    }
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "600",
                      }}
                    >
                      {t("resume")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default HomePage;