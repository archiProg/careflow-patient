import { emitSocket } from "@/utils/socket";
import { FontAwesome } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, View } from "react-native";
import InCallManager from "react-native-incall-manager";
import { MediaStream } from "react-native-webrtc";

interface ControlButtonsProps {
  stream: MediaStream;
  isMicOn: boolean;
  isVideoOn: boolean;
  setIsMicOn: (on: boolean) => void;
  setIsVideoOn: (on: boolean) => void;
  onLeave: () => void;
}

export default function ControlButtons({
  stream,
  isMicOn,
  isVideoOn,
  setIsMicOn,
  setIsVideoOn,
  onLeave,
}: ControlButtonsProps) {
  const toggleMute = () => {
    const nextState = !isMicOn;
    console.log(`🎤 Toggling MIC to: ${nextState ? "ON" : "OFF"}`);

    stream.getAudioTracks().forEach((track) => {
      track.enabled = nextState;
    });

    // Hardware-level mute fallback
    try {
      const manager: any = InCallManager;
      if (manager && typeof manager.setMicrophoneMute === "function") {
        manager.setMicrophoneMute(!nextState);
      }
    } catch (e) {
      console.warn("Hardware mute toggle failed");
    }

    emitSocket("media-toggle", {
      type: "audio",
      enabled: nextState,
    });

    setIsMicOn(nextState);
  };

  const toggleVideo = () => {
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;

    const nextState = !isVideoOn;
    console.log(`📹 Toggling VIDEO to: ${nextState ? "ON" : "OFF"}`);

    videoTrack.enabled = nextState;

    emitSocket("media-toggle", {
      type: "video",
      enabled: nextState,
    });

    setIsVideoOn(nextState);
  };

  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  const toggleSpeaker = () => {
    const newState = !isSpeakerOn;
    console.log("Toggle speaker attempt. Current manager state:", typeof InCallManager);

    try {
      // Create a local reference and check everything twice
      const manager: any = InCallManager;
      if (manager != null && typeof manager === 'object' && typeof manager.setSpeakerphoneOn === "function") {
        manager.setSpeakerphoneOn(newState);
        setIsSpeakerOn(newState);
      } else {
        console.warn(" InCallManager is not a valid object or missing setSpeakerphoneOn. Rebuild may be required.");
      }
    } catch (e: any) {
      console.error(" Failed to toggle speaker (safe-fail):", e.message);
    }
  };

  return (
    <View className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
      <View className="flex-row items-center gap-4 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md">
        {/* LEAVE */}
        {/* <Pressable onPress={onLeave} className="p-3 rounded-full bg-red-600">
          <FontAwesome name="phone" size={18} color="white" />
        </Pressable> */}

        {/* SPEAKER */}
        {/* <Pressable
          onPress={toggleSpeaker}
          className={`p-3 rounded-full ${isSpeakerOn ? "bg-white/10" : "bg-red-600"
            }`}
        >
          <FontAwesome
            name={isSpeakerOn ? "volume-up" : "volume-off"}
            size={18}
            color="white"
          />
        </Pressable> */}

        {/* MIC */}
        <Pressable
          onPress={toggleMute}
          className={`p-3 rounded-full ${isMicOn ? "bg-white/10" : "bg-red-600"
            }`}
        >
          <FontAwesome
            name={isMicOn ? "microphone" : "microphone-slash"}
            size={18}
            color="white"
          />
        </Pressable>

        {/* CAMERA */}
        <Pressable
          onPress={toggleVideo}
          className={`p-3 rounded-full ${isVideoOn ? "bg-white/10" : "bg-red-600"
            }`}
        >
          <FontAwesome
            name={isVideoOn ? "video-camera" : "video-camera"}
            size={18}
            color="white"
          />
        </Pressable>
      </View>
    </View>
  );
}
