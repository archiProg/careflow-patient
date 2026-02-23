import { registerApi } from "@/api/AuthApi";
import { FaceCaptureCamera } from "@/components/FaceCaptureCameraProps";
import Loading from "@/components/LoadingComp";
import { BG } from "@/constants/styles";
import i18n from "@/hooks/useI18n";
import nativeSmartcard from "@/hooks/nativeSmartcard";
import { CheckEmailResponse } from "@/types/CheckEmailModel";
import { RegisterPayloadModel } from "@/types/RegisterPayloadModel";
import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

// ─── Types ─────────────────────────────────────────────────────────
type BirthdayParts = {
  year: string;   // "1990" หรือ "0000" = ไม่ทราบ
  month: string;  // "07"   หรือ "00"   = ไม่ทราบ
  day: string;    // "09"   หรือ "00"   = ไม่ทราบ
};

// ─── Helpers ────────────────────────────────────────────────────────

/** แปลง BirthdayParts → Date object (ใช้ 1 เป็น default ถ้าไม่ทราบเดือน/วัน) */
const birthdayToDate = (b: BirthdayParts): Date => {
  const y = parseInt(b.year,  10) || new Date().getFullYear() - 60;
  const m = parseInt(b.month, 10) || 1;
  const d = parseInt(b.day,   10) || 1;
  return new Date(y, m - 1, d);
};

/** แปลง Date → BirthdayParts (CE) */
const dateToBirthday = (date: Date): BirthdayParts => ({
  year:  date.getFullYear().toString(),
  month: (date.getMonth() + 1).toString().padStart(2, "0"),
  day:   date.getDate().toString().padStart(2, "0"),
});

/** แปลง BE date string "25460907" → BirthdayParts (CE) รองรับ "00" */
const parseBuddhistDate = (dateStr: string): BirthdayParts => {
  const empty: BirthdayParts = { year: "0000", month: "00", day: "00" };
  if (!dateStr || dateStr.length !== 8) return empty;
  const beYear   = parseInt(dateStr.substring(0, 4), 10);
  const rawMonth = dateStr.substring(4, 6);
  const rawDay   = dateStr.substring(6, 8);
  const ceYear   = beYear > 0 ? beYear - 543 : 0;
  return {
    year:  ceYear > 0 ? ceYear.toString() : "0000",
    month: rawMonth,
    day:   rawDay,
  };
};

/** สร้าง string สำหรับส่ง API เช่น "1990-07-09", "0000-00-00" */
const formatBirthday = (b: BirthdayParts, unknown: boolean): string => {
  if (unknown) return "0000-00-00";
  return `${(b.year || "0000").padStart(4, "0")}-${b.month || "00"}-${b.day || "00"}`;
};

/** แปลง "Mr.#Kasidit##Thong-on" → "Kasidit Thong-on" */
const parseNameEN = (nameEN: string): string => {
  if (!nameEN) return "";
  return nameEN.split("#").filter((p) => p.trim() !== "").slice(1).join(" ").trim();
};

/** แปลง "นาย#กษิดิศ##ทองอ่อน" → "นาย กษิดิศ ทองอ่อน" */
const parseNameTH = (nameTH: string): string => {
  if (!nameTH) return "";
  return nameTH.split("#").filter((p) => p.trim() !== "").join(" ").trim();
};

/** แปลง gender string → number */
const parseGender = (gender: string): number => {
  const g = (gender || "").toLowerCase();
  if (g === "male"   || g === "ชาย")  return 1;
  if (g === "female" || g === "หญิง") return 2;
  return 0;
};

// ─── Constants ──────────────────────────────────────────────────────
const STEP_FILL = 1;
const STEP_FACE = 2;

