import { FontAwesome } from "@expo/vector-icons";
import { memo } from "react";
import { Text, View } from "react-native";
import { MediaStream, RTCView } from "react-native-webrtc";

interface PeerVideoProps {
  peerID?: string;
  peerUsername?: string;
  stream?: MediaStream | null;
  hasAudio: boolean;
  hasVideo: boolean;
}

function PeerVideo({
  peerID = "",
  peerUsername = "",
  stream,
  hasAudio,
  hasVideo,
}: PeerVideoProps) {
  return (
    <View className="relative h-full overflow-hidden bg-black">
      {/* Video */}
      {stream && hasVideo ? (
        <RTCView
          key={stream?.toURL()}
          streamURL={stream.toURL()}
          // objectFit="cover"
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            backgroundColor: "black",
          }}
        />
      ) : (
        <View className="absolute inset-0 flex items-center justify-center bg-black">
          <View className="bg-gray-200/60 p-4 rounded-full">
            <FontAwesome name="user" size={32} color="white" />
          </View>
        </View>
      )}

      {/* Footer */}
      <View className="flex-row items-center gap-1 absolute top-0 left-0 min-h-[35px] px-2 py-1 bg-black/50 rounded-br-md z-20">
        <Text className="text-white text-xs">
          {peerUsername.slice(0, 5)}
        </Text>

        {!hasAudio && (
          <View className="bg-black/60 p-1 rounded-full">
            <FontAwesome name="microphone-slash" size={16} color="white" />
          </View>
        )}

        {!hasVideo && (
          <View className="bg-black/60 p-1 rounded-full">
            <FontAwesome name="video-camera" size={16} color="white" />
          </View>
        )}
      </View>
    </View>
  );
}

export default memo(PeerVideo);
