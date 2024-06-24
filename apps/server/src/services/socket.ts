import { Server } from "socket.io";
import { Redis } from "ioredis";
import { produceMessage } from './kafka';
import prismaClient from "./prisma";

const pub = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  username: process.env.REDIS_USERNAME || '',
  password: process.env.REDIS_PASSWORD || ''
});

const sub = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  username: process.env.REDIS_USERNAME || '',
  password: process.env.REDIS_PASSWORD || ''
});

class SocketServices {
  private _io: Server;

  constructor() {
    console.log("Initializing socket server...");
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*"
      }
    });
    sub.subscribe("MESSAGE");
    this.setupRedisListener();
  }

  private setupRedisListener() {
    sub.on("message", async (channel, message) => {
      if (channel === "MESSAGE") {
        const { message: msg, roomId } = JSON.parse(message);
        console.log("Message in Redis subscriber", message);

        if (roomId && roomId.trim() !== "") {
          this._io.to(roomId).emit("message", JSON.stringify({ message: msg }));
        } else {
          this._io.emit("message", JSON.stringify({ message: msg }));
        }

        await produceMessage(msg);
      }
    });
  }

  public initListeners() {
    const io = this.io;
    io.on("connect", (socket) => {
      console.log("New socket connected", socket.id);

      socket.on("join-room", async ({ roomId }: { roomId: string }) => {
        await socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
      });

      socket.on("event:message", async ({ message, roomId }: { message: string, roomId: string }) => {
        console.log("Message before publishing to Redis", message);
        await pub.publish("MESSAGE", JSON.stringify({ message, roomId }));
      });
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketServices;
