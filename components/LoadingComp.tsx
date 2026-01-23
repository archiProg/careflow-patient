import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

const LoadingComp = () => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;
    const { t } = useTranslation();

    useEffect(() => {
        const animateDot = (dot: Animated.Value, delay: number) => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(dot, {
                        toValue: -10,
                        duration: 400,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                        delay,
                    }),
                    Animated.timing(dot, {
                        toValue: 0,
                        duration: 400,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        animateDot(dot1, 0);
        animateDot(dot2, 150);
        animateDot(dot3, 300);
    }, []);

    return (
        <View style={styles.overlay}>
            <View style={styles.loaderContainer}>
                <View style={styles.dotsContainer}>
                    <Animated.View
                        style={[styles.dot, { transform: [{ translateY: dot1 }] }]}
                    />
                    <Animated.View
                        style={[styles.dot, { transform: [{ translateY: dot2 }] }]}
                    />
                    <Animated.View
                        style={[styles.dot, { transform: [{ translateY: dot3 }] }]}
                    />
                </View>
                <Text
                    style={styles.loadingText}
                    className="pt-4 text-center text-lg font-semibold text-black dark:text-white"
                >
                    {t("loading...")}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
    },
    loaderContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    dotsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: 60,
        marginBottom: 20,
    },
    dot: {
        width: 15,
        height: 15,
        borderRadius: 7.5,
        backgroundColor: "#3b82f6",
        shadowColor: "#3b82f6",
        shadowOpacity: 0.6,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
    },
    loadingText: {
        fontSize: 18,
        fontWeight: "600",
        letterSpacing: 1,
    },
});

export default LoadingComp;
