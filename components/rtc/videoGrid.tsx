import { PeerState } from "@/types/PeerModel";
import { View } from "react-native";
import PeerVideo from "./peerVideo";

interface VideoGridProps {
  peers: PeerState;
}

const VideoGrid = ({ peers }: VideoGridProps) => {
  const peerEntries = Object.entries(peers);
  console.log(peerEntries);

  return (
    <View className="flex-1 justify-center">
      <View
        className={`flex-row flex-wrap gap-2 ${peerEntries.length <= 1 ? "justify-center" : ""
          }`}
      >
        {peerEntries.map(([id, peer]) => (
          <View
            key={id}
            className={peerEntries.length <= 1 ? "w-full h-full flex-1 justify-center" : "w-1/2"}
          >
            <PeerVideo
              peerID={id}
              peerUsername={peer.username ?? "Unknown"}
              stream={peer.stream}
              hasAudio={peer.hasAudio}
              hasVideo={peer.hasVideo}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

export default VideoGrid;
