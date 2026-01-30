import { FontAwesome } from "@expo/vector-icons";
import React, { memo } from "react";
import { Dimensions, Text, View } from "react-native";
import { MediaStream, RTCView } from "react-native-webrtc";

interface LocalVideoProps {
  localID?: string;
  localName?: string;
  stream?: MediaStream | null;
  isMicOn?: boolean;
  isVideoOn?: boolean;
}

const { width, height } = Dimensions.get("window");
const PIP_WIDTH = width * 0.2;
const PIP_HEIGHT = (PIP_WIDTH / 3) * 4;

function LocalVideo({
  localID = "",
  localName = "",
  stream,
  isMicOn = true,
  isVideoOn = true,
}: LocalVideoProps) {
  // Use props instead of calculating from tracks to ensure React re-renders correctly
  const hasVideo = isVideoOn;
  const hasAudio = isMicOn;

  return (
    <View
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        width: PIP_WIDTH,
        height: PIP_HEIGHT,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "#6b7280", // gray-500
        backgroundColor: "#27272a", // neutral
        zIndex: 99,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      }}
    >
      {/* LOCAL VIDEO */}
      {stream && hasVideo ? (
        <RTCView
          key={stream?.toURL()}
          streamURL={stream.toURL()}
          mirror
          objectFit="cover"
          zOrder={2}
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            borderRadius: 12,
            backgroundColor: "black",
          }}
        />
      ) : (
        <View
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <FontAwesome
            name="video-camera"
            size={40}
            color="white"
            style={{ opacity: 0.7 }}
          />
          <Text className="mt-2 text-sm text-white opacity-70">
            {/* {t("Camera_disabled")} */}
            Camera_disabled
          </Text>
        </View>
      )}
    </View>
  );
}

export default memo(LocalVideo);
