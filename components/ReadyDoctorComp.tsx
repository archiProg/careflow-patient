import Provider from "@/services/providerService";
import { DoctorInfoConsultModel } from "@/types/DoctorConsultModel";
import { ProfileModel } from "@/types/ProfileModel";
import { FontAwesome } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Easing, Image, Text, View } from "react-native";

import { useRef } from "react";
import { Animated } from "react-native";


const DOT_COUNT = 3;

const VerticalFlowDots = () => {
    const values = useRef(
        [...Array(DOT_COUNT)].map(() => new Animated.Value(0))
    ).current;

    useEffect(() => {
        const animations = values.map((v, index) =>
            Animated.sequence([
                Animated.delay(index * 180),

                Animated.parallel([
                    Animated.timing(v, {
                        toValue: 1,
                        duration: 240,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                ]),

                Animated.delay(120),

                Animated.timing(v, {
                    toValue: 0,
                    duration: 240,
                    easing: Easing.in(Easing.quad),
                    useNativeDriver: true,
                }),
            ])
        );

        Animated.loop(Animated.stagger(180, animations)).start();
    }, []);

    return (
        <View style={{ alignItems: "center" }}>
            {values.map((v, i) => (
                <Animated.View
                    key={i}
                    style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: "#3b82f6",
                        marginVertical: 6,
                        opacity: v,
                        transform: [
                            {
                                translateY: v.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-6, 0],
                                }),
                            },
                        ],
                    }}
                />
            ))}
        </View>
    );
};

const ImageUploadSection = ({ image, label, type }: { image: string; label: string, type: "doctor" | "patient" }) => {
    const [imgError, setImgError] = useState(false);
    useEffect(() => {
        setImgError(false);
    }, [image]);

    const showFallback = !image || imgError;

    return (
        <View className="w-full flex flex-col justify-center items-center">
            <View className="relative group">
                <View className="w-36 h-36 rounded-full overflow-hidden bg-base-100 flex items-center justify-center shadow-md">
                    {showFallback ? (
                        <FontAwesome
                            name={"user-md"}
                            size={100}
                            color="white"
                        />
                    ) : (
                        <View>
                            <Image
                                source={{
                                    uri: image,
                                }}
                                className="absolute w-36 h-36 rounded-full border-4 border-white dark:border-gray-800"
                            />
                            <View className="w-36 h-36 rounded-full items-center justify-center border-4 border-white dark:border-gray-800 bg-blue-500">
                                <FontAwesome
                                    name={type === "doctor" ? "user-md" : "user"}
                                    size={100}
                                    color="white"
                                />
                            </View>
                        </View>
                    )}
                </View>
            </View>
            <Text className="label mt-2 font-semibold">{label}</Text>
        </View>
    );
};

interface ReadyDoctorProps {
    user: ProfileModel;
    doctorFound: DoctorInfoConsultModel;
}

const ReadyDoctorComp = ({ user, doctorFound }: ReadyDoctorProps) => {
    console.log(doctorFound);

    return (
        <View className="flex flex-col justify-center items-center">
            <View className="w-full flex  justify-center items-center gap-4">
                <ImageUploadSection
                    image={Provider.HostAPI_URL + doctorFound?.profile_image_url}
                    label={doctorFound?.name}
                    type="doctor"
                />

                <View className="items-center">
                    <VerticalFlowDots />
                </View>

                <ImageUploadSection
                    image={Provider.HostAPI_URL + user?.profile_image_url}
                    label={user?.name}
                    type="patient"
                />
            </View>
        </View>
    );
};

export default ReadyDoctorComp;
