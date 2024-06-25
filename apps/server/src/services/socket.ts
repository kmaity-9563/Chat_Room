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

  constructor(httpServer: any) {
    console.log("Initializing socket server...");
    this._io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    sub.subscribe("MESSAGE", (err) => {
      if (err) {
        console.error("Failed to subscribe to MESSAGE channel", err);
      } else {
        console.log("Subscribed to MESSAGE channel");
      }
    });
    this.setupRedisListener();
  }

  private setupRedisListener() {
    sub.on("message", async (channel, message) => {
      if (channel === "MESSAGE") {
        try {
          const { message: msg, roomId } = JSON.parse(message);
          console.log("Message received from Redis", message);

          if (roomId && roomId.trim() !== "") {
            this._io.to(roomId).emit("message", { message: msg });
          } else {
            this._io.emit("message", { message: msg });
          }

          await produceMessage(msg);
        } catch (error) {
          console.error("Error processing message from Redis", error);
        }
      }
    });
  }

  public initListeners() {
    this._io.on("connection", (socket) => {
      console.log("New socket connected", socket.id);

      socket.on("join-room", async ({ roomId }: { roomId: string }) => {
        if (roomId && roomId.trim() !== "") {
          await socket.join(roomId);
          console.log(`Socket ${socket.id} joined room ${roomId}`);
        } else {
          console.error(`Invalid roomId provided by socket ${socket.id}`);
        }
      });

      socket.on("event:message", async ({ message, roomId }: { message: string, roomId: string }) => {
        if (message && roomId) {
          console.log("Publishing message to Redis", message);
          await pub.publish("MESSAGE", JSON.stringify({ message, roomId }));
        } else {
          console.error("Invalid message or roomId");
        }
      });

      socket.on("disconnect", () => {
        console.log(`Socket ${socket.id} disconnected`);
      });
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketServices;
