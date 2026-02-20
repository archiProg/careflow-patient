import { registerApi } from "@/api/AuthApi";
import { FaceCaptureCamera } from "@/components/FaceCaptureCameraProps";
import Loading from "@/components/LoadingComp";
import { BG } from "@/constants/styles";
import i18n from "@/hooks/useI18n";
import { CheckEmailResponse } from "@/types/CheckEmailModel";
import { RegisterPayloadModel } from "@/types/RegisterPayloadModel";
import { CheckEmail } from "@/utils/checkEmail";
import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
const defaultImage = require("@/assets/images/profile_register.png");

const RegisterPage = () => {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("ssss@sssss2q.com");
  const [password, setPassword] = useState("1111");
  const [passwordConfirm, setPasswordConfirm] = useState("1111");
  const [name, setName] = useState("ssss");
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [gender, setGender] = useState<number>(0);
  const [statusRegistor, setStatusRegistor] = useState<number>(1);
  const [beforeStatusRegistor, setBeforeStatusRegistor] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [iDCard, setIDCard] = useState<string>("9898989898989");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordComFocused, setPasswordComFocused] = useState(false);

  const [drugAllergy, setDrugAllergy] = useState<string>("");
  const [congenitalDisease, setCongenitalDisease] = useState<string>("");
  const [bloodGroup, setBloodGroup] = useState<string>("");

  const handleRegister = async () => {
    console.log(
      date.toString(),
      email
    );

    if (statusRegistor == 1) {
      if (!name) {
        Alert.alert(t("notification"), t("register_validation_name"));
        return;
      }

      if (!email) {
        Alert.alert(t("notification"), t("register_validation_email"));
        return;
      }

      const checkEmail = await CheckEmail(email);
      if (checkEmail.status !== 0) {
        Alert.alert(t("notification"), i18n.language === "th" ? checkEmail.th : checkEmail.en);
        return;
      }

      if (!date) {
        Alert.alert(t("notification"), t("register_validation_date"));
        return;
      }

      if (!gender || gender === 0) {
        Alert.alert(t("notification"), t("register_validation_gender"));
        return;
      }

      if (!password) {
        Alert.alert(t("notification"), t("register_validation_password"));
        return;
      }

      if (!passwordConfirm) {
        Alert.alert(
          t("notification"),
          t("register_validation_password_confirm"),
        );
        return;
      }

      if (password !== passwordConfirm) {
        Alert.alert(
          t("notification"),
          t("register_validation_password_mismatch"),
        );
        return;
      }


      if (image) {
        setBeforeStatusRegistor(1);
        setStatusRegistor(3);
      } else {
        setBeforeStatusRegistor(statusRegistor);
        setStatusRegistor(2);
      }
    }
    if (statusRegistor == 3) {
      if (!image) {
        Alert.alert(t("notification"), t("register_validation_image"));
        return;
      }
      if (!iDCard) {
        Alert.alert(t("notification"), t("register_validation_id_card"));
        return;
      }

      try {
        const head: RegisterPayloadModel["head"] = {
          password: password,
          birthday: date.toISOString().split("T")[0],
          sex: gender.toString(),
          id_card: iDCard,
          name: name,
          email: email,
          drug_allergy: drugAllergy || "",
          congenital_disease: congenitalDisease || "",
          blood_group: bloodGroup || "",
        };

        const file: RegisterPayloadModel["file"] = {};
        if (image) {
          file["image"] = image;
        }

        const payload: RegisterPayloadModel = {
          head,
          file,
        };

        const response = await registerApi(payload);


        if (response.success) {
          Alert.alert(t("notification"), t("register_success"), [
            { text: t("ok") },
          ]);
          router.back();
        } else {
          if (response.code == 401) {
            let getResponse: CheckEmailResponse;

            getResponse = JSON.parse(response.response);
            Alert.alert(t("notification"), i18n.language === "th" ? getResponse.th : getResponse.en, [
              { text: t("ok") },
            ]);
          } else {
            let getResponse: CheckEmailResponse;

            getResponse = JSON.parse(response.response);
            Alert.alert(t("notification"), i18n.language === "th" ? getResponse.th : getResponse.en, [
              { text: t("ok") },
            ]);
          }
        }
      } catch (ex: any) {
        Alert.alert(t("notification"), ex.message || "Unknown error", [
          { text: t("ok") },
        ]);
      }
    }
  };

  // const pickFromGallery = async () => {
  //   const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //   if (status !== "granted") {
  //     Alert.alert(
  //       t("register_permission_denied"),
  //       t("register_cannot_access_gallery"),
  //     );
  //     return;
  //   }

  //   const result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: "images",
  //     quality: 1,
  //   });

  //   if (!result.canceled) {
  //     setImage(result.assets[0].uri);
  //   }
  // };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("register_permission_denied"),
        t("register_cannot_access_camera"),
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const pickImage = () => {
    Alert.alert(
      t("register_select_image"),
      t("register_choose_source"),
      [
        {
          text: "ถ่ายรูปใหม่", onPress: () => {
            setBeforeStatusRegistor(3);
            setStatusRegistor(2);
            console.log(beforeStatusRegistor);
            console.log(statusRegistor);
          }
        },
        // { text: t("register_gallery"), onPress: pickFromGallery },
        { text: t("cancel"), style: "cancel" },
      ],
      { cancelable: true },
    );
  };

  const handleApi = async (action: string) => {
    setIsLoading(true);
    if (action == "Register") {
      await handleRegister();
    }
    setIsLoading(false);
  };

  const backButton = () => {
    if (statusRegistor == 1) {
      router.replace("/pages/auth/LoginPage");
    } else {
      console.log(beforeStatusRegistor);

      setStatusRegistor(beforeStatusRegistor);
    }
  };

  useEffect(() => {
    const backAction = () => {
      if (statusRegistor === 1) {
        router.replace("/pages/auth/LoginPage");
      } else {
        if (beforeStatusRegistor === 3) {
          setStatusRegistor(1);
        } else {
          setStatusRegistor(beforeStatusRegistor);
        }

      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => backHandler.remove();
  }, [statusRegistor]);

  return (
    <>
      <View className={` ${BG.default} flex-1 h-full w-full`}>
        <View className="flex-row items-center mb-8">
          <View className="flex items-start">
            <Pressable className="px-3 rounded-full" onPress={backButton}>
              <FontAwesome
                name="angle-left"
                size={36}
                className="text-black dark:text-white"
                color={colorScheme === "dark" ? "#fff" : "#000"}
              />
            </Pressable>
          </View>

          <View className="flex-1 items-start h-4 rounded-full bg-gray-300 dark:bg-gray-700 mx-4">
            <View
              className="h-4 bg-[#2196F3] rounded-full"
              style={{ width: statusRegistor == 1 ? "50%" : "100%" }}
            ></View>
          </View>

          <View className="flex items-end px-3">
            <Text className="text-black dark:text-white">
              {statusRegistor > 2 ? 2 : statusRegistor}/2
            </Text>
          </View>
        </View>
        <Text className="text-2xl font-bold text-black mb-[16px] dark:text-white">
          {t("register_title")}
        </Text>
        {statusRegistor == 1 ? (
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
              <Text className="text-lg font-bold text-black mb-[8px] dark:text-white">
                {t("register_name_label")}
              </Text>

              <TextInput
                className="h-[56px] mb-[16px] rounded-[24px]  border-[1px] border-gray-900 focus:border-[#2196F3] focus:outline-none focus:ring-1 focus:ring-[#2196F3] placeholder:text-gray-400 p-4 
                dark:border-gray-200 dark:text-white"
                placeholder={t("placeholder_name")}
                keyboardType="default"
                value={name}
                onChangeText={setName}
              />
              <Text className="text-lg font-bold text-black mb-[8px] dark:text-white">
                {t("register_email_label")}
              </Text>
              <TextInput
                className="h-[56px] mb-[16px] rounded-[24px] border-[1px] border-gray-900 focus:border-[#2196F3] focus:outline-none focus:ring-1 focus:ring-[#2196F3] placeholder:text-gray-400 p-4 
                dark:border-gray-200 dark:text-white"
                placeholder={t("placeholder_email")}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <View className="w-full flex-row gap-4">
                <View className="flex-1">
                  <Text className="mb-2 text-lg font-bold text-black dark:text-white">
                    {t("register_date_of_birth_label")}
                  </Text>
                  <Pressable className="h-[56px] rounded-[24px] border-[1px] border-gray-900 focus:border-[#2196F3] focus:outline-none focus:ring-1 focus:ring-[#2196F3] placeholder:text-gray-400 p-4 
                dark:border-gray-200  justify-center" onPress={() => setShow(true)}>

                    <Text className="dark:text-white">
                      {date.toDateString()}
                    </Text>
                  </Pressable>

                  {show && (
                    <DateTimePicker
                      value={date}
                      mode="date"
                      locale={`${i18n.language}-${i18n.language.toUpperCase()}`}
                      maximumDate={new Date()}
                      display={
                        Platform.OS === "android" ? "calendar" : "default"
                      }

                      onChange={(event, selectedDate) => {
                        setShow(false);
                        if (selectedDate) setDate(selectedDate);
                      }}
                    />
                  )}
                </View>

                <View className="flex-1 mb-[16px]">
                  <Text className="mb-2 text-lg font-bold text-black dark:text-white">
                    {t("register_gender_label")}
                  </Text>

                  <View
                    className="h-[56px] rounded-[24px] border-[1px] border-gray-900 focus:border-[#2196F3] focus:outline-none focus:ring-1 focus:ring-[#2196F3] placeholder:text-gray-400 p-4 
                dark:border-gray-200 justify-center overflow-hidden"
                  >
                    <Picker
                      selectedValue={gender}
                      onValueChange={(itemValue) => setGender(itemValue)}
                    >
                      {gender === 0 && (
                        <Picker.Item
                          label={t("register_gender_select")}
                          value={0}
                        />
                      )}
                      <Picker.Item
                        label={t("register_gender_male")}
                        value={1}
                      />
                      <Picker.Item
                        label={t("register_gender_female")}
                        value={2}
                      />
                    </Picker>
                  </View>
                </View>
              </View>
              <View className="flex-1 ">
                <Text className="mb-2 text-lg font-bold text-black dark:text-white">
                  {t("register_password_label")}
                </Text>
                <View
                  className={`flex-row items-center h-[56px] mb-[16px] rounded-[24px] px-4 border ${passwordFocused
                    ? "border-[#2196F3] dark:border-[#64B5F6]"
                    : "border-gray-900 dark:border-gray-200"
                    }`}
                >
                  <TextInput
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    className="flex-1 dark:text-white placeholder:text-gray-400"
                    placeholder={t("placeholder_password")}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    returnKeyType="next"
                  />

                  <TouchableOpacity
                    className="h-full px-4 justify-center"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesome
                      name={showPassword ? "eye" : "eye-slash"}
                      size={20}
                      className={`text-gray-600 dark:text-gray-300`}
                      color={colorScheme === "dark" ? "#fff" : "#000"}
                    />
                  </TouchableOpacity>
                </View>

                <View
                  className={`flex-row items-center h-[56px] mb-[16px] rounded-[24px] px-4 border ${passwordComFocused
                    ? "border-[#2196F3] dark:border-[#64B5F6]"
                    : "border-gray-900 dark:border-gray-200"
                    }`}
                >
                  <TextInput
                    onFocus={() => setPasswordComFocused(true)}
                    onBlur={() => setPasswordComFocused(false)}
                    className="flex-1 dark:text-white placeholder:text-gray-400"
                    placeholder={t("placeholder_password_confirm")}
                    secureTextEntry={!showPasswordConfirm}
                    value={passwordConfirm}
                    onChangeText={setPasswordConfirm}
                    returnKeyType="next"
                  />

                  <TouchableOpacity
                    className="h-full px-4 justify-center"
                    onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  >
                    <FontAwesome
                      name={showPasswordConfirm ? "eye" : "eye-slash"}
                      size={20}
                      className={`text-gray-600 dark:text-gray-300`}
                      color={colorScheme === "dark" ? "#fff" : "#000"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        ) : (
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
              <View className="items-center mb-[24px]">
                <TouchableOpacity onPress={pickImage}>
                  <Image
                    className={`${image ? "rounded-full" : ""} w-[200px] h-[200px]`}
                    source={image ? { uri: image } : defaultImage}
                  />
                </TouchableOpacity>
              </View>

              <Text className="text-lg font-bold text-black mb-[8px] dark:text-white">
                {t("register_id_card_label")}
              </Text>
              <TextInput
                className="h-[56px] mb-[16px] rounded-[24px] border-[1px] border-gray-900 focus:border-[#2196F3] focus:outline-none focus:ring-1 focus:ring-[#2196F3] placeholder:text-gray-400 p-4 
                dark:border-gray-200 dark:text-white"
                placeholder={t("placeholder_id_card")}
                keyboardType="default"
                value={iDCard}
                onChangeText={setIDCard}
              />

              {/* New optional fields */}
              <Text className="text-lg font-bold text-black mb-[8px] dark:text-white">
                {t("register_blood_group_label")}{" "}
                <Text className="text-sm font-normal text-gray-500">
                  {t("register_optional")}
                </Text>
              </Text>
              <View className="h-[56px] mb-[16px] rounded-[24px] border-[1px] border-gray-900 dark:border-gray-200 justify-center overflow-hidden">
                <Picker
                  selectedValue={bloodGroup}
                  onValueChange={(itemValue) => setBloodGroup(itemValue)}
                >
                  <Picker.Item
                    label={t("register_blood_group_unknown")}
                    value=""
                  />
                  <Picker.Item label={t("register_blood_group_a")} value="A" />
                  <Picker.Item label={t("register_blood_group_b")} value="B" />
                  <Picker.Item
                    label={t("register_blood_group_ab")}
                    value="AB"
                  />
                  <Picker.Item label={t("register_blood_group_o")} value="O" />
                </Picker>
              </View>

              <Text className="text-lg font-bold text-black mb-[8px] dark:text-white">
                {t("register_drug_allergy_label")}{" "}
                <Text className="text-sm font-normal text-gray-500">
                  {t("register_optional")}
                </Text>
              </Text>
              <TextInput
                className="h-[56px] mb-[16px] rounded-[24px] border-[1px] border-gray-900 focus:border-[#2196F3] focus:outline-none focus:ring-1 focus:ring-[#2196F3] placeholder:text-gray-400 p-4 
                dark:border-gray-200 dark:text-white"
                placeholder={t("register_drug_allergy_placeholder")}
                keyboardType="default"
                value={drugAllergy}
                onChangeText={setDrugAllergy}
              />

              <Text className="text-lg font-bold text-black mb-[8px] dark:text-white">
                {t("register_congenital_disease_label")}{" "}
                <Text className="text-sm font-normal text-gray-500">
                  {t("register_optional")}
                </Text>
              </Text>
              <TextInput
                className="h-[56px] mb-[16px] rounded-[24px] border-[1px] border-gray-900 focus:border-[#2196F3] focus:outline-none focus:ring-1 focus:ring-[#2196F3] placeholder:text-gray-400 p-4 
                dark:border-gray-200 dark:text-white"
                placeholder={t("register_congenital_disease_placeholder")}
                keyboardType="default"
                value={congenitalDisease}
                onChangeText={setCongenitalDisease}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        )}
        <Pressable
          onPress={async () => {
            await handleApi("Register");
          }}
          className="h-[56px] w-full rounded-[24px] mb-10 bg-blue-500 items-center justify-center dark:bg-[#2196F3]"
        >
          <Text className=" text-center text-white font-bold">
            {statusRegistor === 1 ? t("continue") : t("register")}
          </Text>
        </Pressable>
      </View>


      <View className={`absolute w-full h-full ${(statusRegistor === 2) ? "" : "hidden"}`}>
        <FaceCaptureCamera
          IsActive={statusRegistor === 2}
          onCapture={(uri: string) => {
            setImage(uri);
            setBeforeStatusRegistor(1);
            setStatusRegistor(3);
          }}
        />
      </View>

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