// ─── RegisterPage ────────────────────────────────────────────────────
const RegisterPage = () => {
  const colorScheme = useColorScheme();
  const router      = useRouter();
  const { t }       = useTranslation();

  // ── ข้อมูลหลัก ──
  const [name,    setName]    = useState("");
  const [iDCard,  setIDCard]  = useState("");
  const [gender,  setGender]  = useState<number>(0);

  // ── วันเกิด ──
  const [birthday,        setBirthday]        = useState<BirthdayParts>({ year: "0000", month: "00", day: "00" });
  const [unknownBirthday, setUnknownBirthday] = useState(false);
  const [showDatePicker,  setShowDatePicker]  = useState(false);

  // ── ข้อมูลเสริม ──
  const [drugAllergy,       setDrugAllergy]       = useState("");
  const [congenitalDisease, setCongenitalDisease] = useState("");
  const [bloodGroup,        setBloodGroup]         = useState("");

  // ── UI ──
  const [step,        setStep]        = useState<number>(STEP_FILL);
  const [isLoading,   setIsLoading]   = useState(false);
  const [cardLoading, setCardLoading] = useState(false);

  // ── derived: Date object สำหรับ DateTimePicker ──
  const dateValue = birthdayToDate(birthday);
  const hasPickedDate = birthday.year !== "0000";
  const displayDate = hasPickedDate
    ? dateValue.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })
    : "กดเพื่อเลือกวันเกิด";

  // ─── อ่านบัตรประชาชน ──────────────────────────────────────────────
  const readSmartcard = async () => {
    setCardLoading(true);
    try {
      const result = await nativeSmartcard.readSmartcardData();
      console.log(result);

      if (result?.citizenId) setIDCard(result.citizenId);
      if (result?.gender)    setGender(parseGender(result.gender));
      if (result?.nameTH)      setName(parseNameTH(result.nameTH));
      else if (result?.nameEN) setName(parseNameEN(result.nameEN));

      if (result?.birthDate) {
        const parsed = parseBuddhistDate(result.birthDate);
        setBirthday(parsed);
        // ถ้าบัตรไม่มีปีเกิดเลย → เปิด toggle "ไม่ทราบ" อัตโนมัติ
        setUnknownBirthday(parsed.year === "0000");
      }

      Alert.alert(t("notification"), "อ่านข้อมูลบัตรสำเร็จ");
    } catch {
      Alert.alert(t("notification"), "กรุณาเสียบบัตรประชาชน");
    } finally {
      setCardLoading(false);
    }
  };

  // ─── Validate & Next ───────────────────────────────────────────────
  const handleNextStep = () => {
    if (!name.trim()) {
      Alert.alert(t("notification"), t("register_validation_name"));
      return;
    }
    if (!iDCard.trim()) {
      Alert.alert(t("notification"), t("register_validation_id_card"));
      return;
    }
    if (!gender || gender === 0) {
      Alert.alert(t("notification"), t("register_validation_gender"));
      return;
    }
    setStep(STEP_FACE);
  };

  // ─── Submit ────────────────────────────────────────────────────────
  const submitRegister = async (uri: string) => {
    setIsLoading(true);
    try {
      const head: RegisterPayloadModel["head"] = {
        birthday: formatBirthday(birthday, unknownBirthday),
        sex:      gender.toString(),
        id_card:  iDCard,
        name:     name,
        email:    "",
        drug_allergy:       drugAllergy        || "",
        congenital_disease: congenitalDisease  || "",
        blood_group:        bloodGroup         || "",
      };
      const file: RegisterPayloadModel["file"] = { image: uri };
      const response = await registerApi({ head, file });

      if (response.success) {
        Alert.alert(t("notification"), t("register_success"), [
          { text: t("ok"), onPress: () => router.back() },
        ]);
      } else {
        const getResponse: CheckEmailResponse = JSON.parse(response.response);
        Alert.alert(
          t("notification"),
          i18n.language === "th" ? getResponse.th : getResponse.en,
          [{ text: t("ok"), onPress: () => setStep(STEP_FILL) }],
        );
      }
    } catch (ex: any) {
      Alert.alert(t("notification"), ex.message || "Unknown error", [
        { text: t("ok"), onPress: () => setStep(STEP_FILL) },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Hardware back ──────────────────────────────────────────────────
  useEffect(() => {
    const backAction = () => {
      if (step === STEP_FILL) router.replace("/pages/auth/LoginPage");
      else setStep(STEP_FILL);
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [step]);

  const backButton = () => {
    if (step === STEP_FILL) router.replace("/pages/auth/LoginPage");
    else setStep(STEP_FILL);
  };

  // ───────────────────────────────────────────────────────────────────
  return (
    <>
      <View className={`${BG.default} flex-1 h-full w-full`}>

        {/* ── Header / Progress ── */}
        <View className="flex-row items-center mb-8">
          <Pressable className="px-3 rounded-full" onPress={backButton}>
            <FontAwesome
              name="angle-left"
              size={36}
              color={colorScheme === "dark" ? "#fff" : "#000"}
            />
          </Pressable>

          <View className="flex-1 h-4 rounded-full bg-gray-300 dark:bg-gray-700 mx-4">
            <View
              className="h-4 bg-[#2196F3] rounded-full"
              style={{ width: step === STEP_FILL ? "50%" : "100%" }}
            />
          </View>

          <View className="px-3">
            <Text className="text-black dark:text-white">{step}/2</Text>
          </View>
        </View>

        <Text className="text-2xl font-bold text-black mb-[16px] dark:text-white">
          {t("register_title")}
        </Text>

        {/* ══════════════════════════════════════════════
            STEP 1 — กรอกข้อมูล
        ══════════════════════════════════════════════ */}
        {step === STEP_FILL && (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
          >
            <ScrollView
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* ── ปุ่มอ่านบัตร ── */}
              <TouchableOpacity
                onPress={readSmartcard}
                disabled={cardLoading}
                className="h-[56px] mb-[24px] rounded-[24px] bg-[#2196F3] items-center justify-center flex-row gap-3"
              >
                <FontAwesome name="id-card" size={20} color="#fff" />
                <Text className="text-white font-bold text-base">
                  {cardLoading ? "กำลังอ่านบัตร..." : "อ่านบัตรประชาชน"}
                </Text>
              </TouchableOpacity>

              {/* ── ชื่อ ── */}
              <Text className="text-lg font-bold text-black mb-[8px] dark:text-white">
                {t("register_name_label")}
              </Text>
              <TextInput
                className="h-[56px] mb-[16px] rounded-[24px] border-[1px] border-gray-900 dark:border-gray-200 dark:text-white placeholder:text-gray-400 p-4"
                placeholder={t("placeholder_name")}
                value={name}
                onChangeText={setName}
              />

              {/* ── เลขบัตร ── */}
              <Text className="text-lg font-bold text-black mb-[8px] dark:text-white">
                {t("register_id_card_label")}
              </Text>
              <TextInput
                className="h-[56px] mb-[16px] rounded-[24px] border-[1px] border-gray-900 dark:border-gray-200 dark:text-white placeholder:text-gray-400 p-4"
                placeholder={t("placeholder_id_card")}
                keyboardType="numeric"
                value={iDCard}
                onChangeText={setIDCard}
              />

              {/* ── วันเกิด ── */}
              <View className="flex-row items-center justify-between mb-[8px]">
                <Text className="text-lg font-bold text-black dark:text-white">
                  {t("register_date_of_birth_label")}
                </Text>
                {/* Toggle ไม่ทราบวันเกิด */}
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm text-gray-500 dark:text-gray-400">ไม่ทราบ</Text>
                  <Switch
                    value={unknownBirthday}
                    onValueChange={(v) => {
                      setUnknownBirthday(v);
                      if (v) {
                        setBirthday({ year: "0000", month: "00", day: "00" });
                        setShowDatePicker(false);
                      }
                    }}
                    trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                    thumbColor={unknownBirthday ? "#2196F3" : "#f4f3f4"}
                  />
                </View>
              </View>

              {unknownBirthday ? (
                /* แสดง box สีเทาแทนเมื่อไม่ทราบวันเกิด */
                <View className="h-[56px] mb-[4px] rounded-[24px] border-[1px] border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 justify-center px-4">
                  <Text className="text-gray-400 dark:text-gray-500">ไม่ทราบวันเกิด (จะส่งเป็น 0000-00-00)</Text>
                </View>
              ) : (
                /* ปุ่มเลือกวัน → เปิด native DateTimePicker */
                <TouchableOpacity
                  onPress={() => setShowDatePicker((prev) => !prev)}
                  className="h-[56px] mb-[4px] rounded-[24px] border-[1px] border-gray-900 dark:border-gray-200 justify-center px-4 flex-row items-center gap-3"
                >
                  <FontAwesome
                    name="calendar"
                    size={15}
                    color={colorScheme === "dark" ? "#9CA3AF" : "#6B7280"}
                  />
                  <Text
                    className="flex-1"
                    style={{
                      color: hasPickedDate
                        ? (colorScheme === "dark" ? "#fff" : "#111827")
                        : "#9CA3AF",
                    }}
                  >
                    {displayDate}
                  </Text>
                  <FontAwesome
                    name={showDatePicker ? "chevron-up" : "chevron-down"}
                    size={11}
                    color={colorScheme === "dark" ? "#9CA3AF" : "#6B7280"}
                  />
                </TouchableOpacity>
              )}

              {/* Native DateTimePicker */}
              {!unknownBirthday && showDatePicker && (
                <View className="mb-[4px]">
                  <DateTimePicker
                    value={dateValue}
                    mode="date"
                    display={Platform.OS === "android" ? "calendar" : "inline"}
                    maximumDate={new Date()}
                    locale={`${i18n.language}-${i18n.language.toUpperCase()}`}
                    onChange={(_, selected) => {
                      if (Platform.OS === "android") setShowDatePicker(false);
                      if (selected) setBirthday(dateToBirthday(selected));
                    }}
                  />
                  {/* ปุ่ม Done สำหรับ iOS inline */}
                  {Platform.OS === "ios" && (
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(false)}
                      className="items-end px-2 py-1"
                    >
                      <Text className="text-[#2196F3] font-bold text-base">เสร็จสิ้น</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <View className="mb-[16px]" />

              {/* ── เพศ ── */}
              <Text className="text-lg font-bold text-black mb-[8px] dark:text-white">
                {t("register_gender_label")}
              </Text>
              <View className="h-[56px] mb-[16px] rounded-[24px] border-[1px] border-gray-900 dark:border-gray-200 justify-center overflow-hidden">
                <Picker selectedValue={gender} onValueChange={(v) => setGender(v)}>
                  {gender === 0 && (
                    <Picker.Item label={t("register_gender_select")} value={0} />
                  )}
                  <Picker.Item label={t("register_gender_male")}   value={1} />
                  <Picker.Item label={t("register_gender_female")} value={2} />
                </Picker>
              </View>

              {/* ── หมู่เลือด (optional) ── */}
              <Text className="text-lg font-bold text-black mb-[8px] dark:text-white">
                {t("register_blood_group_label")}{" "}
                <Text className="text-sm font-normal text-gray-500">{t("register_optional")}</Text>
              </Text>
              <View className="h-[56px] mb-[16px] rounded-[24px] border-[1px] border-gray-900 dark:border-gray-200 justify-center overflow-hidden">
                <Picker selectedValue={bloodGroup} onValueChange={(v) => setBloodGroup(v)}>
                  <Picker.Item label={t("register_blood_group_unknown")} value=""   />
                  <Picker.Item label={t("register_blood_group_a")}       value="A"  />
                  <Picker.Item label={t("register_blood_group_b")}       value="B"  />
                  <Picker.Item label={t("register_blood_group_ab")}      value="AB" />
                  <Picker.Item label={t("register_blood_group_o")}       value="O"  />
                </Picker>
              </View>

              {/* ── แพ้ยา (optional) ── */}
              <Text className="text-lg font-bold text-black mb-[8px] dark:text-white">
                {t("register_drug_allergy_label")}{" "}
                <Text className="text-sm font-normal text-gray-500">{t("register_optional")}</Text>
              </Text>
              <TextInput
                className="h-[56px] mb-[16px] rounded-[24px] border-[1px] border-gray-900 dark:border-gray-200 dark:text-white placeholder:text-gray-400 p-4"
                placeholder={t("register_drug_allergy_placeholder")}
                value={drugAllergy}
                onChangeText={setDrugAllergy}
              />

              {/* ── โรคประจำตัว (optional) ── */}
              <Text className="text-lg font-bold text-black mb-[8px] dark:text-white">
                {t("register_congenital_disease_label")}{" "}
                <Text className="text-sm font-normal text-gray-500">{t("register_optional")}</Text>
              </Text>
              <TextInput
                className="h-[56px] mb-[16px] rounded-[24px] border-[1px] border-gray-900 dark:border-gray-200 dark:text-white placeholder:text-gray-400 p-4"
                placeholder={t("register_congenital_disease_placeholder")}
                value={congenitalDisease}
                onChangeText={setCongenitalDisease}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        )}

        {/* ── ปุ่ม Continue ── */}
        {step === STEP_FILL && (
          <Pressable
            onPress={handleNextStep}
            className="h-[56px] w-full rounded-[24px] mb-10 bg-blue-500 dark:bg-[#2196F3] items-center justify-center"
          >
            <Text className="text-center text-white font-bold">{t("continue")}</Text>
          </Pressable>
        )}
      </View>

      {/* ══════════════════════════════════════════════
          STEP 2 — สแกนหน้า
      ══════════════════════════════════════════════ */}
      <View className={`absolute w-full h-full ${step === STEP_FACE ? "" : "hidden"}`}>
        <FaceCaptureCamera
          IsActive={step === STEP_FACE}
          onCapture={async (uri: string) => {
            await submitRegister(uri);
          }}
        />
      </View>

      {/* Loading overlay */}
      {isLoading && (
        <View className="absolute w-full h-full flex items-center justify-center bg-black/50">
          <View className="w-48 h-48 rounded-xl bg-white overflow-hidden justify-center items-center dark:bg-gray-900">
            <Loading />
          </View>
        </View>
      )}
    </>
  );
};

export default RegisterPage;