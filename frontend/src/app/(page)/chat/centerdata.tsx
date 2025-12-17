"use client"
import React, { useEffect, useState, useRef } from 'react';
import { MessageCircle, Search, Plus, Moon, Settings, UserPlus, Info, Paperclip, Smile, Send, Sun, Check, LogOut as LogOutIcon, Trash2, X, Bell, Forward, MoreVertical, Pin } from 'lucide-react';
import { Information } from './information';
import { io } from "socket.io-client";
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { toast, Toaster } from 'sonner';
import { Sonner } from '../../../../helper/sonner';

// --- INTERFACES ---
interface Message { id: string; text: string; sender: 'me' | 'other'; senderName?: string; timestamp: string; senderAvatar?: string; file_url?: string; file_type?: string; file_name?: string; deleted?: boolean; deleted_for_me?: boolean; deleted_for_everyone?: boolean; forwarded_from?: any; pinned?: boolean; pinned_by?: any; }
interface GroupChat { _id: string; title: string; users: any[]; letters?: string[]; colors?: string[]; messages?: Message[]; type: 'group'; avatar?: string; }
interface FriendChat { id: string; name: string; status: string; letter: string; color: string; isOnline: boolean; messages: Message[]; type: 'friend'; avatar?: string; phone?: string; email?: string; }

const socket = io(`${process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:5000"}`, { withCredentials: true, autoConnect: false });

// --- MODAL: TẠO NHÓM ---
const CreateGroupModal = ({ onClose, onSuccess, friends }: { onClose: () => void, onSuccess: () => void, friends: FriendChat[] }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const toggleUser = (userId: string) => { setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]); };
  
  const handleCreateGroup = async () => {
    if (!groupName.trim()) return toast.error("Vui lòng nhập tên nhóm!");
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/groups/create-group`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ title: groupName, userIds: selectedUsers }),
      });
      const data = await res.json();
      if (data.code === "success") { toast.success("Tạo nhóm thành công!"); onSuccess(); onClose(); } else { toast.error(data.Message); }
    } catch (error) { toast.error("Lỗi kết nối"); } finally { setIsLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in zoom-in-95">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Tạo Nhóm Chat Mới</h3>
        <div className="space-y-4 mb-4">
          <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Nhập tên nhóm..." className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white" />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar border border-gray-100 dark:border-gray-700 rounded-xl p-2 bg-gray-50 dark:bg-gray-700/30">
          {friends.map(friend => (
            <div key={friend.id} onClick={() => toggleUser(friend.id)} className={`flex items-center p-2 rounded-lg cursor-pointer transition-all ${selectedUsers.includes(friend.id) ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-200' : 'hover:bg-white dark:hover:bg-gray-700'}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${selectedUsers.includes(friend.id) ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
              <div className="w-8 h-8 rounded-full overflow-hidden mr-3 bg-gray-200">{friend.avatar ? <img src={friend.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-300 flex items-center justify-center font-bold text-gray-500">{friend.letter}</div>}</div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 flex-1">{friend.name}</span>
              {selectedUsers.includes(friend.id) && <Check className="w-4 h-4 text-purple-600" />}
            </div>
          ))}
        </div>
        <button onClick={handleCreateGroup} disabled={isLoading} className="w-full mt-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-lg"> {isLoading ? "Đang tạo..." : "Tạo nhóm"} </button>
      </div>
    </div>
  );
};

