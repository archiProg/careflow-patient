import React from "react";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { PREPARE_TIPS, ResponsiveScale, TipIcon } from "@/types/FaceCaptureModel";

interface PrepareScreenProps {
    rs: ResponsiveScale;
    isTablet: boolean;
    prepareFadeAnim: Animated.Value;
    prepareSlideAnim: Animated.Value;
    tipAnims: Animated.Value[];
    tipSlideAnims: Animated.Value[];
    onStart: () => void;
}

const TipIconComponent = ({ icon, size, color }: { icon: TipIcon; size: number; color: string }) => {
    if (icon.lib === "Ionicons") return <Ionicons name={icon.name} size={size} color={color} />;
    return <MaterialCommunityIcons name={icon.name} size={size} color={color} />;
};

export const PrepareScreen: React.FC<PrepareScreenProps> = ({
    rs,
    isTablet,
    prepareFadeAnim,
    prepareSlideAnim,
    tipAnims,
    tipSlideAnims,
    onStart,
}) => {
    const { t } = useTranslation();

    return (
        <SafeAreaView className="flex-1 bg-[#0a0a0f]">
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingHorizontal: rs.hPadding,
                    paddingTop: rs.pTop,
                    paddingBottom: rs.pBottom,
                }}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* Header */}
                <Animated.View
                    style={{
                        opacity: prepareFadeAnim,
                        transform: [{ translateY: prepareSlideAnim }],
                        marginBottom: rs.headerMB,
                    }}
                    className="items-center"
                >
                    <View
                        style={{
                            width: rs.iconSize,
                            height: rs.iconSize,
                            borderRadius: rs.iconSize / 2,
                            borderWidth: isTablet ? 3 : 2,
                            marginBottom: rs.iconMB,
                            shadowColor: "#3b82f6",
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.6,
                            shadowRadius: 12,
                        }}
                        className="bg-[#1a1a2e] border-[#3b82f6] items-center justify-center"
                    >
                        <Ionicons name="scan-circle-outline" size={rs.iconFontSize} color="#3b82f6" />
                    </View>

                    <Text
                        style={{ fontSize: rs.titleFontSize, marginBottom: rs.titleMB }}
                        className="font-bold text-[#ffffff] tracking-wide"
                    >
                        {t("face_scan.title")}
                    </Text>
                    <Text
                        style={{ fontSize: rs.subFontSize, lineHeight: rs.subLineHeight }}
                        className="text-[#94a3b8] text-center"
                    >
                        {t("face_scan.subtitle")}
                    </Text>
                </Animated.View>

                {/* Tips card */}
                <View
                    style={{
                        borderRadius: rs.cardBorderR,
                        padding: rs.cardPadding,
                        marginBottom: rs.cardMB,
                    }}
                    className="bg-[#111827] border border-[#1e293b]"
                >
                    <Text
                        style={{ fontSize: rs.labelFontSize, marginBottom: rs.labelMB }}
                        className="font-semibold text-[#64748b] tracking-widest uppercase"
                    >
                        {t("face_scan.tips_label")}
                    </Text>

                    {PREPARE_TIPS.map((tip, index) => (
                        <Animated.View
                            key={index}
                            style={{
                                opacity: tipAnims[index],
                                transform: [{ translateX: tipSlideAnims[index] }],
                                paddingVertical: rs.tipPY,
                                borderBottomWidth: index < PREPARE_TIPS.length - 1 ? 1 : 0,
                                borderBottomColor: "#1e293b",
                            }}
                            className="flex-row items-center"
                        >
                            <View
                                style={{
                                    width: rs.tipIconSize,
                                    height: rs.tipIconSize,
                                    borderRadius: rs.tipIconBorderR,
                                    marginRight: rs.tipIconMR,
                                }}
                                className="bg-[#1e293b] items-center justify-center"
                            >
                                <TipIconComponent icon={tip.icon} size={rs.tipIconFontSize} color="#94a3b8" />
                            </View>

                            <Text
                                style={{ fontSize: rs.tipFontSize, lineHeight: rs.tipLineHeight }}
                                className="flex-1 text-[#e2e8f0]"
                            >
                                {t(tip.textKey)}
                            </Text>

                            <View
                                style={{
                                    width: rs.checkSize,
                                    height: rs.checkSize,
                                    borderRadius: rs.checkSize / 2,
                                }}
                                className="bg-[#052e16] border border-[#10b981] items-center justify-center"
                            >
                                <Ionicons name="checkmark" size={rs.checkFontSize} color="#10b981" />
                            </View>
                        </Animated.View>
                    ))}
                </View>

                {/* Start button */}
                <Pressable onPress={onStart}>
                    <Animated.View
                        style={{
                            opacity: prepareFadeAnim,
                            transform: [{ translateY: prepareSlideAnim }],
                            height: rs.btnHeight,
                            borderRadius: rs.btnBorderR,
                        }}
                        className="items-center justify-center flex-row bg-[#2563eb]"
                    >
                        <Ionicons
                            name="camera-outline"
                            size={rs.btnIconFontSize}
                            color="#ffffff"
                            style={{ marginRight: rs.tipIconMR }}
                        />
                        <Text
                            style={{ fontSize: rs.btnFontSize }}
                            className="font-bold text-[#ffffff] tracking-wide"
                        >
                            {t("face_scan.start_button")}
                        </Text>
                    </Animated.View>
                </Pressable>

            </ScrollView>
        </SafeAreaView>
    );
};