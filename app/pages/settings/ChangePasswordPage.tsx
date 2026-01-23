import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { BackHandler, Pressable, ScrollView, Text, TextInput, TextInputProps, TouchableOpacity, useColorScheme, View } from 'react-native';

export default function ChangePasswordScreen() {
    const colorScheme = useColorScheme();
    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showCurrent, setShowCurrent] = useState<boolean>(false);
    const [showNew, setShowNew] = useState<boolean>(false);
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    const router = useRouter();

    const handleChangePassword = () => {
        if (newPassword !== confirmPassword) {
            alert('รหัสผ่านใหม่ไม่ตรงกัน');
            return;
        }
        console.log('เปลี่ยนรหัสผ่าน', { currentPassword, newPassword });
    };


    const handleBack = () => {
        router.back();
    };


    //back handler
    useEffect(() => {
        const backAction = () => {
            handleBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => backHandler.remove();
    }, []);

    interface PasswordInputProps extends TextInputProps {
        value: string;
        onChangeText: (text: string) => void;
        placeholder: string;
        show: boolean;
        toggleShow: () => void;
    }

    const PasswordInput: React.FC<PasswordInputProps> = ({
        value,
        onChangeText,
        placeholder,
        show,
        toggleShow,
        ...rest
    }) => (
        <View className="mb-4">
            <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-blue-100">
                <FontAwesome name="lock" size={20} color="#60A5FA" />
                <TextInput
                    className="flex-1 ml-3 text-gray-800 text-base"
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!show}
                    value={value}
                    onChangeText={onChangeText}
                    {...rest}
                />
                <TouchableOpacity onPress={toggleShow}>
                    <FontAwesome name={show ? "eye-slash" : "eye"} size={20} color="#9CA3AF" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1 h-full bg-white dark:bg-gray-900">
            <View className="flex w-full p-5 justify-start items-start">
                <Pressable
                    className="flex-row items-center justify-start px-3 rounded-full"
                    onPress={() => {
                        handleBack();
                    }}
                >
                    <FontAwesome
                        name="angle-left"
                        size={36}
                        className=" text-black dark:text-white"
                        color={colorScheme === "dark" ? "#fff" : "#000"}
                    />
                </Pressable>
            </View>

            <ScrollView className="flex-1 p-5 pb-10">
                {/* Header */}

                <View className="items-center mb-8">
                    <View className="flex items-center justify-center bg-blue-100 rounded-full w-24 h-24 p-4 mb-4">
                        <FontAwesome name="lock" size={48} color="#3B82F6" />
                    </View>
                    <Text className="text-3xl font-bold text-gray-800 mb-2">เปลี่ยนรหัสผ่าน</Text>
                    <Text className="text-gray-500 text-center">
                        กรุณากรอกรหัสผ่านเดิมและรหัสผ่านใหม่
                    </Text>
                </View>

                {/* Password Inputs */}
                <View className="mb-6">
                    <PasswordInput
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        placeholder="รหัสผ่านปัจจุบัน"
                        show={showCurrent}
                        toggleShow={() => setShowCurrent(!showCurrent)}
                    />
                    <PasswordInput
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="รหัสผ่านใหม่"
                        show={showNew}
                        toggleShow={() => setShowNew(!showNew)}
                    />
                    <PasswordInput
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="ยืนยันรหัสผ่านใหม่"
                        show={showConfirm}
                        toggleShow={() => setShowConfirm(!showConfirm)}
                    />
                </View>

            </ScrollView>
            {/* Submit Button */}
            <TouchableOpacity
                disabled={currentPassword === '' || newPassword === '' || confirmPassword === ''}
                className={`bg-blue-500 rounded-xl py-4 m-4 items-center shadow-lg active:bg-blue-600 ${currentPassword === '' || newPassword === '' || confirmPassword === '' ? 'opacity-50' : ''}`}
                onPress={handleChangePassword}
            >
                <Text className="text-white font-bold text-lg">ยืนยันการเปลี่ยนรหัสผ่าน</Text>
            </TouchableOpacity>
        </View>
    );
}