// --- MODAL: THÊM BẠN BÈ ---
const AddFriendModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
    const [phone, setPhone] = useState("");
    const [searchResult, setSearchResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        if (!phone.trim()) return toast.error("Vui lòng nhập số điện thoại");
        setIsLoading(true);
        setSearchResult(null);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/users/search`, {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ phone }),
            });
            const data = await res.json();
            if (data.code === "success") { setSearchResult(data.data); } 
            else { toast.error(data.Message); }
        } catch (e) { toast.error("Lỗi kết nối"); } finally { setIsLoading(false); }
    };

    const handleAddFriend = async () => {
        if(!searchResult) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/users/request-friend`, {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ friendId: searchResult._id }),
            });
            const data = await res.json();
            if (data.code === "success") { toast.success("Đã gửi lời mời!"); onClose(); } 
            else { toast.error(data.Message); }
        } catch (e) { toast.error("Lỗi kết nối"); }
    };

    return (
        <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in zoom-in-95">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Thêm Bạn Bè</h3>
                <div className="flex gap-2 mb-4">
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Nhập số điện thoại..." className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white" />
                    <button onClick={handleSearch} disabled={isLoading} className="px-4 py-2 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600">{isLoading ? "..." : <Search className="w-5 h-5"/>}</button>
                </div>
                {searchResult && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                {searchResult.avatar ? <img src={searchResult.avatar} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center bg-purple-500 text-white font-bold">{searchResult.fullName.charAt(0)}</div>}
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 dark:text-white text-sm">{searchResult.fullName}</p>
                                <p className="text-xs text-gray-500">{searchResult.phone}</p>
                            </div>
                        </div>
                        <button onClick={handleAddFriend} className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 font-medium">Kết bạn</button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MODAL: DANH SÁCH LỜI MỜI ---
const FriendRequestModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
    const [requests, setRequests] = useState<any[]>([]);

    const fetchRequests = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/users/friend-requests`, { credentials: "include" });
            const data = await res.json();
            if(data.code === "success") setRequests(data.data);
        } catch(e) {}
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleAccept = async (userId: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/users/accept-friend`, {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ userId }),
            });
            if((await res.json()).code === "success") { 
                toast.success("Đã chấp nhận!"); 
                setRequests(prev => prev.filter(req => req._id !== userId));
                onSuccess(); // Reload danh sách bạn bè
            }
        } catch(e) { toast.error("Lỗi"); }
    };

    const handleDecline = async (userId: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/users/decline-friend`, {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ userId }),
            });
            if((await res.json()).code === "success") { 
                setRequests(prev => prev.filter(req => req._id !== userId));
            }
        } catch(e) { toast.error("Lỗi"); }
    };

    return (
        <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in zoom-in-95">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative flex flex-col max-h-[80vh]">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Lời Mời Kết Bạn</h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                    {requests.length === 0 ? <p className="text-center text-gray-500 py-4">Không có lời mời nào.</p> : requests.map(req => (
                        <div key={req._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                    {req.avatar ? <img src={req.avatar} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold">{req.fullName.charAt(0)}</div>}
                                </div>
                                <span className="font-medium text-gray-800 dark:text-white text-sm">{req.fullName}</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleAccept(req._id)} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"><Check className="w-4 h-4"/></button>
                                <button onClick={() => handleDecline(req._id)} className="p-2 bg-red-100 text-red-500 rounded-lg hover:bg-red-200"><X className="w-4 h-4"/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- MODAL: CHUYỂN TIẾP TIN NHẮN ---
const ForwardModal = ({ onClose, message, friends, groups, onForward }: { 
  onClose: () => void, 
  message: Message | null, 
  friends: FriendChat[], 
  groups: GroupChat[],
  onForward: (receiverId: string, type: 'group' | 'friend') => void 
}) => {
  const [selectedType, setSelectedType] = useState<'friend' | 'group'>('friend');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!message) return null;

  return (
    <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in zoom-in-95">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Chuyển tiếp tin nhắn</h3>
        
        {/* Preview tin nhắn */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <p className="text-xs text-gray-500 mb-1">Tin nhắn sẽ chuyển tiếp:</p>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {message.file_url && message.file_type === 'image' && (
              <img src={message.file_url} alt="Preview" className="max-w-full h-32 object-cover rounded-lg mb-2" />
            )}
            {message.text && <p className="truncate">{message.text}</p>}
            {message.file_url && message.file_type === 'file' && (
              <p className="text-xs text-gray-500">📎 {message.file_name || "Tệp đính kèm"}</p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
          <button 
            onClick={() => { setSelectedType('friend'); setSelectedId(null); }}
            className={`px-4 py-2 font-medium text-sm ${selectedType === 'friend' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
          >
            Bạn bè
          </button>
          <button 
            onClick={() => { setSelectedType('group'); setSelectedId(null); }}
            className={`px-4 py-2 font-medium text-sm ${selectedType === 'group' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
          >
            Nhóm
          </button>
        </div>

        {/* Danh sách */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 mb-4">
          {selectedType === 'friend' ? (
            friends.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Không có bạn bè nào</p>
            ) : (
              friends.map(friend => (
                <div 
                  key={friend.id}
                  onClick={() => setSelectedId(friend.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    selectedId === friend.id ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-200' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className={`w-10 h-10 ${friend.color} rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden`}>
                    {friend.avatar ? <img src={friend.avatar} className="w-full h-full object-cover" /> : friend.letter}
                  </div>
                  <span className="flex-1 font-medium text-gray-700 dark:text-gray-200">{friend.name}</span>
                  {selectedId === friend.id && <Check className="w-5 h-5 text-purple-600" />}
                </div>
              ))
            )
          ) : (
            groups.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Không có nhóm nào</p>
            ) : (
              groups.map(group => (
                <div 
                  key={group._id}
                  onClick={() => setSelectedId(group._id)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    selectedId === group._id ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-200' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {group.letters?.[0] || 'G'}
                  </div>
                  <span className="flex-1 font-medium text-gray-700 dark:text-gray-200">{group.title}</span>
                  {selectedId === group._id && <Check className="w-5 h-5 text-purple-600" />}
                </div>
              ))
            )
          )}
        </div>

        <button 
          onClick={() => selectedId && onForward(selectedId, selectedType)}
          disabled={!selectedId}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Chuyển tiếp
        </button>
      </div>
    </div>
  );
};

// --- SIDEBAR THÔNG TIN ---
const ChatInfoSidebar = ({ chatData, onClose, onActionSuccess, currentUser }: { chatData: any, onClose: () => void, onActionSuccess?: () => void, currentUser: any }) => {
  const handleDeleteFriend = async () => {
    if (!confirm("Xóa bạn bè?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/users/remove-friend`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ friendId: chatData.id }), });
      if ((await res.json()).code === "success") { toast.success("Đã xóa"); if (onActionSuccess) onActionSuccess(); onClose(); }
    } catch (e) { toast.error("Lỗi"); }
  }
  const handleLeaveGroup = async () => {
    if (!confirm("Rời nhóm?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/groups/leave`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ groupId: chatData._id }) });
      if ((await res.json()).code === "success") { toast.success("Đã rời nhóm"); if (onActionSuccess) onActionSuccess(); onClose(); }
    } catch (e) { toast.error("Lỗi"); }
  }
  const handleDeleteGroup = async () => {
    if (!confirm("Giải tán nhóm?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/groups/delete`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ groupId: chatData._id }) });
      if ((await res.json()).code === "success") { toast.success("Đã giải tán"); if (onActionSuccess) onActionSuccess(); onClose(); }
    } catch (e) { toast.error("Lỗi"); }
  }

  const isGroup = chatData.type === 'group';
  const myRoleInGroup = isGroup ? chatData.users?.find((u: any) => {
    const uid = u.user_id?._id || u.user_id;
    const uidStr = uid && uid.toString ? uid.toString() : uid;
    const myIdStr = currentUser?._id && currentUser._id.toString ? currentUser._id.toString() : currentUser?._id;
    return uidStr === myIdStr;
  })?.role : null;
  const isSuperAdmin = myRoleInGroup === 'superAdmin';

  return (
    <div className="w-[350px] bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 h-full flex flex-col animate-in slide-in-from-right duration-300 shadow-xl z-20 absolute right-0 top-0 bottom-0">
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800">
        <span className="font-bold text-gray-700 dark:text-white">Thông tin</span>
        <button onClick={onClose}><X className="w-6 h-6 text-gray-400" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        <div className={`w-24 h-24 rounded-full ${chatData.color || 'bg-blue-500'} flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg relative overflow-hidden`}>
          {chatData.avatar ? (<img src={chatData.avatar} className="w-full h-full object-cover" />) : (chatData.name ? chatData.name.charAt(0).toUpperCase() : (chatData.title ? chatData.title.charAt(0).toUpperCase() : "G"))}
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 text-center">{chatData.name || chatData.title}</h2>
        <div className="w-full space-y-4 mb-8 mt-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">{chatData.type === 'group' ? "Số lượng thành viên" : "Thông tin"}</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{chatData.type === 'group' ? `${chatData.users?.length || 0} người` : chatData.phone || "..."}</p>
          </div>
        </div>
        <div className="w-full border-t border-gray-100 dark:border-gray-800 my-2 pt-4 px-2 space-y-2">
          {chatData.type === 'friend' && (<button onClick={handleDeleteFriend} className="w-full py-3 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 rounded-xl font-medium"> <Trash2 className="w-5 h-5" /> Xóa bạn bè </button>)}
          {chatData.type === 'group' && (
            <>
              <button onClick={handleLeaveGroup} className="w-full py-3 flex items-center justify-center gap-2 text-orange-500 hover:bg-orange-50 rounded-xl font-medium"> <LogOutIcon className="w-5 h-5" /> Rời nhóm </button>
              {isSuperAdmin && (<button onClick={handleDeleteGroup} className="w-full py-3 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 rounded-xl font-medium"> <Trash2 className="w-5 h-5" /> Giải tán nhóm </button>)}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH ---
export const CenterData: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedChatType, setSelectedChatType] = useState<'group' | 'friend' | null>(null);
  const [messageInput, setMessageInput] = useState<string>('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [msgList, setMsgList] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [friendsList, setFriendsList] = useState<FriendChat[]>([]);
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [friendRequestCount, setFriendRequestCount] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{messageId: string | null, x: number, y: number} | null>(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [messageToForward, setMessageToForward] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [msgList]);

  const updateStatus = async (status: "online" | "offline") => { try { await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/users/change-status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ status }), keepalive: true }); } catch (err) { } };

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/groups/list-groups`, { credentials: 'include' });
      const data = await res.json();
      if (data.code === "success") {
        setGroupChats(data.data.map((g: any) => ({
          _id: g._id, title: g.title, users: g.users,
          letters: g.title.split(' ').map((w: string) => w[0]).slice(0, 3), colors: ['bg-blue-500', 'bg-green-500', 'bg-purple-500']
        })));
      }
    } catch (e) { }
  };

  const fetchFriends = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/users/friends`, { credentials: 'include' });
      const data = await res.json();
      if (data.code === "success") {
        setFriendsList(data.data.map((u: any) => ({
          id: u._id, name: u.fullName, status: u.status === "online" ? "Đang hoạt động" : "Không hoạt động", letter: u.fullName.charAt(0).toUpperCase(), color: 'bg-yellow-500', isOnline: u.isOnline, messages: [], type: 'friend', avatar: u.avatar, phone: u.phone, email: u.email
        })));
      }
    } catch (err) { }
  };

  const fetchRequestCount = async () => { try { const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/users/friend-requests`, { credentials: 'include' }); const data = await res.json(); if (data.code === "success") setFriendRequestCount(data.data.length); } catch (e) { } };
  
  const fetchCurrentUser = async () => {
    try {
      const resProfile = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:5000"}/users/profile`, { credentials: 'include' });
      const dataProfile = await resProfile.json();
      if (dataProfile.code === "success") {
        const userData = dataProfile.data;
        if (userData.avatar) userData.avatar = `${userData.avatar.split('?')[0]}?v=${new Date().getTime()}`;
        setCurrentUser(userData);
      } else if (dataProfile.code === "error") {
        // Nếu không đăng nhập, redirect về trang login
        if (dataProfile.Message?.includes("đăng nhập") || dataProfile.Message?.includes("Vui lòng")) {
          window.location.href = "/";
        }
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  useEffect(() => { const initData = async () => { await fetchCurrentUser(); await fetchFriends(); await fetchGroups(); await fetchRequestCount(); updateStatus("online"); }; initData(); const handleBeforeUnload = () => updateStatus("offline"); window.addEventListener("beforeunload", handleBeforeUnload); return () => { window.removeEventListener("beforeunload", handleBeforeUnload); updateStatus("offline"); }; }, []);

  // --- SOCKET LISTENERS (Bao gồm cả Online/Offline và Kết bạn) ---
  useEffect(() => {
    if (!socket.connected) socket.connect();

    // 1. Nhận tin nhắn mới (Đã sửa tên)
    socket.on("SERVER_RETURN_MESSAGE", (data: any) => {
      // Chỉ thêm tin nhắn nếu đang ở đúng room chat
      const currentRoom = selectedChatType === 'group' ? selectedChat : [currentUser?._id, selectedChat].sort().join("-");
      const messageRoom = data.room_chat_id;
      if (messageRoom !== currentRoom) return;

      let senderName = "Người dùng"; let senderAvatar = "";
      if (data.sender_id && typeof data.sender_id === 'object') { senderName = data.sender_id.fullName || "Người dùng"; senderAvatar = data.sender_id.avatar || ""; }
      const newMessage: Message = { 
        id: data._id, 
        text: data.content || "", 
        sender: (data.sender_id._id === currentUser?._id || data.sender_id === currentUser?._id) ? 'me' : 'other', 
        timestamp: new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        senderName: senderName, 
        senderAvatar: senderAvatar,
        file_url: data.file_url,
        file_type: data.file_type,
        file_name: data.file_name,
        deleted: false,
        deleted_for_me: false,
        deleted_for_everyone: false,
        forwarded_from: data.forwarded_from,
        pinned: data.pinned || false,
        pinned_by: data.pinned_by
      };
      setMsgList((prev) => [...prev, newMessage]);
    });

    // 2. Nhận thông báo kết bạn mới
    socket.on("SERVER_SEND_FRIEND_REQUEST", () => {
        setFriendRequestCount(prev => prev + 1);
        toast.info("Bạn có lời mời kết bạn mới!");
    });

    // 3. Được chấp nhận kết bạn -> Reload danh sách
    socket.on("SERVER_FRIEND_ACCEPTED", () => {
        fetchFriends();
        toast.success("Các bạn đã trở thành bạn bè!");
    });

    // 4. 🔥 CẬP NHẬT TRẠNG THÁI ONLINE/OFFLINE (Đã khôi phục)
    socket.on("SERVER_RETURN_USER_STATUS", (data: any) => {
        setFriendsList(prev => prev.map(f => {
            if (f.id === data.userId) {
                return { ...f, isOnline: data.isOnline, status: data.status === "online" ? "Đang hoạt động" : "Không hoạt động" };
            }
            return f;
        }));
    });

    // 5. Nhận thông báo tin nhắn bị xóa phía bạn
    socket.on("SERVER_MESSAGE_DELETED_FOR_ME", (data: any) => {
        const currentRoom = selectedChatType === 'group' ? selectedChat : [currentUser?._id, selectedChat].sort().join("-");
        if (data.room_chat_id === currentRoom && data.user_id === currentUser?._id) {
            setMsgList(prev => prev.filter(msg => msg.id !== data.message_id));
        }
    });

    // 6. Nhận thông báo tin nhắn bị xóa phía mọi người
    socket.on("SERVER_MESSAGE_DELETED_FOR_EVERYONE", (data: any) => {
        const currentRoom = selectedChatType === 'group' ? selectedChat : [currentUser?._id, selectedChat].sort().join("-");
        if (data.room_chat_id === currentRoom) {
            setMsgList(prev => prev.map(msg => 
                msg.id === data.message_id ? { ...msg, deleted_for_everyone: true, text: "Tin nhắn đã được thu hồi" } : msg
            ));
        }
    });

    // 7. Nhận thông báo tin nhắn được ghim
    socket.on("SERVER_MESSAGE_PINNED", (data: any) => {
        const currentRoom = selectedChatType === 'group' ? selectedChat : [currentUser?._id, selectedChat].sort().join("-");
        if (data.room_chat_id === currentRoom) {
            // Reload messages để sắp xếp lại
            const fetchHistory = async () => {
              if (selectedChat) {
                const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/chat/list`, {
                  method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                  body: JSON.stringify({ sender_id: currentUser?._id, receiver_id: selectedChat, type: selectedChatType }),
                });
                const data = await res.json();
                if (data.code === "success") {
                  const historyList = data.data.map((msg: any) => {
                    let sName = "Người dùng"; let sAvatar = "";
                    if (msg.sender_id && typeof msg.sender_id === 'object') { sName = msg.sender_id.fullName || "Người dùng"; sAvatar = msg.sender_id.avatar || ""; }
                    return { 
                      id: msg._id, 
                      text: msg.content || "", 
                      sender: (msg.sender_id._id === currentUser?._id || msg.sender_id === currentUser?._id) ? 'me' : 'other', 
                      timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
                      senderName: sName, 
                      senderAvatar: sAvatar,
                      file_url: msg.file_url,
                      file_type: msg.file_type,
                      file_name: msg.file_name,
                      deleted: msg.deleted || false,
                      deleted_for_me: false,
                      deleted_for_everyone: msg.deleted_for_everyone || false,
                      forwarded_from: msg.forwarded_from,
                      pinned: msg.pinned || false,
                      pinned_by: msg.pinned_by
                    };
                  });
                  setMsgList(historyList);
                }
              }
            };
            fetchHistory();
        }
    });

    // 8. Nhận thông báo tin nhắn bị bỏ ghim
    socket.on("SERVER_MESSAGE_UNPINNED", (data: any) => {
        const currentRoom = selectedChatType === 'group' ? selectedChat : [currentUser?._id, selectedChat].sort().join("-");
        if (data.room_chat_id === currentRoom) {
            setMsgList(prev => prev.map(msg => 
                msg.id === data.message_id ? { ...msg, pinned: false } : msg
            ));
        }
    });

    return () => { 
        socket.off("SERVER_RETURN_MESSAGE"); 
        socket.off("SERVER_SEND_FRIEND_REQUEST");
        socket.off("SERVER_FRIEND_ACCEPTED");
        socket.off("SERVER_RETURN_USER_STATUS");
        socket.off("SERVER_MESSAGE_DELETED_FOR_ME");
        socket.off("SERVER_MESSAGE_DELETED_FOR_EVERYONE");
        socket.off("SERVER_MESSAGE_PINNED");
        socket.off("SERVER_MESSAGE_UNPINNED");
    };
  }, [currentUser, selectedChat]);

  const selectedChatData: any = selectedChatType === 'group' ? groupChats.find(chat => chat._id === selectedChat) : friendsList.find(friend => friend.id === selectedChat);

  const handleSelectChat = (id: string, type: 'group' | 'friend') => { setSelectedChat(id); setSelectedChatType(type); setShowChatInfo(false); };
  const handleResetHome = () => { setSelectedChat(null); setSelectedChatType(null); setShowChatInfo(false); };
  const toggleDarkMode = () => { const newMode = !darkMode; setDarkMode(newMode); if (newMode) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); };
  
  // Gửi tin nhắn (Kèm type group/friend và file nếu có)
  const handleSendMessage = async () => { 
    if ((messageInput.trim() || selectedFile) && selectedChat) { 
        try {
            const formData = new FormData();
            formData.append("sender_id", currentUser?._id);
            formData.append("receiver_id", selectedChat);
            formData.append("content", messageInput || "");
            formData.append("type", selectedChatType || "friend");
            if (selectedFile) {
              formData.append("file", selectedFile);
            }

            await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/chat/send`, { 
                method: "POST", 
                credentials: "include", 
                body: formData,
            }); 
            setMessageInput('');
            setSelectedFile(null);
            setFilePreview(null);
        } catch (err) { 
            toast.error("Lỗi gửi tin nhắn");
        } 
    } 
  };

  // Thu hồi phía bạn (chỉ mình bạn không thấy)
  const handleDeleteForMe = async (messageId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/chat/delete-for-me`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message_id: messageId }),
      });
      const data = await res.json();
      if (data.code === "success") {
        setMsgList(prev => prev.filter(msg => msg.id !== messageId));
        toast.success("Đã xóa tin nhắn");
        setContextMenu(null);
      } else {
        toast.error(data.Message);
      }
    } catch (err) {
      toast.error("Lỗi xóa tin nhắn");
    }
  };

  // Thu hồi phía mọi người (chỉ người gửi mới có thể)
  const handleDeleteForEveryone = async (messageId: string) => {
    if (!confirm("Bạn có chắc muốn thu hồi tin nhắn này cho mọi người?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/chat/delete-for-everyone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message_id: messageId }),
      });
      const data = await res.json();
      if (data.code === "success") {
        setMsgList(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, deleted_for_everyone: true, text: "Tin nhắn đã được thu hồi" } : msg
        ));
        toast.success("Đã thu hồi tin nhắn cho mọi người");
        setContextMenu(null);
      } else {
        toast.error(data.Message);
      }
    } catch (err) {
      toast.error("Lỗi thu hồi tin nhắn");
    }
  };

  // Chuyển tiếp tin nhắn
  const handleForwardMessage = (message: Message) => {
    setMessageToForward(message);
    setShowForwardModal(true);
    setContextMenu(null);
  };

  // Xử lý chuyển tiếp đến người nhận đã chọn
  const handleConfirmForward = async (receiverId: string, type: 'group' | 'friend') => {
    if (!messageToForward) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/chat/forward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          message_id: messageToForward.id, 
          receiver_id: receiverId,
          type: type
        }),
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success("Đã chuyển tiếp tin nhắn");
        setShowForwardModal(false);
        setMessageToForward(null);
      } else {
        toast.error(data.Message);
      }
    } catch (err) {
      toast.error("Lỗi chuyển tiếp tin nhắn");
    }
  };

  // Ghim tin nhắn
  const handlePinMessage = async (messageId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/chat/pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message_id: messageId }),
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success("Đã ghim tin nhắn");
        setContextMenu(null);
        // Reload messages để hiển thị tin nhắn được ghim ở đầu
        const fetchHistory = async () => {
          if (selectedChat) {
            const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/chat/list`, {
              method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
              body: JSON.stringify({ sender_id: currentUser?._id, receiver_id: selectedChat, type: selectedChatType }),
            });
            const data = await res.json();
            if (data.code === "success") {
              const historyList = data.data.map((msg: any) => {
                let sName = "Người dùng"; let sAvatar = "";
                if (msg.sender_id && typeof msg.sender_id === 'object') { sName = msg.sender_id.fullName || "Người dùng"; sAvatar = msg.sender_id.avatar || ""; }
                return { 
                  id: msg._id, 
                  text: msg.content || "", 
                  sender: (msg.sender_id._id === currentUser?._id || msg.sender_id === currentUser?._id) ? 'me' : 'other', 
                  timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
                  senderName: sName, 
                  senderAvatar: sAvatar,
                  file_url: msg.file_url,
                  file_type: msg.file_type,
                  file_name: msg.file_name,
                  deleted: msg.deleted || false,
                  deleted_for_me: false,
                  deleted_for_everyone: msg.deleted_for_everyone || false,
                  forwarded_from: msg.forwarded_from,
                  pinned: msg.pinned || false,
                  pinned_by: msg.pinned_by
                };
              });
              setMsgList(historyList);
            }
          }
        };
        fetchHistory();
      } else {
        toast.error(data.Message);
      }
    } catch (err) {
      toast.error("Lỗi ghim tin nhắn");
    }
  };

  // Bỏ ghim tin nhắn
  const handleUnpinMessage = async (messageId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/chat/unpin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message_id: messageId }),
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success("Đã bỏ ghim tin nhắn");
        setContextMenu(null);
        setMsgList(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, pinned: false } : msg
        ));
      } else {
        toast.error(data.Message);
      }
    } catch (err) {
      toast.error("Lỗi bỏ ghim tin nhắn");
    }
  };

  // Xử lý chọn file
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Tạo preview cho ảnh
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  // Xóa file đã chọn
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Đăng xuất
  const handleLogout = async () => {
    if (!confirm("Bạn có chắc muốn đăng xuất?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/login/logout`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.code === "success") {
        sessionStorage.clear();
        window.location.href = "/";
      } else {
        toast.error(data.Message);
      }
    } catch (err) {
      toast.error("Lỗi đăng xuất");
    }
  };
  
  const onEmojiClick = (emojiData: EmojiClickData) => { setMessageInput((prev) => prev + emojiData.emoji); };

  // Lấy lịch sử (Kèm type group/friend)
  useEffect(() => {
    const fetchHistory = async () => {
      if (selectedChat) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/chat/list`, {
            method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
            body: JSON.stringify({ sender_id: currentUser?._id, receiver_id: selectedChat, type: selectedChatType }),
          });
          const data = await res.json();
          if (data.code === "success") {
            const historyList = data.data.map((msg: any) => {
              let sName = "Người dùng"; let sAvatar = "";
              if (msg.sender_id && typeof msg.sender_id === 'object') { sName = msg.sender_id.fullName || "Người dùng"; sAvatar = msg.sender_id.avatar || ""; }
              return { 
                id: msg._id, 
                text: msg.content || "", 
                sender: (msg.sender_id._id === currentUser?._id || msg.sender_id === currentUser?._id) ? 'me' : 'other', 
                timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
                senderName: sName, 
                senderAvatar: sAvatar,
                file_url: msg.file_url,
                file_type: msg.file_type,
                file_name: msg.file_name,
                deleted: msg.deleted || false,
                deleted_for_me: false,
                deleted_for_everyone: msg.deleted_for_everyone || false,
                forwarded_from: msg.forwarded_from,
                pinned: msg.pinned || false,
                pinned_by: msg.pinned_by
              };
            });
            setMsgList(historyList); scrollToBottom();
          } else { setMsgList([]); }
        } catch (err) { setMsgList([]); }
      }
    };
    fetchHistory();
  }, [selectedChat, currentUser]);

  const handleUpdateUser = async () => { setShowProfileModal(false); await fetchCurrentUser(); };

  return (
    <>
      <Toaster richColors position="top-right" />
      <Sonner />
      <div className="flex h-screen bg-[#fcfcfc] dark:bg-gray-900 transition-colors duration-200 font-sans overflow-hidden">

        {/* Sidebar Left */}
        <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col relative transition-colors shadow-[2px_0_5px_rgba(0,0,0,0.02)] z-10 flex-shrink-0">
          <div className="p-5 pb-2">
            <div className="flex items-center justify-between mb-5">
              <h1 onClick={handleResetHome} className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 cursor-pointer">Messages</h1>
              <button onClick={toggleDarkMode} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"> {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />} </button>
            </div>
            
            {/* --- NÚT GỬI TIN & THÔNG BÁO --- */}
            <div className="flex gap-2 mb-4">
                <button className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md hover:opacity-90"> <Plus className="w-5 h-5" /> Gửi Tin Nhắn </button>
                <button onClick={() => {setShowRequestModal(true); setFriendRequestCount(0)}} className="w-12 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center relative hover:bg-gray-50">
                    <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
                    {friendRequestCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{friendRequestCount}</span>}
                </button>
            </div>

            <div className="relative w-full mb-2"> <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /> <input type="text" placeholder="Tìm kiếm..." className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl bg-gray-50 dark:bg-gray-800 text-sm font-medium" /> </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
            {/* GROUP LIST */}
            <div className="flex items-center justify-between mb-2 mt-2 px-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nhóm Chat</span>
              <button onClick={() => setShowCreateGroup(true)} className="p-1 hover:bg-purple-100 rounded-lg"> <Plus className="w-4 h-4 text-gray-400" /> </button>
            </div>
            <div className="space-y-1 mb-6">
              {groupChats.map((group) => (
                <div key={group._id} className="relative group/item">
                  <button onClick={() => handleSelectChat(group._id, 'group')} className={`w-full p-3 rounded-xl flex items-center gap-3 relative ${selectedChat === group._id ? 'bg-purple-50 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    {selectedChat === group._id && <div className="absolute left-0 top-3 bottom-3 w-1 bg-purple-500 rounded-r-full"></div>}
                    <div className="relative w-12 h-10 flex-shrink-0 mr-2">
                      {group.users && group.users.length === 2 && group.users[0]?.user_id && group.users[1]?.user_id ? (
                        <>
                          <div className="absolute top-0 right-0 w-7 h-7 rounded-full border border-white dark:border-gray-900 overflow-hidden z-10 bg-gray-200">
                            {group.users[0].user_id.avatar ? <img src={group.users[0].user_id.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold">{group.users[0].user_id.fullName?.charAt(0)}</div>}
                          </div>
                          <div className="absolute bottom-0 left-0 w-7 h-7 rounded-full border border-white dark:border-gray-900 overflow-hidden z-0 bg-gray-200">
                            {group.users[1].user_id.avatar ? <img src={group.users[1].user_id.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-purple-500 flex items-center justify-center text-[10px] text-white font-bold">{group.users[1].user_id.fullName?.charAt(0)}</div>}
                          </div>
                        </>
                      ) : (
                        <div className="flex -space-x-2 pl-2"> {group.letters && group.letters.map((l, i) => <div key={i} className={`w-9 h-9 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-xs`}>{l}</div>)} </div>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0 pl-1">
                      <div className="font-semibold text-sm truncate text-gray-900 dark:text-white">{group.title}</div>
                      <div className="text-xs text-gray-400">{group.users?.length || 0} thành viên</div>
                    </div>
                  </button>
                </div>
              ))}
            </div>

            {/* FRIEND LIST */}
            <div className="flex items-center justify-between mb-2 px-2 mt-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bạn Bè</span>
              <button onClick={() => setShowAddFriend(true)} className="p-1 hover:bg-purple-100 rounded-lg"> <UserPlus className="w-4 h-4 text-gray-400" /> </button>
            </div>
            <div className="space-y-1 pb-10">
              {friendsList.map((friend) => (
                <button key={friend.id} onClick={() => handleSelectChat(friend.id, 'friend')} className={`w-full p-3 rounded-xl flex items-center gap-3 relative ${selectedChat === friend.id ? 'bg-purple-50 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  {selectedChat === friend.id && <div className="absolute left-0 top-2 bottom-2 w-[4px] bg-purple-600 rounded-r-md"></div>}
                  <div className="relative pl-1">
                    <div className={`w-10 h-10 ${friend.color} rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden`}> {friend.avatar ? <img src={friend.avatar} className="w-full h-full object-cover" /> : friend.letter} </div>
                    {/* TRẠNG THÁI ONLINE */}
                    {friend.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-semibold text-sm truncate text-gray-900 dark:text-white">{friend.name}</div>
                    <div className="text-xs text-gray-400 truncate">{friend.status || "Đang hoạt động"}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer" onClick={() => setShowUserMenu(!showUserMenu)}>
              <div className="relative"> <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden"> {currentUser?.avatar ? (<img src={currentUser.avatar} className="w-full h-full object-cover" />) : (<span>{currentUser?.fullName?.charAt(0).toUpperCase()}</span>)} </div> </div>
              <div className="flex-1 min-w-0"> <div className="font-bold text-sm text-gray-800 dark:text-gray-100 truncate"> {currentUser?.fullName} </div> </div>
              <Settings className="w-4 h-4 text-gray-400" />
            </div>
            {showUserMenu && (
              <div className="absolute bottom-20 left-4 right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-2 z-50">
                <button onClick={() => { setShowProfileModal(true); setShowUserMenu(false) }} className="w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-left text-sm font-medium">Hồ sơ</button>
                <button onClick={() => { handleLogout(); setShowUserMenu(false); }} className="w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-left text-sm font-medium text-red-500">Đăng xuất</button>
              </div>
            )}
          </div>
        </div>

        {/* CHAT AREA */}
        {selectedChatData ? (
          <div className="flex-1 flex flex-col bg-[#fdfdfd] dark:bg-gray-900 relative">
            <div className="h-20 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 sticky top-0">
              <div className="flex items-center gap-4">
                {selectedChatData?.type === 'group' ? (
                  selectedChatData.users && selectedChatData.users.length === 2 && selectedChatData.users[0]?.user_id && selectedChatData.users[1]?.user_id ? (
                    <div className="relative w-12 h-10">
                      <div className="absolute top-0 right-0 w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 overflow-hidden z-10 bg-gray-200">
                        {selectedChatData.users[0].user_id.avatar ? <img src={selectedChatData.users[0].user_id.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold">{selectedChatData.users[0].user_id.fullName?.charAt(0)}</div>}
                      </div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 overflow-hidden z-0 bg-gray-200">
                        {selectedChatData.users[1].user_id.avatar ? <img src={selectedChatData.users[1].user_id.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-purple-500 flex items-center justify-center text-white font-bold">{selectedChatData.users[1].user_id.fullName?.charAt(0)}</div>}
                      </div>
                    </div>
                  ) : (
                    <div className="flex -space-x-2"> {(selectedChatData as GroupChat).letters && (selectedChatData)?.letters?.map((l: any, i: any) => <div key={i} className={`w-11 h-11 bg-blue-500 rounded-full border-[3px] border-white flex items-center justify-center text-white font-bold text-sm shadow-sm`}>{l}</div>)} </div>
                  )
                ) : (<div className="relative"> <div className={`w-11 h-11 ${(selectedChatData as FriendChat).color} rounded-full flex items-center justify-center shadow-md text-white font-bold text-lg overflow-hidden`}> {(selectedChatData as FriendChat).avatar ? <img src={(selectedChatData as FriendChat).avatar} className="w-full h-full object-cover" /> : (selectedChatData as FriendChat).letter} </div> {(selectedChatData).isOnline && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-[3px] border-white"></div>} </div>)}

                <div> <h2 className="font-bold text-lg text-gray-900 dark:text-white">{selectedChatData.name || (selectedChatData as GroupChat).title}</h2> <div className="flex items-center gap-1.5"> {selectedChatData.type === 'friend' && (<><div className={`w-2 h-2 rounded-full ${(selectedChatData as FriendChat).isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div> <p className="text-xs font-medium text-gray-500">{(selectedChatData as FriendChat).isOnline ? "Đang hoạt động" : "Không hoạt động"}</p></>)} {selectedChatData.type === 'group' && <p className="text-xs font-medium text-gray-500">{(selectedChatData as GroupChat).users?.length || 0} thành viên</p>} </div> </div>
              </div>
              <button onClick={() => setShowChatInfo(!showChatInfo)} className={`p-2.5 rounded-xl transition-colors ${showChatInfo ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100 text-gray-400 hover:text-purple-600'}`}> <Info className="w-6 h-6" /> </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 z-0 custom-scrollbar" onClick={() => setContextMenu(null)}>
              {msgList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-300">
                  <p className="text-sm font-medium">Chưa có tin nhắn nào</p>
                </div>
              ) : (
                msgList.map((message) => {
                  const isMyMessage = message.sender === 'me';
                  const messageObj = msgList.find(m => m.id === message.id);
                  const canDeleteForEveryone = isMyMessage && !message.deleted_for_everyone;
                  
                    return (
                    <div 
                      key={message.id} 
                      className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300 group relative`}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({ messageId: message.id, x: e.clientX, y: e.clientY });
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseEnter={() => setHoveredMessageId(message.id)}
                      onMouseLeave={() => setHoveredMessageId(prev => (prev === message.id ? null : prev))}
                    >
                      <div className={`max-w-[70%] relative ${isMyMessage ? 'items-end' : 'items-start'} flex flex-col gap-1 ${message.pinned ? 'border-l-4 border-yellow-400 pl-2' : ''}`}>
                        {message.pinned && (
                          <div className="text-xs text-yellow-600 dark:text-yellow-400 mb-1 flex items-center gap-1 font-medium">
                            <Pin className="w-3 h-3 fill-current" />
                            <span>Đã ghim</span>
                          </div>
                        )}
                        
                        {message.sender === 'other' && <span className="text-xs text-gray-500 ml-1 font-medium">{message.senderName}</span>}
                        {message.forwarded_from && (
                          <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <Forward className="w-3 h-3" />
                            <span>Đã chuyển tiếp</span>
                          </div>
                        )}
                        <div className={`px-5 py-3 shadow-sm ${message.deleted_for_everyone ? 'opacity-50 italic' : ''} ${message.pinned ? 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700' : ''} ${isMyMessage ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl rounded-tr-sm' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-2xl rounded-tl-sm'}`}>
                          {message.deleted_for_everyone ? (
                            <p className="text-[15px] leading-relaxed text-gray-400 dark:text-gray-500 italic">Tin nhắn đã được thu hồi</p>
                          ) : (
                            <>
                              {message.file_url && message.file_type === 'image' && (
                                <div className="mb-2 rounded-lg overflow-hidden max-w-md">
                                  <img src={message.file_url} alt="Ảnh" className="max-w-full h-auto rounded-lg" />
                                </div>
                              )}
                              {message.file_url && message.file_type === 'file' && (
                                <div className="mb-2 p-2 bg-white/20 dark:bg-gray-700/50 rounded-lg flex items-center gap-2">
                                  <Paperclip className="w-4 h-4" />
                                  <a href={message.file_url} target="_blank" rel="noopener noreferrer" className="text-sm underline truncate max-w-xs">
                                    {message.file_name || "Tệp đính kèm"}
                                  </a>
                                </div>
                              )}
                              {message.text && <p className="text-[15px] leading-relaxed">{message.text}</p>}
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-300 dark:text-gray-600 px-1 font-medium">{message.timestamp}</span>
                        </div>
                      </div>
                      
                      {/* Context Menu */}
                      {contextMenu?.messageId === message.id && (
                        <div 
                          ref={contextMenuRef}
                          className="absolute bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-50 min-w-[180px]"
                          style={{ 
                            left: isMyMessage ? 'auto' : contextMenu.x, 
                            right: isMyMessage ? window.innerWidth - contextMenu.x : 'auto',
                            top: contextMenu.y,
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button 
                            onClick={() => handleForwardMessage(message)}
                            className="w-full px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                          >
                            <Forward className="w-4 h-4" />
                            Chuyển tiếp
                          </button>
                          {message.pinned ? (
                            <button 
                              onClick={() => handleUnpinMessage(message.id)}
                              className="w-full px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                            >
                              <Pin className="w-4 h-4" />
                              Bỏ ghim
                            </button>
                          ) : (
                            <button 
                              onClick={() => handlePinMessage(message.id)}
                              className="w-full px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                            >
                              <Pin className="w-4 h-4" />
                              Ghim tin nhắn
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteForMe(message.id)}
                            className="w-full px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                          >
                            <Trash2 className="w-4 h-4" />
                            Xóa phía bạn
                          </button>
                          {/* Deleted duplicate delete/recall buttons (handled by hover toolbar) */}
                        </div>
                      )}

                      {/* Hover Actions: show small toolbar on hover (also for mobile this will be no-op) */}
                      {hoveredMessageId === message.id && !contextMenu && (
                        <div className={`absolute z-40 flex items-center gap-2 ${isMyMessage ? 'right-0 -translate-x-1/2' : 'left-0 translate-x-1/2'}`} style={{ top: 6 }}>
                          <button onClick={() => handleForwardMessage(message)} className="p-2 bg-white dark:bg-gray-800 rounded-md shadow hover:bg-gray-100" title="Chuyển tiếp">
                            <Forward className="w-4 h-4" />
                          </button>
                          {message.pinned ? (
                            <button onClick={() => handleUnpinMessage(message.id)} className="p-2 bg-white dark:bg-gray-800 rounded-md shadow hover:bg-gray-100" title="Bỏ ghim">
                              <Pin className="w-4 h-4" />
                            </button>
                          ) : (
                            <button onClick={() => handlePinMessage(message.id)} className="p-2 bg-white dark:bg-gray-800 rounded-md shadow hover:bg-gray-100" title="Ghim">
                              <Pin className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => handleDeleteForMe(message.id)} className="p-2 bg-white dark:bg-gray-800 rounded-md shadow hover:bg-gray-100" title="Xóa phía bạn">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {canDeleteForEveryone && (
                            <button onClick={() => handleDeleteForEveryone(message.id)} className="p-2 bg-white dark:bg-gray-800 rounded-md shadow hover:bg-gray-100 text-red-500" title="Thu hồi">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 z-10 relative">
              {showEmojiPicker && (<div className="absolute bottom-24 right-8 z-50 shadow-2xl rounded-xl"> <EmojiPicker onEmojiClick={onEmojiClick} theme={darkMode ? Theme.DARK : Theme.LIGHT} searchDisabled={false} width={350} height={400} /> </div>)}
              {filePreview && (
                <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center gap-2 relative">
                  <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                  <span className="flex-1 text-sm text-gray-600 dark:text-gray-300 truncate">{selectedFile?.name}</span>
                  <button onClick={handleRemoveFile} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              )}
              {selectedFile && !filePreview && (
                <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center gap-2 relative">
                  <Paperclip className="w-5 h-5 text-gray-500" />
                  <span className="flex-1 text-sm text-gray-600 dark:text-gray-300 truncate">{selectedFile.name}</span>
                  <button onClick={handleRemoveFile} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              )}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-2 flex items-center gap-2 border border-gray-100 dark:border-gray-700 shadow-sm">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden" 
                  id="file-input"
                  accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                />
                <label htmlFor="file-input" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-gray-400 cursor-pointer">
                  <Paperclip className="w-5 h-5" />
                </label>
                <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} onFocus={() => setShowEmojiPicker(false)} placeholder="Nhắn tin..." className="flex-1 bg-transparent border-none focus:outline-none text-gray-800 dark:text-white px-2 py-2" />
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"> <Smile className="w-5 h-5" /> </button>
                <button onClick={handleSendMessage} className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 rounded-xl shadow-md"> <Send className="w-5 h-5 text-white" /> </button>
              </div>
            </div>
            {showChatInfo && <ChatInfoSidebar chatData={selectedChatData} onClose={() => setShowChatInfo(false)} onActionSuccess={() => { fetchFriends(); fetchGroups(); setSelectedChat(null); }} currentUser={currentUser} />}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#fdfdfd] dark:bg-gray-900"> <div className="text-center"> <div className="w-32 h-32 mx-auto mb-6 bg-purple-50 rounded-full flex items-center justify-center"> <MessageCircle className="w-16 h-16 text-purple-400" /> </div> <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3"> Xin chào! </h2> </div> </div>
        )}
      </div>
      {showProfileModal && <Information onClose={() => setShowProfileModal(false)} currentUser={currentUser} onUpdateSuccess={handleUpdateUser} />}
      {showCreateGroup && <CreateGroupModal onClose={() => setShowCreateGroup(false)} onSuccess={fetchGroups} friends={friendsList} />}
      {showAddFriend && <AddFriendModal onClose={() => setShowAddFriend(false)} onSuccess={fetchFriends} />}
      {showRequestModal && <FriendRequestModal onClose={() => setShowRequestModal(false)} onSuccess={fetchFriends} />}
      {showForwardModal && messageToForward && (
        <ForwardModal 
          onClose={() => { setShowForwardModal(false); setMessageToForward(null); }} 
          message={messageToForward}
          friends={friendsList}
          groups={groupChats}
          onForward={handleConfirmForward}
        />
      )}
    </>
  );
};