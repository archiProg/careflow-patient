import { registerApi } from "@/api/AuthApi";
import Loading from "@/components/LoadingComp";
import { BG } from "@/constants/styles";
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
    const [isLoading, setIsLoading] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [iDCard, setIDCard] = useState<string>("9898989898989");
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [passwordComFocused, setPasswordComFocused] = useState(false);

    const handleRegister = async () => {
        if (statusRegistor == 1) {
            if (!name) {
                Alert.alert("Notification", "Please enter name");
                return;
            }

            if (!email) {
                Alert.alert("Notification", "Please enter email");
                return;
            }

            const checkEmail = await CheckEmail(email);
            if (checkEmail.status !== 0) {
                Alert.alert("Notification3", checkEmail.message);
                return;
            }

            if (!date) {
                Alert.alert("Notification", "Please select date");
                return;
            }

            if (!gender || gender === 0) {
                Alert.alert("Notification", "Please select gender");
                return;
            }

            if (!password) {
                Alert.alert("Notification", "Please enter password");
                return;
            }

            if (!passwordConfirm) {
                Alert.alert("Notification", "Please enter password confirm");
                return;
            }

            if (password !== passwordConfirm) {
                Alert.alert("Notification", "Password not match");
                return;
            }

            setStatusRegistor(2);
        }
        if (statusRegistor == 2) {
            if (!image) {
                Alert.alert("Notification", "Please select image");
                return;
            }
            if (!iDCard) {
                Alert.alert("Notification", "Please enter ID card");
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
                    Alert.alert("Notice", "Register success", [{ text: "OK" }]);
                    router.back();
                } else {
                    if (response.code == 401) {
                        Alert.alert("Notice", "ID Card already exists", [{ text: "OK" }]);
                    }
                    else {
                        Alert.alert("Notice", response.response, [{ text: "OK" }]);
                    }
                }
            } catch (ex: any) {
                Alert.alert("Notice", ex.message || "Unknown error", [{ text: "OK" }]);
            }
        }
    };

    const pickFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission denied", "Cannot access gallery");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const pickFromCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission denied", "Cannot access camera");
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
            "Select Image",
            "Choose from camera or gallery",
            [
                { text: "Camera", onPress: pickFromCamera },
                { text: "Gallery", onPress: pickFromGallery },
                { text: "Cancel", style: "cancel" },
            ],
            { cancelable: true }
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
            setStatusRegistor(1);
        }
    };

    useEffect(() => {
        const backAction = () => {
            if (statusRegistor === 1) {
                router.replace("/pages/auth/LoginPage");
            } else {
                setStatusRegistor(1);
            }
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
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
                            {statusRegistor}/2
                        </Text>
                    </View>
                </View>
                <Text className="text-2xl font-bold text-black mb-[16px] dark:text-white">
                    Register
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
                                name
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
                                email
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
                                        Date of birth
                                    </Text>

                                    <Pressable onPress={() => setShow(true)}>
                                        <View
                                            className="h-[56px] rounded-[24px] border-[1px] border-gray-900 focus:border-[#2196F3] focus:outline-none focus:ring-1 focus:ring-[#2196F3] placeholder:text-gray-400 p-4 
                dark:border-gray-200  justify-center"
                                        >
                                            <Text className="dark:text-white">
                                                {date.toDateString()}
                                            </Text>
                                        </View>
                                    </Pressable>

                                    {show && (
                                        <DateTimePicker
                                            value={date}
                                            mode="date"
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
                                        Gender
                                    </Text>

                                    <View
                                        className="h-[56px] rounded-[24px] border-[1px] border-gray-900 focus:border-[#2196F3] focus:outline-none focus:ring-1 focus:ring-[#2196F3] placeholder:text-gray-400 p-4 
                dark:border-gray-200 justify-center overflow-hidden"
                                    >
                                        <Picker
                                            selectedValue={gender}
                                            onValueChange={(itemValue) => setGender(itemValue)}
                                        >
                                            {gender === 0 && <Picker.Item label="Select" value={0} />}
                                            <Picker.Item label="Male" value={1} />
                                            <Picker.Item label="Female" value={2} />
                                        </Picker>
                                    </View>
                                </View>
                            </View>
                            <View className="flex-1 ">
                                <Text className="mb-2 text-lg font-bold text-black dark:text-white">
                                    Password
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
                    <View className="flex-1 w-full my-[16px] ">
                        <View className="items-center mb-[24px]">
                            <TouchableOpacity onPress={pickImage}>
                                <Image
                                    className={`${image ? "rounded-full" : ""} w-[200px] h-[200px]`}
                                    source={image ? { uri: image } : defaultImage}
                                />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-lg font-bold text-black mb-[8px] dark:text-white">
                            ID Card
                        </Text>
                        <TextInput
                            className="h-[56px] mb-[16px] rounded-[24px] border-[1px] border-gray-900 focus:border-[#2196F3] focus:outline-none focus:ring-1 focus:ring-[#2196F3] placeholder:text-gray-400 p-4 
                dark:border-gray-200 dark:text-white"
                            placeholder={t("placeholder_id_card")}
                            keyboardType="default"
                            value={iDCard}
                            onChangeText={setIDCard}
                        />
                    </View>
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