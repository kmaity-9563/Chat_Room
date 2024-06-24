"use client";
import { io, Socket } from "socket.io-client";
import React, { useCallback, useEffect, useContext, useState } from "react";

interface ISocketContext {
  sendMessage: (msg: string, roomid: string) => void;
  messages: string[];
  socketID: string | null;
  sendRoomId: (roomId: string) => void;
}

const SocketContext = React.createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within a SocketProvider");
  return context;
};

interface SocketProviderProps {
  children?: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [socketID, setSocketId] = useState<string | null>(null);

  const sendMessage = useCallback((msg: string, roomid: string) => {
    if (socket) {
      socket.emit("event:message", { message: msg, roomId: roomid });
    }
  }, [socket]);

  const sendRoomId = useCallback((roomId: string) => {
    if (socket) {
      socket.emit("join-room", { roomid: roomId });
    }
  }, [socket]);

  const onMsgRcv = useCallback((msg: string) => {
    const parsedMsg = JSON.parse(msg) as { message: string };
    console.log("received message", parsedMsg);
    setMessages((prevMessages) => [...prevMessages, parsedMsg.message]);
  }, []);

  useEffect(() => {
    const _socket = io("http://localhost:8000");

    _socket.on("connect", () => {
      setSocketId(_socket.id ?? null); // Ensure socket.id is not undefined
      console.log("_socket.id", _socket.id);

      _socket.on("message", onMsgRcv);
      setSocket(_socket);
    });

    return () => {
      _socket.off("message", onMsgRcv);
      _socket.disconnect();
    };
  }, [onMsgRcv]);

  return (
    <SocketContext.Provider value={{ sendMessage, messages, socketID, sendRoomId }}>
      {children}
    </SocketContext.Provider>
  );
};
