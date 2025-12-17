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

    // Xử lý file upload nếu có
    let file_url = null;
    let file_type = null;
    let file_name = null;
    
    if (req.file) {
      file_url = req.file.path;
      file_name = req.file.originalname;
      // Xác định loại file
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
      const fileExtension = req.file.originalname.split('.').pop()?.toLowerCase();
      file_type = imageExtensions.includes(fileExtension || '') ? 'image' : 'file';
    }

    const chat = new chat_history({
      sender_id, receiver_id, content, room_chat_id, file_url, file_type, file_name
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

    // Lấy tất cả tin nhắn, sau đó lọc theo deleted_for_me và deleted_for_everyone
    // Sắp xếp: tin nhắn được ghim lên đầu, sau đó theo thời gian
    const allChats = await chat_history.find({ room_chat_id })
      .sort({ pinned: -1, createdAt: 1 })
      .populate("sender_id", "fullName avatar")
      .populate("forwarded_from", "content file_url file_type file_name sender_id")
      .populate("forwarded_from.sender_id", "fullName avatar")
      .populate("pinned_by", "fullName");

    // Lọc tin nhắn: không hiển thị nếu deleted_for_everyone hoặc deleted_for_me chứa myId
    const chats = allChats.filter(chat => {
      if (chat.deleted_for_everyone) return false;
      if (chat.deleted_for_me && chat.deleted_for_me.some((id: any) => id.toString() === myId.toString())) return false;
      return true;
    });

    res.json({ code: "success", Message: "Lấy thành công!", data: chats });
  } catch (error) {
    res.json({ code: "error", Message: "Lỗi lấy tin nhắn", error });
  }
};

// 3. Hàm Thu hồi phía bạn (chỉ mình bạn không thấy)
export const deleteForMe = async (req: any, res: Response) => {
  try {
    const myId = req.account._id || req.account.id;
    const { message_id } = req.body;

    const message = await chat_history.findById(message_id);
    if (!message) {
      return res.json({ code: "error", Message: "Tin nhắn không tồn tại!" });
    }

    // Thêm myId vào mảng deleted_for_me nếu chưa có
    if (!message.deleted_for_me) {
      message.deleted_for_me = [];
    }
    if (!message.deleted_for_me.some((id: any) => id.toString() === myId.toString())) {
      message.deleted_for_me.push(myId);
      await message.save();
    }

    // Gửi thông báo qua socket (chỉ cho user này)
    req.io.emit("SERVER_MESSAGE_DELETED_FOR_ME", { 
      message_id: message._id, 
      room_chat_id: message.room_chat_id,
      user_id: myId 
    });

    res.json({ code: "success", Message: "Đã xóa tin nhắn!" });
  } catch (error) {
    res.json({ code: "error", Message: "Lỗi xóa tin nhắn", error });
  }
};

// 4. Hàm Thu hồi phía mọi người (chỉ người gửi mới có thể)
export const deleteForEveryone = async (req: any, res: Response) => {
  try {
    const myId = req.account._id || req.account.id;
    const { message_id } = req.body;

    const message = await chat_history.findById(message_id);
    if (!message) {
      return res.json({ code: "error", Message: "Tin nhắn không tồn tại!" });
    }

    // Chỉ người gửi mới có thể thu hồi cho mọi người
    if (message.sender_id.toString() !== myId.toString()) {
      return res.json({ code: "error", Message: "Bạn không có quyền thu hồi tin nhắn này cho mọi người!" });
    }

    // Đánh dấu deleted_for_everyone
    message.deleted_for_everyone = true;
    message.deletedAt = new Date();
    await message.save();

    // Gửi thông báo qua socket cho tất cả mọi người trong room
    req.io.emit("SERVER_MESSAGE_DELETED_FOR_EVERYONE", { 
      message_id: message._id, 
      room_chat_id: message.room_chat_id 
    });

    res.json({ code: "success", Message: "Đã thu hồi tin nhắn cho mọi người!" });
  } catch (error) {
    res.json({ code: "error", Message: "Lỗi thu hồi tin nhắn", error });
  }
};

