import { mediaDevices, MediaStream } from "react-native-webrtc";

export const getLocalStream = async (
  video: boolean,
  audio: boolean
): Promise<MediaStream> => {
  const stream = await mediaDevices.getUserMedia({
    video: video
      ? {
          facingMode: "user",
          width: 480,
          height: 640,
          frameRate: 30,
        }
      : false,
    audio,
  });

  return stream;
};
