import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
let socket: Socket | null = null;


export const getSocket = (): Socket => {
  const { token } = useSelector(
    (state: RootState) => state.auth
  );
  if (!socket) {
    socket = io(process.env.API_URL, {
      transports: ["websocket"],
      extraHeaders: {
        Authorization: `Bearer ${token}`,
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

export const listenSocket = (events: { [event: string]: (...args: any[]) => void }) => {
  const s = getSocket();
  Object.entries(events).forEach(([event, callback]) => {
    s.on(event, callback);
  });
};

export const offSocket = (event: string) => {
  socket?.off(event);
};


export const emitSocket = (event: string, data?: any) => {
  const s = getSocket();
  console.log("emitSocket", event, data);

  s.emit(event, data);
};


export const closeSocket = () => {
  socket?.disconnect();
  socket = null;
};
