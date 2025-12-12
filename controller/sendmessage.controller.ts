// FILE: controller/sendmessage.controller.ts
import { Request, Response } from "express";
import { chat_history } from "../models/chathistory.models"; 
import account_user from "../models/account_user.models";

// 1. Hàm Gửi Tin Nhắn
export const sendMessage = async (req: any, res: Response) => {
  try {
    const { sender_id, receiver_id, content, type } = req.body;
    let room_chat_id;

    if (type === 'group') {
        room_chat_id = receiver_id; // Group dùng ID nhóm
    } else {
        room_chat_id = [sender_id, receiver_id].sort().join("-"); // Friend dùng ID ghép
    }

    const chat = new chat_history({
      sender_id, receiver_id, content, room_chat_id 
    });
    await chat.save();

    const chatPopulated = await chat_history.findById(chat._id).populate("sender_id", "fullName avatar");
    req.io.emit("SERVER_RETURN_MESSAGE", chatPopulated);

    res.json({ code: "success", Message: "Gửi thành công!", data: chatPopulated });
  } catch (error) {
    res.json({ code: "error", Message: "Lỗi server", error });
  }
};

// 2. Hàm Lấy Lịch Sử
export const getListMessage = async (req: any, res: Response) => {
  try {
    const myId = req.account._id || req.account.id;
    const { receiver_id, type } = req.body; 
    let room_chat_id;

    if (type === 'group') {
        room_chat_id = receiver_id;
    } else {
        room_chat_id = [myId, receiver_id].sort().join("-");
    }

    const chats = await chat_history.find({ room_chat_id, deleted: false })
      .sort({ createdAt: 1 })
      .populate("sender_id", "fullName avatar"); 

    res.json({ code: "success", Message: "Lấy thành công!", data: chats });
  } catch (error) {
    res.json({ code: "error", Message: "Lỗi lấy tin nhắn", error });
  }
};