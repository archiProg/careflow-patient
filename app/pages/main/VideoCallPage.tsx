import ControlButtons from "@/components/rtc/controlButtons";
import LocalVideo from "@/components/rtc/localVideo";
import VideoGrid from "@/components/rtc/videoGrid";
import { user_role } from "@/constants/enums";
import { usePeerConnection } from "@/hooks/usePeerConnection";
import Provider from "@/services/providerService";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addPeer, removePeer, updatePeerMedia } from "@/store/peerSlice";
import { UserConnected } from "@/types/SoketioResModel";
import { emitSocket, listenSocket } from "@/utils/socket";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
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
    const router = useRouter();
    const dispatch = useAppDispatch();
    const peers = useAppSelector((state) => state.peer);
    const [streamReady, setStreamReady] = useState(false);
    const peerConnections = useRef<Record<string, any>>({});
    const streamRef = useRef<MediaStream | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);

    const {
        createPeer,
        createOffer,
        handleOffer,
        handleAnswer,
        handleIceCandidate,
        cleanupConnections,
    } = usePeerConnection({
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
                    emitSocket("doctor:end-case", { caseId: roomId });

                    if (Provider.Profile?.role == user_role.d) {
                        router.replace({
                            pathname: "/pages/main/ConsultSuccessPage",
                            params: {
                                consult_id: roomId,
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

            "case:ended": ({ caseId, endedBy }: { caseId: string; endedBy: string }) => {
                console.log(caseId, endedBy);
                router.replace(`/pages/main/ConsultSuccessPage`);
            },

        });

        return cleanup;
    }, []);


    useEffect(() => {
        console.log("streamReady", streamReady);

        if (!streamReady) {
            console.log("stream not ready");
            return;
        };

        const onConnect = async () => {
            const res = await emitSocket<UserConnected[]>("join-room", {
                roomId,
                username: userName,
                hasAudio: audio === "1",
                hasVideo: video === "1",
            });

            console.log(
                `Joined room successfully. ${res?.length ?? 0} other(s) present.`
            );

            res?.forEach((p) => {
                if (peerConnections.current[p.id]) return;

                createPeer(p.id);

                dispatch(
                    addPeer({
                        id: p.id,
                        username: p.username,
                        hasAudio: p.hasAudio,
                        hasVideo: p.hasVideo,
                    })
                );


                createOffer(p.id);
            });

        };

        const handleSocketConnect = () => {
            onConnect();
        };



        const cleanup = listenSocket({
            connect: handleSocketConnect,

            connect_error: (err: any) => {
                console.error("🔌 Socket Connection Error:", err.message);
            },

            offer: handleOffer,
            answer: handleAnswer,
            "ice-candidate": handleIceCandidate,

            "peer-media-updated": ({ id, hasAudio, hasVideo }: { id: string; hasAudio: boolean; hasVideo: boolean }) => {
                dispatch(updatePeerMedia({ id, hasAudio, hasVideo }));
            },

            "user-connected": ({ id, username, hasAudio, hasVideo }: { id: string; username: string; hasAudio: boolean; hasVideo: boolean }) => {
                if (peerConnections.current[id]) return;

                createPeer(id);

                dispatch(
                    addPeer({
                        id,
                        username,
                        hasAudio,
                        hasVideo,
                    })
                );
            },

            "user-disconnected": (id: string) => {
                peerConnections.current[id]?.close();
                delete peerConnections.current[id];
                dispatch(removePeer({ id }));
            },
        });

        return cleanup;
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
