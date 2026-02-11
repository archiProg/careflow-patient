import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, StyleSheet, TouchableOpacity, Text ,Button } from 'react-native';
import LoadingComp from "@/components/LoadingComp";
import Provider from "@/services/providerService";
import { useState } from "react";


import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';

/* ---------- Color Palette (White–Blue) ---------- */
const colors = {
  white: "#FFFFFF",
  offWhite: "#F0F7FF", // card bg subtle
  lightBlue: "#E0EEFF", // grid item bg
  blue100: "#DBEAFE",
  blue300: "#93C5FD",
  blue500: "#3B82F6", // accent / primary blue
  blue600: "#2563EB", // darker blue
  blue700: "#1D4ED8",
  textPrimary: "#1E3A5F", // dark navy for headings
  textSecondary: "#4A7096", // muted blue-grey for labels
  textMuted: "#8AACC9", // lightest text
  border: "#C8DEF0", // subtle blue border
  shadow: "#1E3A5F", // shadow tint
};

const ConsultSuccessPage = () => {
  const [loading, setLoading] = useState(false);

  const { consult_id, userName } = useLocalSearchParams<{
    consult_id: string;
    userName: string;
  }>();
    console.log("roomId", consult_id, userName);
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language; 

const handleGoHome = async () => {
  try {
    setLoading(true); // ✅ เริ่ม loading

    const pdfUrl = `${Provider.HostAPI_URL}/pdf/treatment/${consult_id}/${currentLang}`;
    console.log("PDF URL:", pdfUrl);

    const fileUri = FileSystem.documentDirectory + "temp.pdf";

    const downloadResult = await FileSystem.downloadAsync(pdfUrl, fileUri);
    console.log("Downloaded to:", downloadResult.uri);

    await Print.printAsync({ uri: downloadResult.uri });
  console.log("Print success");

    router.replace(`/pages/main/HomePage`);
  } catch (error) {
    console.error("print pdf error:", error);
    router.replace(`/pages/main/HomePage`);
  } finally {
      console.log("Print failed:",);
    setLoading(false); // ✅ ปิด loading ไม่ว่าจะ error หรือไม่
        router.replace(`/pages/main/HomePage`);
  }
};

return (
  <View style={styles.container}>
    {loading && <LoadingComp />}  {/* ✅ Loading Overlay */}

    <View style={styles.contentContainer}>
      {/* Success Icon */}
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={100} color={colors.blue500} />
      </View>

      <Text style={styles.title}>{t("consult_completed")}</Text>
      <Text style={styles.message}>{t("consult_thank_you")}</Text>

      <View style={styles.blessingsContainer}>
        <Text style={styles.blessingsText}>{t("consult_blessing")}</Text>
      </View>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={handleGoHome}
        activeOpacity={0.8}
        disabled={loading}   // ✅ กันกดซ้ำ
      >
        <Ionicons name="home" size={24} color={colors.white} style={styles.buttonIcon} />
        <Text style={styles.homeButtonText}>
          {loading ? t("loading") : t("consult_home_button")}
        </Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>{t("consult_footer")}</Text>
    </View>
  </View>
);

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 30,
    shadowColor: colors.blue500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: "center",
  },
  message: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 30,
  },
  blessingsContainer: {
    backgroundColor: colors.blue100,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 40,
    borderLeftWidth: 4,
    borderLeftColor: colors.blue500,
  },
  blessingsText: {
    fontSize: 15,
    color: colors.blue700,
    textAlign: "center",
    fontStyle: "italic",
  },
  homeButton: {
    flexDirection: "row",
    backgroundColor: colors.blue500,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    marginBottom: 20,
    minWidth: 200,
  },
  buttonIcon: {
    marginRight: 10,
  },
  homeButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 10,
  },
});

export default ConsultSuccessPage;