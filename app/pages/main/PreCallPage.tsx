import { getLocalStream } from "@/hooks/useLocalStream";
import Provider from "@/services/providerService";
import { PermissionService } from "@/utils/permission";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MediaStream, RTCView } from "react-native-webrtc";

import { listenSocket } from "@/utils/socket";
import { useKeepAwake } from "expo-keep-awake";
import { useTranslation } from "react-i18next";
const PreCallPage: React.FC = () => {
  useKeepAwake();
  const { consultId } = useLocalSearchParams<{
    consultId: string;
  }>();
  const router = useRouter();
  const { t } = useTranslation();
  const [settings, setSettings] = useState({ audio: true, video: true });
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const toggleAudio = () => setSettings(p => ({ ...p, audio: !p.audio }));
  const toggleVideo = () => setSettings(p => ({ ...p, video: !p.video }));
  const handleJoinCall = async () => {
    const camGranted = settings.video
      ? await PermissionService.requestCameraPermission()
      : true;
    const micGranted = settings.audio
      ? await PermissionService.requestMicrophonePermission()
      : true;
    if (!camGranted || !micGranted) {
      Alert.alert("กรุณาอนุญาตกล้องและไมโครโฟน");
      return;
    }
    const stream = await getLocalStream(settings.video, settings.audio);
    if (!stream) {
      Alert.alert("ไม่สามารถเข้าถึงกล้อง/ไมโครโฟน");
      return;
    }
    console.log("Local stream tracks:", stream.getTracks().map(t => t.kind));
    setLocalStream(stream);
  };
  // เริ่ม preview ทันทีที่ component mount
  useEffect(() => {
    handleJoinCall();
    return () => {
      localStream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  useEffect(() => {
    const cleanup = listenSocket({

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
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 p-4">
      <View className="flex-1">
        {/* Video preview */}
        <View className="flex-1 pt-4 pb-16">
          <View className="bg-black rounded-3xl overflow-hidden flex-1">
            {settings.video && localStream ? (
              <RTCView
                key={localStream?.toURL()}
                streamURL={localStream.toURL()}
                style={{ flex: 1, backgroundColor: "black", width: "100%", height: "100%" }}
                objectFit="cover"
                mirror
              />
            ) : (
              <View className="flex-1 justify-center items-center">
                {/* placeholder / avatar */}
                {Provider.Profile?.profile_image_url ? (
                  <Image
                    source={{
                      uri: Provider.HostAPI_URL + Provider.Profile.profile_image_url,
                    }}
                    className="w-32 h-32 rounded-full"
                  />
                ) : (
                  <View className="w-32 h-32 rounded-full bg-blue-600 items-center justify-center mb-4">
                    <Text className="text-white text-5xl font-bold">
                      {Provider.Profile?.name[0]}
                    </Text>
                  </View>
                )}
                <Text className="text-white text-xl font-medium">คุณ</Text>
              </View>
            )}
          </View>
          {/* Controls – อยู่บน video, z‑index สูง */}
          <View className="absolute bottom-28 left-0 right-0 flex-row justify-center z-10">
            <TouchableOpacity
              onPress={toggleAudio}
              className="w-14 h-14 rounded-full items-center justify-center mx-3 bg-gray-800"
            >
              <FontAwesome
                name={settings.audio ? "microphone" : "microphone-slash"}
                size={24}
                color="#FFF"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleVideo}
              className="w-14 h-14 rounded-full items-center justify-center mx-3 bg-gray-800"
            >
              <FontAwesome5
                name={settings.video ? "video" : "video-slash"}
                size={20}
                color="#FFF"
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* Bottom button – join call */}
        <View className="px-6 pb-6 pt-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <Pressable
            onPress={() => {
              router.replace({
                pathname: "/pages/main/VideoCallPage",
                params: {
                  token: Provider.Token,
                  roomId: consultId,
                  userName: Provider.Profile?.name ?? "Unknown",
                  audio: settings.audio ? "1" : "0",
                  video: settings.video ? "1" : "0",
                },
              });
            }}
            className="bg-blue-500 h-14 rounded-2xl justify-center items-center active:scale-98 shadow-lg"
          >
            <Text className="text-white font-bold text-lg">{t("joinCall")}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};
export default PreCallPage;
