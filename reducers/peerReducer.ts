// src/reducers/peerReducer.ts
import { PeerAction, PeerState } from "@/types/PeerModel";

export const PeerReducer = (
  state: PeerState,
  action: PeerAction
): PeerState => {
  switch (action.type) {
    case "ADD_PEER":
      return {
        ...state,
        [action.id]: {
          stream: null,
          username: action.username,
          hasAudio: action.hasAudio,
          hasVideo: action.hasVideo,
        },
      };

    case "SET_PEER_STREAM":
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          stream: action.stream,
        },
      };

    case "UPDATE_PEER_MEDIA":
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          hasAudio: action.hasAudio,
          hasVideo: action.hasVideo,
        },
      };

    case "REMOVE_PEER": {
      const copy = { ...state };
      delete copy[action.id];
      return copy;
    }

    default:
      return state;
  }
};
