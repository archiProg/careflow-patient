import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

interface DoneScreenProps {
    capturedImages: string[];
    selected: number | null;
    onSelect: (index: number) => void;
    onConfirm: () => void;
}

export const DoneScreen: React.FC<DoneScreenProps> = ({
    capturedImages,
    selected,
    onSelect,
    onConfirm,
}) => {
    const { t } = useTranslation();

    return (
        <SafeAreaView style={StyleSheet.absoluteFill} className="flex-1 bg-[#ffffff]">
            <View className="flex-1 p-4 bg-[#ffffff]">
                <Text className="text-center text-lg mb-4">
                    {t("face_scan.select_your_best_photo")}
                </Text>

                {/* Preview selected image */}
                <View className="flex-1 items-center justify-center">
                    {selected !== null && capturedImages[selected] && (
                        <Image
                            source={{ uri: `file://${capturedImages[selected]}` }}
                            className="w-full h-full rounded-lg mb-4"
                        />
                    )}
                </View>

                <View className="flex justify-end">
                    {/* Thumbnails */}
                    <View className="flex-row justify-between">
                        {capturedImages.map((uri, index) => (
                            <Pressable
                                key={index}
                                onPress={() => onSelect(index)}
                                style={{
                                    borderWidth: 2,
                                    borderRadius: 12,
                                    borderColor: selected === index ? "#10b981" : "transparent",
                                }}
                            >
                                <Image
                                    source={{ uri: `file://${uri}` }}
                                    className="w-20 h-32 rounded-lg"
                                />
                            </Pressable>
                        ))}
                    </View>

                    {/* Confirm button */}
                    <Pressable
                        onPress={onConfirm}
                        className="flex items-center justify-center w-full bg-[#3b82f6] h-[56px] rounded-[24px] mt-4"
                    >
                        <Text className="text-[#ffffff] text-base">{t("face_scan.confirm")}</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
};