// 5. Hàm Chuyển tiếp tin nhắn
export const forwardMessage = async (req: any, res: Response) => {
  try {
    const myId = req.account._id || req.account.id;
    const { message_id, receiver_id, type } = req.body;

    const originalMessage = await chat_history.findById(message_id)
      .populate("sender_id", "fullName avatar");
    
    if (!originalMessage) {
      return res.json({ code: "error", Message: "Tin nhắn không tồn tại!" });
    }

    let room_chat_id;
    if (type === 'group') {
        room_chat_id = receiver_id;
    } else {
        room_chat_id = [myId, receiver_id].sort().join("-");
    }

    // Tạo tin nhắn mới với forwarded_from trỏ đến tin nhắn gốc
    const forwardedMessage = new chat_history({
      sender_id: myId,
      receiver_id: receiver_id,
      content: originalMessage.content,
      room_chat_id: room_chat_id,
      file_url: originalMessage.file_url,
      file_type: originalMessage.file_type,
      file_name: originalMessage.file_name,
      forwarded_from: originalMessage._id,
    });

    await forwardedMessage.save();

    const forwardedPopulated = await chat_history.findById(forwardedMessage._id)
      .populate("sender_id", "fullName avatar")
      .populate("forwarded_from", "content file_url file_type file_name sender_id")
      .populate("forwarded_from.sender_id", "fullName avatar");

    req.io.emit("SERVER_RETURN_MESSAGE", forwardedPopulated);

    res.json({ code: "success", Message: "Đã chuyển tiếp tin nhắn!", data: forwardedPopulated });
  } catch (error) {
    res.json({ code: "error", Message: "Lỗi chuyển tiếp tin nhắn", error });
  }
};

// 6. Hàm Ghim/Bỏ ghim tin nhắn
export const pinMessage = async (req: any, res: Response) => {
  try {
    const myId = req.account._id || req.account.id;
    const { message_id } = req.body;

    const message = await chat_history.findById(message_id);
    if (!message) {
      return res.json({ code: "error", Message: "Tin nhắn không tồn tại!" });
    }

    // Bỏ ghim tin nhắn đã ghim trước đó trong cùng room
    await chat_history.updateMany(
      { room_chat_id: message.room_chat_id, pinned: true },
      { pinned: false, pinnedAt: null as any, pinned_by: null as any }
    );

    // Ghim tin nhắn mới
    message.pinned = true;
    message.pinnedAt = new Date();
    message.pinned_by = myId;
    await message.save();

    const messagePopulated = await chat_history.findById(message._id)
      .populate("sender_id", "fullName avatar")
      .populate("pinned_by", "fullName");

    // Gửi thông báo qua socket
    req.io.emit("SERVER_MESSAGE_PINNED", { 
      message_id: message._id, 
      room_chat_id: message.room_chat_id,
      pinned: true
    });

    res.json({ code: "success", Message: "Đã ghim tin nhắn!", data: messagePopulated });
  } catch (error) {
    res.json({ code: "error", Message: "Lỗi ghim tin nhắn", error });
  }
};

// 7. Hàm Bỏ ghim tin nhắn
export const unpinMessage = async (req: any, res: Response) => {
  try {
    const myId = req.account._id || req.account.id;
    const { message_id } = req.body;

    const message = await chat_history.findById(message_id);
    if (!message) {
      return res.json({ code: "error", Message: "Tin nhắn không tồn tại!" });
    }

    // Bỏ ghim
    message.pinned = false;
    message.pinnedAt = null as any;
    message.pinned_by = null as any;
    await message.save();

    // Gửi thông báo qua socket
    req.io.emit("SERVER_MESSAGE_UNPINNED", { 
      message_id: message._id, 
      room_chat_id: message.room_chat_id,
      pinned: false
    });

    res.json({ code: "success", Message: "Đã bỏ ghim tin nhắn!" });
  } catch (error) {
    res.json({ code: "error", Message: "Lỗi bỏ ghim tin nhắn", error });
  }
};

// Tìm kiếm tin nhắn trong room hoặc toàn hệ thống
export const searchMessages = async (req: any, res: Response) => {
  try {
    const { room_chat_id, keyword } = req.body;
    if (!keyword || keyword.toString().trim() === "") {
      return res.json({ code: "error", Message: "Thiếu từ khóa tìm kiếm" });
    }

    const regex = new RegExp(keyword.toString(), "i");

    const query: any = { $or: [ { content: regex }, { file_name: regex } ] };
    if (room_chat_id) query.room_chat_id = room_chat_id;

    const results = await chat_history.find(query)
      .sort({ createdAt: -1 })
      .populate("sender_id", "fullName avatar")
      .populate("pinned_by", "fullName");

    res.json({ code: "success", Message: "Kết quả tìm kiếm", data: results });
  } catch (error) {
    res.json({ code: "error", Message: "Lỗi khi tìm kiếm", error });
  }
};