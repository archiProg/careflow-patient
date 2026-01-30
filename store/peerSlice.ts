import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { PeerState } from "@/types/PeerModel";
import { MediaStream } from "react-native-webrtc";

const initialState: PeerState = {};

const peerSlice = createSlice({
    name: "peer",
    initialState,
    reducers: {
        addPeer: (
            state,
            action: PayloadAction<{
                id: string;
                username: string;
                hasAudio: boolean;
                hasVideo: boolean;
            }>
        ) => {
            const { id, username, hasAudio, hasVideo } = action.payload;
            state[id] = {
                stream: null,
                username,
                hasAudio,
                hasVideo,
            };
        },

        setPeerStream: (
            state,
            action: PayloadAction<{
                id: string;
                stream: MediaStream;
            }>
        ) => {
            const { id, stream } = action.payload;
            if (state[id]) {
                state[id].stream = stream;
            }
        },

        removePeer: (
            state,
            action: PayloadAction<{ id: string }>
        ) => {
            delete state[action.payload.id];
        },

        updatePeerMedia: (
            state,
            action: PayloadAction<{
                id: string;
                hasAudio: boolean;
                hasVideo: boolean;
            }>
        ) => {
            const { id, hasAudio, hasVideo } = action.payload;
            if (state[id]) {
                state[id].hasAudio = hasAudio;
                state[id].hasVideo = hasVideo;
            }
        },
    },
});

export const {
    addPeer,
    setPeerStream,
    removePeer,
    updatePeerMedia,
} = peerSlice.actions;

export default peerSlice.reducer;
