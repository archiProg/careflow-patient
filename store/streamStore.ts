// store/streamStore.ts
import type { MediaStream } from "react-native-webrtc";

const peerStreams = new Map<string, MediaStream>();

export const setPeerStream = (peerId: string, stream: MediaStream) => {
    peerStreams.set(peerId, stream);
};

export const getPeerStream = (peerId: string) => {
    return peerStreams.get(peerId);
};

export const removePeerStream = (peerId: string) => {
    peerStreams.delete(peerId);
};