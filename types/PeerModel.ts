// src/types/peer.ts
import { MediaStream } from "react-native-webrtc";

export interface PeerMedia {
    stream: MediaStream | null;
    username: string;
    hasAudio: boolean;
    hasVideo: boolean;
}

export type PeerState = Record<string, PeerMedia>;

export type PeerAction =
    | {
        type: "ADD_PEER";
        id: string;
        username: string;
        hasAudio: boolean;
        hasVideo: boolean;
    }
    | {
        type: "SET_PEER_STREAM";
        id: string;
        stream: MediaStream;
    }
    | {
        type: "UPDATE_PEER_MEDIA";
        id: string;
        hasAudio: boolean;
        hasVideo: boolean;
    }
    | {
        type: "REMOVE_PEER";
        id: string;
    };
