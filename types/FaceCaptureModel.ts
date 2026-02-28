import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export type Step =
    | "PREPARE"
    | "BLINK"
    | "LOOK_UP"
    | "LOOK_DOWN"
    | "RIGHT"
    | "LEFT"
    | "CENTER"
    | "DONE";

export type TipIcon =
    | { lib: "Ionicons"; name: React.ComponentProps<typeof Ionicons>["name"] }
    | { lib: "MaterialCommunityIcons"; name: React.ComponentProps<typeof MaterialCommunityIcons>["name"] };

export interface ResponsiveScale {
    hPadding:        number;
    pTop:            number;
    pBottom:         number;
    iconSize:        number;
    iconFontSize:    number;
    iconMB:          number;
    titleFontSize:   number;
    titleMB:         number;
    subFontSize:     number;
    subLineHeight:   number;
    headerMB:        number;
    cardPadding:     number;
    cardBorderR:     number;
    cardMB:          number;
    labelFontSize:   number;
    labelMB:         number;
    tipPY:           number;
    tipIconSize:     number;
    tipIconBorderR:  number;
    tipIconFontSize: number;
    tipIconMR:       number;
    tipFontSize:     number;
    tipLineHeight:   number;
    checkSize:       number;
    checkFontSize:   number;
    btnHeight:       number;
    btnBorderR:      number;
    btnFontSize:     number;
    btnIconFontSize: number;
}

export const PREPARE_TIPS: { icon: TipIcon; textKey: string }[] = [
    { icon: { lib: "Ionicons", name: "sunny-outline" },              textKey: "face_scan.tips.lighting" },
    { icon: { lib: "MaterialCommunityIcons", name: "glasses" },      textKey: "face_scan.tips.no_glasses" },
    { icon: { lib: "Ionicons", name: "happy-outline" },              textKey: "face_scan.tips.neutral_face" },
    { icon: { lib: "Ionicons", name: "phone-portrait-outline" },     textKey: "face_scan.tips.hold_upright" },
    { icon: { lib: "Ionicons", name: "list-outline" },               textKey: "face_scan.tips.follow_steps" },
];