import { PeerAction } from "@/types/PeerModel";
import React, { useCallback, useRef } from "react";
import {
    MediaStream,
    RTCIceCandidate,
    RTCPeerConnection,
    RTCSessionDescription
} from "react-native-webrtc";

interface UsePeerConnectionProps {
    socket: any;
    streamRef: React.MutableRefObject<MediaStream | null>;
    peerConnections: React.MutableRefObject<Record<string, RTCPeerConnection>>;
    dispatch: React.Dispatch<PeerAction>;
}

export const usePeerConnection = ({
    socket,
    streamRef,
    peerConnections,
    dispatch,
}: UsePeerConnectionProps) => {
    const signalingLocks = useRef<Record<string, boolean>>({});

    /* ---------------- CREATE PEER ---------------- */
    const createPeer = useCallback(
        (peerId: string) => {
            const peer = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
            });

            /* ADD LOCAL TRACKS */
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => {
                    peer.addTrack(track, streamRef.current!);
                });
            }

            /* ICE CANDIDATE */
            (peer as any).addEventListener("icecandidate", (event: any) => {
                if (event.candidate) {
                    console.log(`📤 Sending ICE candidate to ${peerId}`);
                    socket.emit("ice-candidate", {
                        target: peerId,
                        candidate: event.candidate,
                    });
                }
            });

            /* REMOTE STREAM */
            (peer as any).addEventListener("track", (event: any) => {
                console.log(`📥 Received remote track from ${peerId}`);
                const [remoteStream] = (event as any).streams;
                if (!remoteStream) return;

                dispatch({
                    type: "SET_PEER_STREAM",
                    id: peerId,
                    stream: remoteStream as any,
                });
            });

            /* CONNECTION STATE */
            (peer as any).addEventListener("connectionstatechange", () => {
                if (
                    peer.connectionState === "disconnected" ||
                    peer.connectionState === "failed" ||
                    peer.connectionState === "closed"
                ) {
                    peer.close();
                    delete peerConnections.current[peerId];
                    dispatch({ type: "REMOVE_PEER", id: peerId });
                }
            });

            peerConnections.current[peerId] = peer;
            return peer;
        },
        [socket, dispatch]
    );

    /* ---------------- CREATE OFFER ---------------- */
    const createOffer = useCallback(
        async (peerId: string) => {
            const peer = peerConnections.current[peerId];
            if (!peer) return;

            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);

            socket.emit("offer", {
                target: peerId,
                sdp: peer.localDescription,
            });
        },
        [socket]
    );

    /* ---------------- HANDLE OFFER ---------------- */
    const handleOffer = useCallback(
        async ({ sdp, caller }: any) => {
            let peer = peerConnections.current[caller];
            if (!peer) {
                peer = createPeer(caller);
            }

            console.log(`📩 Received offer from ${caller}. Peer state: ${peer.signalingState}, Lock: ${signalingLocks.current[caller]}`);

            if (signalingLocks.current[caller]) {
                console.warn(`⏳ Already processing signaling for ${caller}, skipping offer`);
                return;
            }

            if (peer.signalingState !== "stable") {
                console.warn(`⚠️ Collision detected (glare). Ignoring offer from ${caller} because state is ${peer.signalingState}`);
                return;
            }

            signalingLocks.current[caller] = true;
            try {
                await peer.setRemoteDescription(new RTCSessionDescription(sdp));
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);

                socket.emit("answer", {
                    target: caller,
                    sdp: peer.localDescription,
                });
                console.log(`✅ Sent answer to ${caller}`);
            } catch (err) {
                console.error(`❌ Error handling offer from ${caller}:`, err);
            } finally {
                signalingLocks.current[caller] = false;
            }
        },
        [createPeer, socket]
    );

    /* ---------------- HANDLE ANSWER ---------------- */
    const handleAnswer = useCallback(async ({ sdp, caller }: any) => {
        const peer = peerConnections.current[caller];
        if (!peer) return;

        console.log(`📩 Received answer from ${caller}. Peer state: ${peer.signalingState}, Lock: ${signalingLocks.current[caller]}`);

        if (signalingLocks.current[caller]) {
            console.warn(`⏳ Already processing signaling for ${caller}, skipping answer`);
            return;
        }

        if (peer.signalingState !== "have-local-offer") {
            console.warn(`⚠️ Ignoring answer from ${caller} because state is ${peer.signalingState}`);
            return;
        }

        signalingLocks.current[caller] = true;
        try {
            await peer.setRemoteDescription(new RTCSessionDescription(sdp));
            console.log(`✅ Set remote answer from ${caller}`);
        } catch (err) {
            console.error(`❌ Error setting remote answer from ${caller}:`, err);
        } finally {
            signalingLocks.current[caller] = false;
        }
    }, []);

    /* ---------------- HANDLE ICE ---------------- */
    const handleIceCandidate = useCallback(async ({ candidate, from }: any) => {
        const peer = peerConnections.current[from];
        if (!peer || !candidate) return;

        try {
            await peer.addIceCandidate(new RTCIceCandidate(candidate));
            // console.log(`✅ Added ICE candidate from ${from}`);
        } catch (err) {
            console.warn(`⚠️ ICE error from ${from}:`, err);
        }
    }, []);

    /* ---------------- CLEANUP ---------------- */
    const cleanupConnections = useCallback(() => {
        Object.values(peerConnections.current).forEach((peer) => peer.close());
        peerConnections.current = {};
    }, []);

    return {
        createPeer,
        createOffer,
        handleOffer,
        handleAnswer,
        handleIceCandidate,
        cleanupConnections,
    };
};
