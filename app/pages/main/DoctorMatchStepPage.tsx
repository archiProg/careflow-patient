import DoctorSpecialtyCard from "@/components/DoctorSpecialtyCard";
import LoadingComp from "@/components/LoadingComp";
import MatchingLoader from "@/components/MatchingLoader";
import ReadyDoctorComp from "@/components/ReadyDoctorComp";
import Provider from "@/services/providerService";
import { DoctorConsultModel, DoctorInfoConsultModel } from "@/types/DoctorConsultModel";
import { PatientRequestAck } from "@/types/SoketioResModel";
import { emitSocket, listenSocket } from "@/utils/socket";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, ScrollView, Text, useColorScheme, View } from "react-native";

const DoctorMatchStepPage = () => {
    const router = useRouter();
    const specialties = Provider.DoctorSpecialty;
    const colorScheme = useColorScheme();
    const { t } = useTranslation();
    const [step, setStep] = useState("main");
    const [loading, setLoading] = useState(false);
    const [caseId, setCaseId] = useState("");
    const [msgNodoctor, setMsgNoDoctor] = useState("");
    const [title, setTitle] = useState(t('select_specialty_to_consult'));
    const [finding, setFinding] = useState(false);
    const [doctorInfo, setDoctorInfo] = useState<DoctorInfoConsultModel | null>(null);

    const handleReqCase = async (id: number) => {
        setLoading(true);
        const res = await emitSocket<PatientRequestAck>(
            "patient:request",
            { specialty: id }
        );
        if (res.success) {
            setStep("findDoctor");
            setTitle(t('find_doctor'));
            setCaseId(res.caseId);
            setFinding(true)
        } else {
            console.error(res.error);
        }
        setLoading(false);
    };


    const clearStep = () => {
        setStep("main");
        setTitle(t('select_specialty_to_consult'));
        setCaseId("");
        setFinding(false);
        setDoctorInfo(null);
    };



    useEffect(() => {
        const cleanup = listenSocket({

            // doctor not found
            "case:no-doctor": ({ message }: { message: string }) => {
                setMsgNoDoctor(message);
                setFinding(true);
            },

            // doctor found
            "case:have-doctor": ({ message }: { message: string }) => {
                setMsgNoDoctor(message);
                setFinding(false);
            },

            // case accepted
            "case:accepted": ({
                caseId,
                doctor_info,
            }: {
                caseId: string;
                doctor_info: DoctorInfoConsultModel;
            }) => {
                setDoctorInfo(doctor_info);
                setStep("readyDoctor");
                setTimeout(() => {
                    router.replace({
                        pathname: "/pages/main/PreCallPage",
                        params: {
                            consultId: caseId
                        },
                    });

                }, 5000);
            },

            // doctor reject
            "doctor:reject": ({ caseId }: { caseId?: string }) => {

                if (caseId) {
                    clearStep();
                }
            },

            // case ended
            "case:ended": ({ caseId, endedBy }: { caseId: string; endedBy: string }) => {
                Alert.alert("คุณถูกสิ้นสุดการสัมภาษณ์", "คุณถูกสิ้นสุดการสัมภาษณ์", [
                    {
                        text: "ตกลง",
                        onPress: () => {
                            router.replace({
                                pathname: "/pages/main/ConsultSuccessPage",
                                params: {
                                    consult_id: caseId,
                                    userName: "",
                                },
                            });
                        },
                    },
                ]);
            },
        });

        return cleanup;
    }, []);



    return (
        <View className="flex-1 w-full items-center justify-center p-4">
            <View className="flex flex-row w-full pb-4 justify-between items-center ">
                <Pressable
                    className="flex-row items-center justify-start px-3 rounded-full"
                    onPress={() => {
                        router.back();
                    }}
                >
                    <FontAwesome
                        name="angle-left"
                        size={36}
                        className=" text-black dark:text-white"
                        color={colorScheme === "dark" ? "#fff" : "#000"}
                    />
                </Pressable>
                <Text className="text-xl font-bold text-black dark:text-white">{title}</Text>
                <View className="flex-row items-center justify-start px-3 rounded-full w-[36px]"></View>
            </View>
            {
                step === "main" && !loading && (
                    <View className="flex-1 w-full">
                        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                            <View className="md:flex-row flex-wrap">
                                {specialties.map((item: DoctorConsultModel) => (
                                    <Pressable key={item.id} className="md:w-1/2 p-2" onPress={() => handleReqCase(item.id)}>
                                        <DoctorSpecialtyCard specialty={item} />
                                    </Pressable>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                )
            }
            {
                step === "findDoctor" && !loading && (
                    <View className="flex-1 w-full items-center justify-center">
                        <MatchingLoader
                            status={finding}
                            imageUrl={Provider.HostAPI_URL + Provider.Profile?.profile_image_url}
                            type="patient"
                            title={finding ? t('finding_doctor') : t('finded_doctor')}
                            subtitle={finding ? t('find_doctor_description') : msgNodoctor}
                        />
                    </View>
                )
            }
            {
                step === "readyDoctor" && !loading && (
                    <View className="flex-1 w-full items-center justify-center">
                        <ReadyDoctorComp user={Provider.Profile!} doctorFound={doctorInfo!} />
                    </View>
                )
            }
            {
                loading && (
                    <View className="flex-1 w-full">
                        <LoadingComp />
                    </View>
                )
            }
        </View>
    );
};

export default DoctorMatchStepPage;