import { FontAwesome } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, Text, View } from "react-native";

type MatchingLoaderProps = {
    status: boolean; // เช่น "matching"
    imageUrl: string;
    type: "doctor" | "patient";
    title: string;
    subtitle: string;
};

const MatchingLoader = ({
    status,
    imageUrl,
    type,
    title,
    subtitle,
}: MatchingLoaderProps) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const [dots, setDots] = useState("");
    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    useEffect(() => {
        if (status === true) {
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                })
            ).start();
        }
    }, [status]);

    useEffect(() => {
        if (status === true) {
            const interval = setInterval(() => {
                setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
            }, 500);
            return () => clearInterval(interval);
        }
    }, [status]);

    return (
        <View>
            <View className="items-center mb-8 justify-center">
                {/* Loading Ring */}
                {status && (
                    <Animated.View
                        style={{
                            position: "absolute",
                            width: 220,
                            height: 220,
                            borderRadius: 110,
                            borderWidth: 4,
                            borderColor: "transparent",
                            borderTopColor: "#3b82f6",
                            borderRightColor: "#3b82f6",
                            transform: [{ rotate: spin }],
                        }}
                    />
                )}

                {/* Doctor Image */}
                <Animated.View
                    style={{
                        transform: [{ scale: pulseAnim }],
                    }}
                >
                    {imageUrl ? (
                        <View>
                            <Image
                                source={{
                                    uri: imageUrl,
                                }}
                                className="absolute w-[180px] h-[180px] rounded-full border-4 border-white dark:border-gray-800"
                            />
                            <View className="w-[180px] h-[180px] rounded-full items-center justify-center border-4 border-white dark:border-gray-800 bg-blue-500">
                                <FontAwesome
                                    name={type === "doctor" ? "user-md" : "user"}
                                    size={100}
                                    color="white"
                                />
                            </View>
                        </View>


                    ) : (
                        <View className="w-[180px] h-[180px] rounded-full items-center justify-center border-4 border-white dark:border-gray-800 bg-blue-500">
                            <FontAwesome
                                name={type === "doctor" ? "user-md" : "user"}
                                size={100}
                                color="white"
                            />
                        </View>
                    )}
                </Animated.View>
            </View>
            {/* Status Text */}
            <View className="items-center mb-6">
                <Text className="text-2xl font-bold text-black dark:text-white mb-2">
                    {status === true ? `${title}${dots}` : `${title}`}
                </Text>
                <Text className="text-base text-gray-500 dark:text-gray-400 text-center px-4">
                    {subtitle}
                </Text>
            </View>
        </View>
    );
};

export default MatchingLoader;