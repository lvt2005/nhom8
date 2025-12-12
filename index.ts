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
