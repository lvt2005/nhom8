import express from "express"
import dotenv from 'dotenv'
dotenv.config()
const app = express()
const port = 5000
import cors from "cors"
import * as  database from "./config/database.config"
import index from "./router/index.route"
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import account_user from "./models/account_user.models";

// kêt nối CSDL
database.connect()
app.use(cors({
  origin: process.env.DOMAIN_FRONTEND,// cho phép frontend gửi dữ liệu với tên miền này 
  credentials: true, // cho phép gửi cookie về cho frontend
}))
app.use(express.json()) // chuyển Json thành js
app.use(cookieParser()) // dùng để chuyển cookie lên thành js


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.DOMAIN_FRONTEND, // Phải trùng với domain frontend
    methods: ["GET", "POST"],
    credentials: true
  }
});

const userSocketMap = new Map<string, string>();

io.on("connection", (socket) => {
  socket.on("CLIENT_JOIN", async (userId: string) => {
    if (!userId) return;
    socket.join(`user:${userId}`);
    userSocketMap.set(socket.id, userId);
    
    await account_user.updateOne({ _id: userId }, { isOnline: true, status: "online" });
    io.emit("SERVER_RETURN_USER_STATUS", { userId, status: "online", isOnline: true });
  });

  socket.on("disconnect", async () => {
    const userId = userSocketMap.get(socket.id);
    if (userId) {
      await account_user.updateOne({ _id: userId }, { isOnline: false, status: "offline" });
      io.emit("SERVER_RETURN_USER_STATUS", { userId, status: "offline", isOnline: false });
      userSocketMap.delete(socket.id);
    }
  });
});
declare global {
  var _io: any;
}
global._io = io;
app.use((req: any, res, next) => {
  req.io = io; // Gán biến io vào request
  next();
});
app.use("/",index)
// 👇 5. Sửa app.listen thành server.listen
server.listen(port, () => {
  console.log(`Socket & API Server running at http://localhost:${port}`);
});
