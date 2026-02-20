import ControlButtons from "@/components/rtc/controlButtons";
import LocalVideo from "@/components/rtc/localVideo";
import VideoGrid from "@/components/rtc/videoGrid";
import { user_role } from "@/constants/enums";
import { usePeerConnection } from "@/hooks/usePeerConnection";
import { PeerReducer } from "@/reducers/peerReducer";
import Provider from "@/services/providerService";
import { UserConnected } from "@/types/SoketioResModel";
import { emitSocket, emitSocket2, getSocket, isSocketConnected, listenSocket } from "@/utils/socket";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import InCallManager from "react-native-incall-manager";
import { mediaDevices, MediaStream } from "react-native-webrtc";

const VideoCallPage = () => {
  const { roomId, userName, audio, video } = useLocalSearchParams<{
    roomId: string;
    userName: string;
    audio: string;
    video: string;
  }>();
  console.log("roomId", roomId, userName, audio, video);

  const { t } = useTranslation();
  const socket = getSocket();
  const router = useRouter();
  const [peers, dispatch] = useReducer(PeerReducer, {});
  const [streamReady, setStreamReady] = useState(false);
  const peerConnections = useRef<Record<string, any>>({});
  const streamRef = useRef<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const handledPermissionRef = useRef<Set<string>>(new Set());
  const {
    createPeer,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    cleanupConnections,
  } = usePeerConnection({
    socket,
    streamRef,
    peerConnections,
    dispatch,
  });

  /* INIT MEDIA */
  useEffect(() => {
    const init = async () => {
      try {
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        console.log("Local stream initialized:", stream.toURL());
        console.log(
          "Tracks:",
          stream.getTracks().map((t) => `${t.kind}: ${t.enabled}`),
        );
        streamRef.current = stream;
        console.log("streamRef.current : ");
        console.log(streamRef.current);

        setLocalStream(stream);
        setStreamReady(true);
      } catch (error) {
        console.error("Failed to get local stream:", error);
      }
    };
    init();

    setIsVideoOn(video === "1");
    setIsMicOn(audio === "1");
    return cleanupConnections;
  }, []);

  const handleLeave = useCallback(() => {
    Alert.alert(t("leave"), t("leave-call-description"), [
      {
        text: t("cancel"),
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      {
        text: t("ok"),
        onPress: () => {
          setIsMicOn(false);
          setIsVideoOn(false);
          emitSocket2("doctor:end-case", { caseId: roomId });

          if (Provider.Profile?.role == user_role.d) {
            router.replace({
              pathname: "/pages/main/ConsultSuccessPage",
              params: {
                token: Provider.Token,
                consult_id: roomId,
                userName: Provider.Profile?.name ?? "Unknown",
              },
            });
          }
          cleanupConnections();
        },
      },
    ]);
  }, [cleanupConnections]);

  useEffect(() => {
    const cleanup = listenSocket({
      "case:ended": ({
        caseId,
        endedBy,
      }: {
        caseId: string;
        endedBy: string;
      }) => {
        console.log(caseId, endedBy);
        router.replace({
          pathname: "/pages/main/ConsultSuccessPage",
          params: {
            token: Provider.Token,
            consult_id: roomId,
            userName: Provider.Profile?.name ?? "Unknown",
          },
        });
      },
    });

    return cleanup;
  }, []);

  useEffect(() => {
    const cleanup = listenSocket({
      "patient:permission_request": (payload: {
        caseId: string;
        permissionId: number;
        message: string;
      }) => {
        console.log("📥 patient:permission_request", payload);

        // // กัน alert ซ้ำ
        // const key = `${payload.caseId}-${payload.permissionId}`;
        // if (handledPermissionRef.current.has(key)) return;
        // handledPermissionRef.current.add(key);
        Alert.alert(
          t("permission_request"),
          t("permission_message"),
          [
            {
              text: t("reject") || "ไม่ยินยอม",
              style: "cancel",
              onPress: () => {
                console.log("❌ Permission rejected");

                emitSocket2("patient:permission_reject", {
                  caseId: roomId,
                  permissionId: payload.permissionId,
                });
              },
            },
            {
              text: t("accept") || "✅ ยินยอม",
              style: "default",
              onPress: () => {
                console.log("✅ Permission accepted");

                emitSocket2("patient:permission_accept", {
                  caseId: roomId,
                  permissionId: payload.permissionId,
                });
              },
            },
          ],
          {
            cancelable: false,
            userInterfaceStyle: "light", // หรือ "dark" ตามธีมของแอพ
          },
        );
      },
    });

    return cleanup;
  }, []);

  /* SOCKET & SIGNALING */
  useEffect(() => {
    if (!streamReady) return;

    let joined = false;

    const joinRoom = async () => {
      if (joined) return;
      joined = true;

      console.log("🚪 joining room...");

      try {
        const res = await emitSocket<UserConnected[]>("join-room", {
          roomId,
          username: userName,
          hasAudio: audio === "1",
          hasVideo: video === "1",
        });

        if (!res) {
          throw new Error("No response from server");
        }

        console.log("✅ Joined room", res);

        res?.forEach((p) => {
          if (peerConnections.current[p.id]) return;

          createPeer(p.id);

          dispatch({
            type: "ADD_PEER",
            id: p.id,
            username: p.username,
            hasAudio: p.hasAudio,
            hasVideo: p.hasVideo,
          });

          createOffer(p.id);
        });
      } catch (error) {
        console.error("❌ Failed to join room:", error);
        Alert.alert(t("error_join_room"), t("error_join_room_description"), [
          {
            text: t("ok"),
            onPress: () => router.back(),
          },
        ]);
      }
    };

    if (isSocketConnected()) {
      joinRoom();
    }

    const cleanupSocket = listenSocket({
      connect: joinRoom,

      connect_error: (err: any) => {
        console.error("🔌 Socket Connection Error:", err.message);
        Alert.alert(
          t("error_socket_connection"),
          t("error_socket_connection_description"),
          [
            {
              text: t("ok"),
              onPress: () => router.back(),
            },
          ],
        );
      },

      offer: handleOffer,
      answer: handleAnswer,
      "ice-candidate": handleIceCandidate,

      "peer-media-updated": ({ id, hasAudio, hasVideo }) => {
        dispatch({ type: "UPDATE_PEER_MEDIA", id, hasAudio, hasVideo });
      },

      "user-connected": ({ id, username, hasAudio, hasVideo }) => {
        if (peerConnections.current[id]) return;

        createPeer(id);

        dispatch({
          type: "ADD_PEER",
          id,
          username,
          hasAudio,
          hasVideo,
        });
      },

      "user-disconnected": (id: string) => {
        peerConnections.current[id]?.close();
        delete peerConnections.current[id];
        dispatch({ type: "REMOVE_PEER", id });
      },
    });

    try {
      const manager: any = InCallManager;
      if (manager && typeof manager.start === "function") {
        manager.start({ media: "video" });
        if (typeof manager.setSpeakerphoneOn === "function") {
          manager.setSpeakerphoneOn(true);
        }
        console.log("🔊 InCallManager started (Speaker: ON)");
      }
    } catch (e: any) {
      console.warn("❌ InCallManager start failed:", e.message);
    }

    return () => {
      cleanupSocket();

      try {
        const manager: any = InCallManager;
        if (manager && typeof manager.stop === "function") {
          manager.stop();
          console.log("🔇 InCallManager stopped");
        }
      } catch (e) {
        console.warn("⚠️ Failed to stop InCallManager");
      }
    };
  }, [streamReady, roomId, userName, audio, video]);


  return (
    <View className="flex-1 bg-black h-full">
      <View className="flex-1">
        <VideoGrid peers={peers} />
        <LocalVideo
          localName={Provider.Profile?.name || "N/A"}
          stream={localStream}
          isMicOn={isMicOn}
          isVideoOn={isVideoOn}
        />
        {localStream && (
          <ControlButtons
            stream={localStream}
            isMicOn={isMicOn}
            isVideoOn={isVideoOn}
            setIsMicOn={setIsMicOn}
            setIsVideoOn={setIsVideoOn}
            onLeave={handleLeave}
          />
        )}
      </View>
    </View>
  );
};

export default VideoCallPage;
