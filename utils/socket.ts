import Provider from "@/services/providerService";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(Provider.SOCKETIO_URL, {
      transports: ["websocket"],
      extraHeaders: {
        Authorization: `Bearer ${Provider.Token}`,
      },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("💎 Socket.io Connected:", socket?.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket.io Connect Error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Socket.io Disconnected:", reason);
    });
  }

  return socket;
};

export const listenSocket = <
  T extends Record<string, (...args: any[]) => void>
>(
  events: T
) => {
  const s = getSocket();

  Object.entries(events).forEach(([event, callback]) => {
    s.on(event, callback);
  });

  return () => {
    Object.entries(events).forEach(([event, callback]) => {
      s.off(event, callback);
    });
  };
};

export const offSocket = (event: string) => {
  socket?.off(event);
};

export const emitSocket = <TAck = any>(
  event: string,
  data?: any
): Promise<TAck> => {
  const s = getSocket();
  console.log("emitSocket", event, data);

  return new Promise((resolve, reject) => {
    s.emit(event, data, (ack: TAck) => {
      resolve(ack);
    });

    // (optional) กันกรณี socket หลุด
    // setTimeout(() => reject(new Error("Socket timeout")), 10000);
  });
};

export const closeSocket = () => {
  socket?.disconnect();
  socket = null;
};
