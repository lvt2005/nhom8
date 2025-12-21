"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Search, Plus, Moon, Settings, UserPlus, Info, Paperclip, Smile, Send, Sun, Check, LogOut as LogOutIcon, Trash2, X, Bell, Forward, MoreVertical, Pin, Edit3, Heart, Mic, Flag } from 'lucide-react';
import { Information } from './information';
import { io } from "socket.io-client";
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { toast, Toaster } from 'sonner';
import { Sonner } from '../../../../helper/sonner';
import { ChatInfoSidebar } from './ChatInfoSidebar';
import { SendMessageModal } from './SendMessageModal';
import { GroupAvatar } from './GroupAvatar';
import { SearchMessagesModal } from './SearchMessagesModal';
import { InviteMembersModal } from './InviteMembersModal';
import { ChatAttachmentsModal } from './ChatAttachmentsModal';
import { GroupMembersModal } from './GroupMembersModal';
import { ReportModal } from './ReportModal';
import { VoiceRecorder } from './VoiceRecorder';
import { UserProfileModal } from './UserProfileModal';
import { ImagePreviewModal } from './ImagePreviewModal';
import { FileMessage } from './FileMessage';

// --- INTERFACES ---
type AccountUser = {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
  phone?: string;
  username?: string;
  status?: string;
  isOnline?: boolean;
};

type GroupMember = {
  user_id: AccountUser | string;
  role: string;
};

type FriendSearchResult = {
  _id: string;
  fullName: string;
  avatar?: string;
  phone?: string;
};

type FriendRequestUser = {
  _id: string;
  fullName: string;
  avatar?: string;
};

type ServerRoomMessage = {
  _id: string;
  content?: string;
  sender_id: AccountUser | string;
  room_chat_id: string;
  createdAt: string;
  file_url?: string;
  file_type?: string;
  file_name?: string;
  forwarded_from?: unknown;
  pinned?: boolean;
  pinned_by?: unknown;
  deleted?: boolean;
  deleted_for_everyone?: boolean;
  updatedAt?: string;
  reactions?: { user_id: AccountUser | string; emoji: string }[];
};

interface Message { 
  id: string; 
  text: string; 
  sender: 'me' | 'other'; 
  senderName?: string; 
  timestamp: string; 
  senderAvatar?: string; 
  senderId?: string; 
  file_url?: string; 
  file_type?: string; 
  file_name?: string; 
  deleted?: boolean; 
  deleted_for_me?: boolean; 
  deleted_for_everyone?: boolean; 
  forwarded_from?: unknown; 
  pinned?: boolean; 
  pinned_by?: unknown; 
  createdAt?: string; 
  reactions?: { user_id: AccountUser | string; emoji: string }[];
}
interface GroupChat { _id: string; title: string; users: GroupMember[]; letters?: string[]; colors?: string[]; messages?: Message[]; type: 'group'; avatar?: string; background?: string; quickEmoji?: string; }
interface FriendChat { id: string; name: string; status: string; letter: string; color: string; isOnline: boolean; messages: Message[]; type: 'friend'; avatar?: string; phone?: string; email?: string; username?: string; }

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
const AddFriendModal = ({ onClose, onSuccess, onViewProfile }: { onClose: () => void, onSuccess: () => void, onViewProfile?: (userId: string) => void }) => {
    const [phone, setPhone] = useState("");
  const [searchResult, setSearchResult] = useState<FriendSearchResult | null>(null);
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
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewProfile?.(searchResult._id)}>
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
const FriendRequestModal = ({ onClose, onSuccess, notifications = [] }: { onClose: () => void, onSuccess: () => void, notifications?: string[] }) => {
  const [requests, setRequests] = useState<FriendRequestUser[]>([]);
  const [activeTab, setActiveTab] = useState<'requests' | 'notifications'>('requests');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/users/friend-requests`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
      if (data.code === "success") setRequests((data.data || []) as FriendRequestUser[]);
      })
      .catch(() => {});
  }, []);

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
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Lời Mời & Thông Báo</h3>
                
                <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
                    <button onClick={() => setActiveTab('requests')} className={`px-4 py-2 font-medium text-sm ${activeTab === 'requests' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}>Lời mời ({requests.length})</button>
                    <button onClick={() => setActiveTab('notifications')} className={`px-4 py-2 font-medium text-sm ${activeTab === 'notifications' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}>Thông báo ({notifications.length})</button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                    {activeTab === 'requests' ? (
                        requests.length === 0 ? <p className="text-center text-gray-500 py-4">Không có lời mời nào.</p> : requests.map(req => (
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
                        ))
                    ) : (
                        notifications.length === 0 ? <p className="text-center text-gray-500 py-4">Không có thông báo mới.</p> : notifications.map((note, idx) => (
                            <div key={idx} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm text-gray-700 dark:text-gray-200 border border-blue-100 dark:border-blue-800">
                                {note}
                            </div>
                        ))
                    )}
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
  const [showSendMessageModal, setShowSendMessageModal] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [msgList, setMsgList] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<AccountUser | null>(null);
  const [friendsList, setFriendsList] = useState<FriendChat[]>([]);
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [friendRequestCount, setFriendRequestCount] = useState(0);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{messageId: string | null, x: number, y: number} | null>(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [messageToForward, setMessageToForward] = useState<Message | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [mutedChats, setMutedChats] = useState<Record<string, boolean>>({});
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [highlightedMessageIds, setHighlightedMessageIds] = useState<Record<string, boolean>>({});
  const [showSearchMessagesModal, setShowSearchMessagesModal] = useState(false);
  // --- BLOCK STATES ---
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [blockStatus, setBlockStatus] = useState<{iBlockedThem: boolean, theyBlockedMe: boolean}>({iBlockedThem: false, theyBlockedMe: false});
  const [revealedMessages, setRevealedMessages] = useState<Record<string, boolean>>({});
  const [showInviteMembersModal, setShowInviteMembersModal] = useState(false);
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
  const [attachmentsTab, setAttachmentsTab] = useState<'media' | 'files' | 'links'>('media');
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<{messageId: string, isMyMessage: boolean} | null>(null);
  const [editingMessage, setEditingMessage] = useState<{id: string, text: string} | null>(null);
  const [quickEmoji, setQuickEmoji] = useState('👍');
  const [chatBackground, setChatBackground] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [profileModal, setProfileModal] = useState<{userId: string, isFriend: boolean} | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const didApplyUrlSelection = useRef(false);
  const lastVoiceSendTime = useRef<number>(0);

  const totalUnread = useMemo(() => Object.values(unreadCounts).reduce((a, b) => a + (b || 0), 0), [unreadCounts]);

  useEffect(() => {
    const saved = localStorage.getItem('mutedChats');
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Record<string, boolean>;
      setMutedChats(parsed || {});
    } catch {
    }
  }, []);

  useEffect(() => {
    document.title = totalUnread > 0 ? `(${totalUnread}) Messages` : 'Messages';
  }, [totalUnread]);

  const getChatKey = (type: 'group' | 'friend', id: string) => `${type}:${id}`;
  const bumpUnread = (key: string) => setUnreadCounts(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  const clearUnread = (key: string) => setUnreadCounts(prev => ({ ...prev, [key]: 0 }));

  const toggleMuted = (key: string) => {
    setMutedChats(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('mutedChats', JSON.stringify(next));
      return next;
    });
  };

  const flashMessage = (messageId: string) => {
    setHighlightedMessageIds(prev => ({ ...prev, [messageId]: true }));
    window.setTimeout(() => {
      setHighlightedMessageIds(prev => {
        if (!prev[messageId]) return prev;
        const next = { ...prev };
        delete next[messageId];
        return next;
      });
    }, 2000);
  };

  const scrollToMessage = (messageId: string) => {
    const el = messageRefs.current[messageId];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const pinnedMessages = useMemo(() => msgList.filter(m => m.pinned), [msgList]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const updateStatus = async (status: "online" | "offline") => { try { await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/users/change-status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ status }), keepalive: true }); } catch (err) { } };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/chat/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messageId, emoji }),
      });
      const data = await res.json();
      if (data.code !== "success") toast.error("Lỗi thả cảm xúc");
    } catch (e) { toast.error("Lỗi kết nối"); }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/groups/list-groups`, { credentials: 'include' });
      const data = await res.json();
      if (data.code === "success") {
        const groups = (data.data || []) as unknown[];
        setGroupChats(groups.map((raw) => {
          const g = raw as { _id: string; title: string; users: GroupMember[]; avatar?: string; background?: string; quickEmoji?: string };
          return {
          _id: g._id, title: g.title, users: g.users, avatar: g.avatar, background: g.background, quickEmoji: g.quickEmoji,
          type: 'group',
          letters: g.title.split(' ').map((w: string) => w[0]).slice(0, 3), colors: ['bg-blue-500', 'bg-green-500', 'bg-purple-500']
          };
        }));
      }
    } catch (e) { }
  };

  const fetchFriends = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/users/friends`, { credentials: 'include' });
      const data = await res.json();
      if (data.code === "success") {
        const friends = (data.data || []) as unknown[];
        setFriendsList(friends.map((raw) => {
          const u = raw as AccountUser;
          return {
            id: u._id,
            name: u.fullName || "",
            status: u.isOnline ? "Đang hoạt động" : "Không hoạt động",
            letter: (u.fullName || "U").charAt(0).toUpperCase(),
            color: 'bg-yellow-500',
            isOnline: u.isOnline === true,
            messages: [],
            type: 'friend',
            avatar: u.avatar,
            phone: u.phone,
            email: u.email,
            username: u.username
          };
        }));
      }
    } catch (err) { }
  };

  const fetchRequestCount = async () => { try { const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/users/friend-requests`, { credentials: 'include' }); const data = await res.json(); if (data.code === "success") setFriendRequestCount(data.data.length); } catch (e) { } };
  
  // Fetch danh sách người dùng đã chặn
  const fetchBlockedUsers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/users/blocked`, { credentials: 'include' });
      const data = await res.json();
      if (data.code === "success") {
        setBlockedUsers((data.data || []).map((u: any) => u._id));
      }
    } catch (e) { }
  };

  // Kiểm tra trạng thái block với người dùng cụ thể
  const checkBlockStatus = async (userId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/users/check-block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.code === "success") {
        setBlockStatus(data.data);
        return data.data;
      }
    } catch (e) { }
    return { iBlockedThem: false, theyBlockedMe: false };
  };

  const fetchCurrentUser = async () => {
    try {
      const resProfile = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:5000"}/users/profile`, { credentials: 'include' });
      const dataProfile = await resProfile.json();
      if (dataProfile.code === "success") {
        const userData = dataProfile.data;
        userData.fullName = userData.fullName || "";
        userData.email = userData.email || "";
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

  useEffect(() => { const initData = async () => { await fetchCurrentUser(); await fetchFriends(); await fetchGroups(); await fetchRequestCount(); await fetchBlockedUsers(); updateStatus("online"); }; initData(); const handleBeforeUnload = () => updateStatus("offline"); window.addEventListener("beforeunload", handleBeforeUnload); return () => { window.removeEventListener("beforeunload", handleBeforeUnload); updateStatus("offline"); }; }, []);

  // --- SOCKET LISTENERS (Bao gồm cả Online/Offline và Kết bạn) ---
  useEffect(() => {
    if (!socket.connected) socket.connect();
    if (currentUser?._id) socket.emit("CLIENT_JOIN", currentUser._id);

    // 0. Thông báo kết bạn - Nhận khi người khác chấp nhận lời mời của mình
    socket.on("SERVER_FRIEND_REQUEST_ACCEPTED", (data: { byUser: { _id: string, fullName: string, avatar?: string } }) => {
      const userName = data.byUser?.fullName || 'Người dùng';
      setNotifications(prev => [`${userName} đã chấp nhận lời mời kết bạn!`, ...prev]);
      toast.success(`${userName} đã chấp nhận lời mời kết bạn!`);
      fetchFriends(); // Reload friend list
    });

    // 0.5. Nhận reaction
    socket.on("SERVER_RETURN_REACTION", (data: { messageId: string, reactions: { user_id: string, emoji: string }[] }) => {
      setMsgList(prev => prev.map(msg => {
        if (msg.id === data.messageId) {
          return { ...msg, reactions: data.reactions.map(r => ({ ...r, user_id: r.user_id })) };
        }
        return msg;
      }));
    });

    // 1. Nhận tin nhắn mới (Đã sửa tên)
    socket.on("SERVER_RETURN_MESSAGE", (raw: unknown) => {
      const data = raw as ServerRoomMessage;
      // Chỉ thêm tin nhắn nếu đang ở đúng room chat
      const currentRoom = selectedChatType === 'group' ? selectedChat : [currentUser?._id, selectedChat].sort().join("-");
      const messageRoom = data.room_chat_id;
      let senderName = "Người dùng"; let senderAvatar = "";
      const senderObj = data.sender_id && typeof data.sender_id === 'object' ? (data.sender_id as AccountUser) : null;
      if (senderObj) {
        senderName = senderObj.fullName || "Người dùng";
        senderAvatar = senderObj.avatar || "";
      }
      const senderId = typeof data.sender_id === "string" ? data.sender_id : senderObj?._id;

      if (messageRoom !== currentRoom) {
        const isGroupRoom = groupChats.some(g => g._id === messageRoom);
        if (isGroupRoom) {
          const key = getChatKey('group', messageRoom);
          bumpUnread(key);
          if (!mutedChats[key]) toast.info(`Tin nhắn mới: ${(senderName || '').trim()}`);
          return;
        }
        if (senderId && senderId !== currentUser?._id) {
          const key = getChatKey('friend', senderId);
          bumpUnread(key);
          if (!mutedChats[key]) {
            const preview = data.file_type === 'file' ? (data.file_name || 'Tệp đính kèm') : (data.content || '');
            toast.info(`${senderName}: ${preview}`.trim());
          }
        }
        return;
      }
      const newMessage: Message = { 
        id: data._id, 
        text: data.content || "", 
        sender: senderId === currentUser?._id ? 'me' : 'other', 
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
        pinned_by: data.pinned_by,
        reactions: data.reactions || []
      };
      setMsgList((prev) => [...prev, newMessage]);
      if (newMessage.sender === 'other') flashMessage(newMessage.id);
    });

    // 2. Nhận thông báo kết bạn mới
    socket.on("SERVER_SEND_FRIEND_REQUEST", () => {
        setFriendRequestCount(prev => prev + 1);
        toast.info("Bạn có lời mời kết bạn mới!");
    });

    socket.on("SERVER_GROUP_MEMBER_LEFT", () => {
      toast.info("Có thành viên rời nhóm");
      fetchGroups();
    });

    // 3. Được chấp nhận kết bạn -> Reload danh sách
    socket.on("SERVER_FRIEND_ACCEPTED", () => {
        fetchFriends();
        toast.success("Các bạn đã trở thành bạn bè!");
    });

    socket.on("SERVER_RETURN_USER_STATUS", (raw: unknown) => {
      const data = raw as { userId: string; isOnline: boolean; status: string };
        setFriendsList(prev => prev.map(f => {
            if (f.id === data.userId) {
                return { ...f, isOnline: data.isOnline === true, status: data.isOnline ? "Đang hoạt động" : "Không hoạt động" };
            }
            return f;
        }));
    });

    // 5. Nhận thông báo tin nhắn bị xóa phía bạn
    socket.on("SERVER_MESSAGE_DELETED_FOR_ME", (raw: unknown) => {
      const data = raw as { room_chat_id: string; user_id: string; message_id: string };
        const currentRoom = selectedChatType === 'group' ? selectedChat : [currentUser?._id, selectedChat].sort().join("-");
        if (data.room_chat_id === currentRoom && data.user_id === currentUser?._id) {
            setMsgList(prev => prev.filter(msg => msg.id !== data.message_id));
        }
    });

    // 6. Nhận thông báo tin nhắn bị xóa phía mọi người
    socket.on("SERVER_MESSAGE_DELETED_FOR_EVERYONE", (raw: unknown) => {
      const data = raw as { room_chat_id: string; message_id: string };
        const currentRoom = selectedChatType === 'group' ? selectedChat : [currentUser?._id, selectedChat].sort().join("-");
        if (data.room_chat_id === currentRoom) {
            setMsgList(prev => prev.map(msg => 
                msg.id === data.message_id ? { ...msg, deleted_for_everyone: true, text: "Tin nhắn đã được thu hồi" } : msg
            ));
        }
    });

    socket.on("SERVER_MESSAGE_PINNED", (raw: unknown) => {
      const data = raw as { room_chat_id: string; message_id?: string };
        const currentRoom = selectedChatType === 'group' ? selectedChat : [currentUser?._id, selectedChat].sort().join("-");
        if (data.room_chat_id === currentRoom && data.message_id) {
          setMsgList(prev => prev.map(m => (m.id === data.message_id ? { ...m, pinned: true } : m)));
        }
    });

    socket.on("SERVER_MESSAGE_UNPINNED", (raw: unknown) => {
      const data = raw as { room_chat_id: string; message_id: string };
        const currentRoom = selectedChatType === 'group' ? selectedChat : [currentUser?._id, selectedChat].sort().join("-");
        if (data.room_chat_id === currentRoom) {
            setMsgList(prev => prev.map(msg => 
                msg.id === data.message_id ? { ...msg, pinned: false } : msg
            ));
        }
    });

    socket.on("SERVER_GROUP_BACKGROUND_CHANGED", (raw: unknown) => {
      const data = raw as { groupId: string; background: string | null };
      if (selectedChatType === 'group' && selectedChat === data.groupId) {
        setChatBackground(data.background);
      }
      setGroupChats(prev => prev.map(g => g._id === data.groupId ? { ...g, background: data.background || undefined } : g));
    });

    socket.on("SERVER_GROUP_EMOJI_CHANGED", (raw: unknown) => {
      const data = raw as { groupId: string; quickEmoji: string };
      if (selectedChatType === 'group' && selectedChat === data.groupId) {
        setQuickEmoji(data.quickEmoji);
      }
      setGroupChats(prev => prev.map(g => g._id === data.groupId ? { ...g, quickEmoji: data.quickEmoji } : g));
    });

    socket.on("SERVER_GROUP_UPDATED", () => {
      fetchGroups();
    });

    socket.on("SERVER_FRIEND_REMOVED", () => {
      fetchFriends();
    });

    return () => { 
        socket.off("SERVER_RETURN_MESSAGE"); 
        socket.off("SERVER_SEND_FRIEND_REQUEST");
        socket.off("SERVER_FRIEND_REQUEST_ACCEPTED");
        socket.off("SERVER_FRIEND_ACCEPTED");
        socket.off("SERVER_RETURN_USER_STATUS");
        socket.off("SERVER_MESSAGE_DELETED_FOR_ME");
        socket.off("SERVER_MESSAGE_DELETED_FOR_EVERYONE");
        socket.off("SERVER_MESSAGE_PINNED");
        socket.off("SERVER_MESSAGE_UNPINNED");
        socket.off("SERVER_GROUP_MEMBER_LEFT");
        socket.off("SERVER_GROUP_BACKGROUND_CHANGED");
        socket.off("SERVER_GROUP_EMOJI_CHANGED");
        socket.off("SERVER_GROUP_UPDATED");
        socket.off("SERVER_FRIEND_REMOVED");
    };
  }, [currentUser, selectedChat, selectedChatType]);

  const selectedChatData = selectedChatType === 'group' ? groupChats.find(chat => chat._id === selectedChat) : friendsList.find(friend => friend.id === selectedChat);

  const handleSelectChat = async (id: string, type: 'group' | 'friend') => {
    clearUnread(getChatKey(type, id));
    setSelectedChat(id);
    setSelectedChatType(type);
    setShowChatInfo(false);
    setRevealedMessages({}); // Reset revealed messages when changing chat
    
    if (type === 'group') {
      const group = groupChats.find(g => g._id === id);
      setChatBackground(group?.background || null);
      setQuickEmoji(group?.quickEmoji || '👍');
      setBlockStatus({ iBlockedThem: false, theyBlockedMe: false });
    } else {
      const savedBg = localStorage.getItem(`chatBg_${id}`);
      setChatBackground(savedBg || null);
      setQuickEmoji('👍');
      // Kiểm tra trạng thái block khi chọn chat riêng
      await checkBlockStatus(id);
    }
  };
  const handleResetHome = () => { setSelectedChat(null); setSelectedChatType(null); setShowChatInfo(false); setBlockStatus({ iBlockedThem: false, theyBlockedMe: false }); };
  
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => { 
    const newMode = !darkMode; 
    setDarkMode(newMode); 
    localStorage.setItem('darkMode', String(newMode));
    if (newMode) document.documentElement.classList.add('dark'); 
    else document.documentElement.classList.remove('dark'); 
  };
  
  // Gửi tin nhắn (Kèm type group/friend và file nếu có)
  const handleSendMessage = async () => { 
    if (isSendingMessage) return;
    if ((messageInput.trim() || selectedFile) && selectedChat) { 
        if (!currentUser?._id) return;
        setIsSendingMessage(true);
        try {
            const formData = new FormData();
            formData.append("sender_id", currentUser._id);
            formData.append("receiver_id", selectedChat);
            formData.append("content", messageInput || "");
            formData.append("type", selectedChatType || "friend");
            if (selectedFile) {
              formData.append("file", selectedFile);
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/chat/send`, { 
                method: "POST", 
                credentials: "include", 
                body: formData,
            });
            const data = await response.json();
            
            if (data.code === "blocked") {
              toast.error("Bạn không thể liên lạc với người này!");
              return;
            }
            
            setMessageInput('');
            setSelectedFile(null);
            setFilePreview(null);
        } catch (err) { 
            toast.error("Lỗi gửi tin nhắn");
          } finally {
            setIsSendingMessage(false);
          }
    } 
  };

  const handleSendQuickEmoji = async () => {
    if (isSendingMessage || !selectedChat || !currentUser?._id) return;
    setIsSendingMessage(true);
    try {
      const formData = new FormData();
      formData.append("sender_id", currentUser._id);
      formData.append("receiver_id", selectedChat);
      formData.append("content", quickEmoji);
      formData.append("type", selectedChatType || "friend");
      const response = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/chat/send`, { method: "POST", credentials: "include", body: formData });
      const data = await response.json();
      if (data.code === "blocked") {
        toast.error("Bạn không thể liên lạc với người này!");
      }
    } catch { toast.error("Lỗi"); } finally { setIsSendingMessage(false); }
  };

  const handleEditMessage = async (messageId: string, newText: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/chat/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message_id: messageId, content: newText }),
      });
      const data = await res.json();
      if (data.code === "success") {
        setMsgList(prev => prev.map(m => m.id === messageId ? { ...m, text: newText } : m));
        setEditingMessage(null);
        toast.success("Đã chỉnh sửa");
      } else { toast.error(data.Message || "Lỗi"); }
    } catch { toast.error("Lỗi"); }
  };

  const canEditMessage = (msg: Message) => {
    if (msg.sender !== 'me' || msg.deleted_for_everyone) return false;
    if (!msg.createdAt) return false;
    const diff = Date.now() - new Date(msg.createdAt).getTime();
    return diff < 15 * 60 * 1000;
  };

  const handleRemindMessage = (message: Message) => {
    toast.success("Đã đặt nhắc nhở");
    const preview = message.file_type === 'file' ? (message.file_name || 'Tệp đính kèm') : (message.text || '');
    window.setTimeout(() => {
      toast.info(`Nhắc nhở: ${preview}`.trim());
    }, 5 * 60 * 1000);
    setContextMenu(null);
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
        setMsgList(prev => prev.map(m => (m.id === messageId ? { ...m, pinned: true } : m)));
      } else {
        toast.error(data.Message);
      }
    } catch (err) {
      toast.error("Lỗi ghim tin nhắn");
    }
  };

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

  const handleChangeBackground = async (bg: string | null) => {
    if (!selectedChat) return;
    const bgValue = bg === 'system' ? null : bg;
    if (selectedChatType === 'group') {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/groups/update-background`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ groupId: selectedChat, background: bgValue }),
        });
        const data = await res.json();
        if (data.code === "success") {
          setChatBackground(bgValue);
          setGroupChats(prev => prev.map(g => g._id === selectedChat ? { ...g, background: bgValue || undefined } : g));
          toast.success("Đã đổi nền");
        } else {
          toast.error(data.Message || "Lỗi đổi nền");
        }
      } catch { toast.error("Lỗi"); }
    } else {
      setChatBackground(bgValue);
      if (bgValue) {
        localStorage.setItem(`chatBg_${selectedChat}`, bgValue);
      } else {
        localStorage.removeItem(`chatBg_${selectedChat}`);
      }
      toast.success("Đã đổi nền");
    }
  };

  const handleChangeQuickEmoji = async (emoji: string) => {
    if (selectedChatType === 'group' && selectedChat) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/groups/update-emoji`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ groupId: selectedChat, quickEmoji: emoji }),
        });
      } catch {}
    }
    setQuickEmoji(emoji);
  };

  const handleReport = () => {
    setShowReportModal(true);
  };

  const handleBlockUser = async () => {
    if (!selectedChat || selectedChatType !== 'friend') return;
    if (!confirm("Bạn có chắc muốn chặn người dùng này? Họ sẽ không thể nhắn tin cho bạn.")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/users/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: selectedChat }),
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success("Đã chặn người dùng");
        setBlockStatus({ iBlockedThem: true, theyBlockedMe: blockStatus.theyBlockedMe });
        setBlockedUsers(prev => [...prev, selectedChat]);
        fetchBlockedUsers();
      } else {
        toast.error(data.Message || "Lỗi");
      }
    } catch {
      toast.error("Lỗi kết nối");
    }
  };

  const handleUnblockUser = async () => {
    if (!selectedChat || selectedChatType !== 'friend') return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/users/unblock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: selectedChat }),
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success("Đã bỏ chặn người dùng");
        setBlockStatus({ iBlockedThem: false, theyBlockedMe: blockStatus.theyBlockedMe });
        setBlockedUsers(prev => prev.filter(id => id !== selectedChat));
        fetchBlockedUsers();
      } else {
        toast.error(data.Message || "Lỗi");
      }
    } catch {
      toast.error("Lỗi kết nối");
    }
  };

  // Kiểm tra tin nhắn có bị ẩn do block không (trong nhóm)
  const isMessageFromBlockedUser = (senderId?: string) => {
    if (!senderId) return false;
    return blockedUsers.includes(senderId);
  };

  // Toggle hiển thị tin nhắn đã ẩn
  const toggleRevealMessage = (messageId: string) => {
    setRevealedMessages(prev => ({ ...prev, [messageId]: !prev[messageId] }));
  };

  const handleSendVoice = async (audioBlob: Blob) => {
    const now = Date.now();
    if (now - lastVoiceSendTime.current < 2000) {
      toast.error("Vui lòng đợi một chút trước khi gửi tiếp");
      return;
    }
    if (isSendingMessage || !selectedChat || !selectedChatType || !currentUser?._id) return;
    setIsSendingMessage(true);
    lastVoiceSendTime.current = now;
    try {
      const formData = new FormData();
      const fileName = `voice_${Date.now()}.webm`;
      formData.append("file", audioBlob, fileName);
      formData.append("sender_id", currentUser._id);
      formData.append("receiver_id", selectedChat);
      formData.append("type", selectedChatType);
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/chat/send`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (data.code === "success") {
        setShowVoiceRecorder(false);
        toast.success("Đã gửi tin nhắn thoại");
      } else {
        toast.error(data.Message || "Lỗi gửi tin nhắn thoại");
      }
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleNotificationSettings = () => {
    if (selectedChat && selectedChatType) {
      toggleMuted(getChatKey(selectedChatType, selectedChat));
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

  useEffect(() => {
    if (didApplyUrlSelection.current) return;
    if (!friendsList.length && !groupChats.length) return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const type = params.get('type');
    if (id && (type === 'friend' || type === 'group')) {
      didApplyUrlSelection.current = true;
      handleSelectChat(id, type);
    }
  }, [friendsList, groupChats]);

  // Lấy lịch sử (Kèm type group/friend)
  useEffect(() => {
    const fetchHistory = async () => {
      if (selectedChat) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/chat/list`, {
            method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
            body: JSON.stringify({ sender_id: currentUser?._id, receiver_id: selectedChat, type: selectedChatType, limit: 50, skip: 0 }),
          });
          const data = await res.json();
          if (data.code === "success") {
            const history = (data.data || []) as unknown[];
            const historyList: Message[] = history.map((rawMsg) => {
              const msg = rawMsg as ServerRoomMessage;
              let sName = "Người dùng"; let sAvatar = "";
              const msgSenderObj = msg.sender_id && typeof msg.sender_id === 'object' ? (msg.sender_id as AccountUser) : null;
              if (msgSenderObj) { sName = msgSenderObj.fullName || "Người dùng"; sAvatar = msgSenderObj.avatar || ""; }
              const msgSenderId = typeof msg.sender_id === "string" ? msg.sender_id : msgSenderObj?._id;
              return { 
                id: msg._id, 
                text: msg.content || "", 
                sender: (msgSenderId === currentUser?._id ? 'me' : 'other') as Message['sender'], 
                timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
                senderName: sName, 
                senderAvatar: sAvatar,
                senderId: msgSenderId,
                file_url: msg.file_url,
                file_type: msg.file_type,
                file_name: msg.file_name,
                deleted: msg.deleted || false,
                deleted_for_me: false,
                deleted_for_everyone: msg.deleted_for_everyone || false,
                forwarded_from: msg.forwarded_from,
                pinned: msg.pinned || false,
                pinned_by: msg.pinned_by,
                reactions: msg.reactions || []
              };
            });
            setMsgList(historyList);
            setTimeout(scrollToBottom, 100);
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
              <h1 onClick={handleResetHome} className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 cursor-pointer flex items-center gap-2">
                Messages
                {totalUnread > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white">{totalUnread}</span>
                )}
              </h1>
              <button onClick={toggleDarkMode} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"> {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />} </button>
            </div>
            
            {/* --- NÚT GỬI TIN & THÔNG BÁO --- */}
            <div className="flex gap-2 mb-4">
                <button onClick={() => setShowSendMessageModal(true)} className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md hover:opacity-90"> <Plus className="w-5 h-5" /> Gửi Tin Nhắn </button>
                <button onClick={() => {setShowRequestModal(true); setFriendRequestCount(0)}} className="w-12 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center relative hover:bg-gray-50">
                    <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
                    {friendRequestCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{friendRequestCount}</span>}
                </button>
            </div>

            <div className="relative w-full mb-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder="Tìm theo tên, username, số điện thoại..."
                className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl bg-gray-50 dark:bg-gray-800 text-sm font-medium"
              />
              {sidebarSearch.trim() && (
                <div className="absolute top-12 left-0 right-0 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg z-20 overflow-hidden">
                  {friendsList
                    .filter((f) => {
                      const q = sidebarSearch.trim().toLowerCase();
                      return (
                        f.name.toLowerCase().includes(q) ||
                        (f.username || "").toLowerCase().includes(q) ||
                        (f.phone || "").includes(sidebarSearch.trim())
                      );
                    })
                    .slice(0, 6)
                    .map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          handleSelectChat(f.id, 'friend');
                          setSidebarSearch("");
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
                      >
                        <div className={`w-8 h-8 ${f.color} rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-xs`}>
                          {f.avatar ? <img src={f.avatar} className="w-full h-full object-cover" /> : f.letter}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{f.name}</div>
                          <div className="text-xs text-gray-500 truncate">{f.username || f.phone || ""}</div>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
            {/* GROUP LIST */}
            <div className="flex items-center justify-between mb-2 mt-2 px-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nhóm Chat</span>
              <button onClick={() => setShowCreateGroup(true)} className="p-1 hover:bg-purple-100 rounded-lg"> <Plus className="w-4 h-4 text-gray-400" /> </button>
            </div>
            <div className="space-y-1 mb-6">
              {groupChats.map((group) => {
                const hasUnread = (unreadCounts[getChatKey('group', group._id)] || 0) > 0;
                return (
                <div key={group._id} className="relative group/item">
                  <button onClick={() => handleSelectChat(group._id, 'group')} className={`w-full p-3 rounded-xl flex items-center gap-3 relative transition-all ${selectedChat === group._id ? 'bg-purple-50 dark:bg-gray-800' : hasUnread ? 'bg-purple-50/50 dark:bg-purple-900/20 ring-1 ring-purple-200 dark:ring-purple-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    {selectedChat === group._id && <div className="absolute left-0 top-3 bottom-3 w-1 bg-purple-500 rounded-r-full"></div>}
                    <GroupAvatar groupId={group._id} title={group.title} avatar={group.avatar} users={group.users || []} className="w-11 h-11 rounded-full flex-shrink-0 mr-2" />
                    <div className="flex-1 text-left min-w-0 pl-1">
                      <div className={`font-semibold text-sm truncate ${hasUnread ? 'text-purple-700 dark:text-purple-300' : 'text-gray-900 dark:text-white'}`}>{group.title}</div>
                      <div className="text-xs text-gray-400">{group.users?.length || 0} thành viên</div>
                    </div>
                    {hasUnread && (
                      <span className="min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-md">
                        {unreadCounts[getChatKey('group', group._id)]}
                      </span>
                    )}
                  </button>
                </div>
              );})}
            </div>

            {/* FRIEND LIST */}
            <div className="flex items-center justify-between mb-2 px-2 mt-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bạn Bè</span>
              <button onClick={() => setShowAddFriend(true)} className="p-1 hover:bg-purple-100 rounded-lg"> <UserPlus className="w-4 h-4 text-gray-400" /> </button>
            </div>
            <div className="space-y-1 pb-10">
              {friendsList.map((friend) => {
                const hasUnread = (unreadCounts[getChatKey('friend', friend.id)] || 0) > 0;
                return (
                <button key={friend.id} onClick={() => handleSelectChat(friend.id, 'friend')} className={`w-full p-3 rounded-xl flex items-center gap-3 relative transition-all ${selectedChat === friend.id ? 'bg-purple-50 dark:bg-gray-800' : hasUnread ? 'bg-purple-50/50 dark:bg-purple-900/20 ring-1 ring-purple-200 dark:ring-purple-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  {selectedChat === friend.id && <div className="absolute left-0 top-2 bottom-2 w-[4px] bg-purple-600 rounded-r-md"></div>}
                  <div className="relative pl-1">
                    <div className={`w-10 h-10 ${friend.color} rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden`}> {friend.avatar ? <img src={friend.avatar} className="w-full h-full object-cover" /> : friend.letter} </div>
                    {friend.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className={`font-semibold text-sm truncate ${hasUnread ? 'text-purple-700 dark:text-purple-300' : 'text-gray-900 dark:text-white'}`}>{friend.name}</div>
                    <div className="text-xs text-gray-400 truncate">{friend.status || "Đang hoạt động"}</div>
                  </div>
                  {hasUnread && (
                    <span className="min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-md">
                      {unreadCounts[getChatKey('friend', friend.id)]}
                    </span>
                  )}
                </button>
              );})}
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
          <div className="flex-1 flex bg-[#fdfdfd] dark:bg-gray-900">
            <div className="flex-1 flex flex-col">
            <div className="h-20 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 sticky top-0">
              <div className="flex items-center gap-4 cursor-pointer" onClick={() => setShowChatInfo(true)}>
                {selectedChatData?.type === 'group' ? (
                  <GroupAvatar groupId={(selectedChatData as GroupChat)._id} title={(selectedChatData as GroupChat).title} avatar={(selectedChatData as GroupChat).avatar} users={(selectedChatData as GroupChat).users || []} className="w-11 h-11 rounded-full" />
                ) : (
                  <div className="relative">
                    <div className={`w-11 h-11 ${(selectedChatData as FriendChat).color} rounded-full flex items-center justify-center shadow-md text-white font-bold text-lg overflow-hidden`}> {(selectedChatData as FriendChat).avatar ? <img src={(selectedChatData as FriendChat).avatar} className="w-full h-full object-cover" /> : (selectedChatData as FriendChat).letter} </div>
                    {(selectedChatData as FriendChat).isOnline && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-[3px] border-white"></div>}
                  </div>
                )}

                <div> <h2 className="font-bold text-lg text-gray-900 dark:text-white">{selectedChatData.type === 'friend' ? selectedChatData.name : selectedChatData.title}</h2> <div className="flex items-center gap-1.5"> {selectedChatData.type === 'friend' && (<><div className={`w-2 h-2 rounded-full ${(selectedChatData as FriendChat).isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div> <p className="text-xs font-medium text-gray-500">{(selectedChatData as FriendChat).isOnline ? "Đang hoạt động" : "Không hoạt động"}</p></>)} {selectedChatData.type === 'group' && <p className="text-xs font-medium text-gray-500">{(selectedChatData as GroupChat).users?.length || 0} thành viên</p>} </div> </div>
              </div>
              <button onClick={() => setShowChatInfo(!showChatInfo)} className={`p-2.5 rounded-xl transition-colors ${showChatInfo ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100 text-gray-400 hover:text-purple-600'}`}> <Info className="w-6 h-6" /> </button>
            </div>

            {pinnedMessages.length > 0 && (
              <button
                type="button"
                onClick={() => scrollToMessage(pinnedMessages[0].id)}
                className="px-8 py-2 bg-yellow-50 dark:bg-yellow-900/10 border-b border-yellow-200 dark:border-yellow-900/30 text-left w-full"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    {pinnedMessages[0].senderAvatar ? (
                      <img src={pinnedMessages[0].senderAvatar} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-yellow-500 flex items-center justify-center text-white font-bold text-xs">
                        {(pinnedMessages[0].senderName || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                      <Pin className="w-3 h-3 fill-current" />
                      <span>{pinnedMessages.length} tin nhắn đã ghim</span>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-200 truncate">
                      {pinnedMessages[0].file_url && pinnedMessages[0].file_type === 'image'
                        ? '📷 Hình ảnh'
                        : pinnedMessages[0].file_url && pinnedMessages[0].file_type === 'file'
                          ? `📎 ${pinnedMessages[0].file_name || 'Tệp đính kèm'}`
                          : (pinnedMessages[0].text || '')}
                    </div>
                  </div>
                </div>
              </button>
            )}

            <div className={`flex-1 overflow-y-auto p-8 z-0 custom-scrollbar ${chatBackground || ''}`} onClick={() => setContextMenu(null)}>
              <div className="flex flex-col justify-end min-h-full space-y-6">
              {msgList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-300">
                  <p className="text-sm font-medium">Chưa có tin nhắn nào</p>
                </div>
              ) : (
                msgList.map((message) => {
                  const isMyMessage = message.sender === 'me';
                  const canDeleteForEveryone = isMyMessage && !message.deleted_for_everyone;
                  const isHovered = hoveredMessageId === message.id;
                  const senderOnline = message.senderId ? friendsList.find(f => f.id === message.senderId)?.isOnline : false;
                  
                  // Kiểm tra nếu tin nhắn từ người bị chặn trong nhóm
                  const isBlockedInGroup = selectedChatType === 'group' && !isMyMessage && isMessageFromBlockedUser(message.senderId);
                  const isRevealed = revealedMessages[message.id];
                  
                  // Nếu tin nhắn từ người bị chặn và chưa được reveal
                  if (isBlockedInGroup && !isRevealed) {
                    return (
                      <div 
                        key={message.id}
                        ref={(el) => { messageRefs.current[message.id] = el; }}
                        className="flex justify-start group relative"
                      >
                        <div className="relative w-8 h-8 mr-2 self-end flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center">
                            <span className="text-gray-500 text-xs">🚫</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => toggleRevealMessage(message.id)}
                          className="px-5 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                            Bạn đã chặn người này, click để xem tin nhắn
                          </p>
                        </button>
                      </div>
                    );
                  }
                  
                    return (
                    <div 
                      key={message.id} 
                      ref={(el) => {
                        messageRefs.current[message.id] = el;
                      }}
                      className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} group relative`}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({ messageId: message.id, x: e.clientX, y: e.clientY });
                      }}
                      onClick={() => setContextMenu(null)}
                      onMouseEnter={() => setHoveredMessageId(message.id)}
                      onMouseLeave={() => { setHoveredMessageId(null); setContextMenu(null); }}
                    >
                      {!isMyMessage && (
                        <div className="relative w-8 h-8 mr-2 self-end flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                            {message.senderAvatar ? (
                              <img src={message.senderAvatar} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-purple-500 flex items-center justify-center text-white font-bold text-xs">
                                {(message.senderName || 'U').charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          {senderOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>}
                        </div>
                      )}
                      <div className={`max-w-[70%] relative ${isMyMessage ? 'items-end' : 'items-start'} flex flex-col gap-1 ${message.pinned ? 'border-l-4 border-yellow-400 pl-2' : ''}`}>
                        {message.pinned && (
                          <div className="text-xs text-yellow-600 dark:text-yellow-400 mb-1 flex items-center gap-1 font-medium">
                            <Pin className="w-3 h-3 fill-current" />
                            <span>Đã ghim</span>
                          </div>
                        )}
                        
                        {message.sender === 'other' && <span className="text-xs text-gray-500 ml-1 font-medium">{message.senderName} {isBlockedInGroup && <span className="text-red-500">(Đã chặn)</span>}</span>}
                        {Boolean(message.forwarded_from) && (
                          <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <Forward className="w-3 h-3" />
                            <span>Đã chuyển tiếp</span>
                          </div>
                        )}
                        {message.deleted_for_everyone ? (
                          <div className={`px-5 py-3 shadow-sm opacity-50 italic ${isMyMessage ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl rounded-tr-sm' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-2xl rounded-tl-sm'}`}>
                            <p className="text-[15px] leading-relaxed text-gray-400 dark:text-gray-500 italic">Tin nhắn đã được thu hồi</p>
                          </div>
                        ) : (
                          <>
                            {message.file_url && message.file_type === 'image' && (
                              <div className="rounded-2xl overflow-hidden max-w-md cursor-pointer hover:opacity-95 transition-opacity" onClick={() => setPreviewImage(message.file_url || null)}>
                                <img src={message.file_url} alt="Ảnh" className="max-w-full h-auto" />
                              </div>
                            )}
                            {message.file_url && message.file_type === 'file' && (
                              <FileMessage 
                                url={message.file_url} 
                                name={message.file_name} 
                                type={message.file_name?.split('.').pop()} 
                                isMyMessage={isMyMessage} 
                              />
                            )}
                            {message.file_url && message.file_type === 'voice' && (
                              <div className="p-2 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                                    <Mic className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                  </div>
                                  <audio controls className="h-8 w-[200px] filter dark:invert" preload="metadata">
                                    <source src={message.file_url} />
                                  </audio>
                                </div>
                              </div>
                            )}
                            {message.text && (
                              <div className={`px-5 py-3 shadow-sm ${message.pinned ? 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700' : ''} ${highlightedMessageIds[message.id] ? 'ring-2 ring-purple-200' : ''} ${isMyMessage ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl rounded-tr-sm' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-2xl rounded-tl-sm'}`}>
                                <p className="text-[15px] leading-relaxed">{message.text}</p>
                              </div>
                            )}
                          </>
                        )}
                        <div className={`flex items-center gap-2 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 px-1 font-medium">
                            {new Date().toLocaleDateString('vi-VN')} {message.timestamp}
                          </span>
                        </div>
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex -space-x-1 mt-1">
                            {Array.from(new Set(message.reactions.map(r => r.emoji))).map((emoji, idx) => (
                              <span key={idx} className="w-6 h-6 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs shadow-sm z-[1]">
                                {emoji}
                              </span>
                            ))}
                            <span className="px-1.5 py-0.5 text-[10px] text-gray-500 bg-white dark:bg-gray-800 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm self-center ml-1">
                              {message.reactions.length}
                            </span>
                          </div>
                        )}
                        {hoveredMessageId === message.id && !contextMenu && (
                          <div className={`absolute z-40 flex flex-col gap-2 ${isMyMessage ? 'right-full mr-3 items-end' : 'left-full ml-3 items-start'} top-0`}>
                            <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg px-2 py-1 flex items-center gap-1 border border-gray-100 dark:border-gray-700 whitespace-nowrap">
                              {['❤️','😂','😮','😢','😡','👍'].map((emo) => {
                                const isReacted = message.reactions?.some(r => r.user_id === currentUser?._id && r.emoji === emo);
                                return (
                                <button
                                  key={emo}
                                  type="button"
                                  onClick={() => handleReaction(message.id, emo)}
                                  className={`px-1 text-base leading-none hover:scale-125 transition-transform ${isReacted ? 'bg-blue-100 rounded-full' : ''}`}
                                >
                                  {emo}
                                </button>
                              )})}
                              <button
                                type="button"
                                onClick={() => setShowEmojiPicker(true)}
                                className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm hover:bg-gray-200"
                              >
                                +
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button onClick={() => handleForwardMessage(message)} className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700 transition-colors" title="Chuyển tiếp">
                                <Forward className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                              </button>
                              {message.pinned ? (
                                <button onClick={() => handleUnpinMessage(message.id)} className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700 transition-colors" title="Bỏ ghim">
                                  <Pin className="w-4 h-4 text-yellow-500" />
                                </button>
                              ) : (
                                <button onClick={() => handlePinMessage(message.id)} className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700 transition-colors" title="Ghim">
                                  <Pin className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                </button>
                              )}
                              {canEditMessage(message) && (
                                <button onClick={() => setEditingMessage({ id: message.id, text: message.text })} className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700 transition-colors" title="Chỉnh sửa">
                                  <Edit3 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                </button>
                              )}
                              <button onClick={() => setShowDeleteModal({ messageId: message.id, isMyMessage })} className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700 transition-colors" title="Xóa">
                                <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                              </button>
                              {!isMyMessage && (
                                <button onClick={() => { toast.info('Đã báo cáo tin nhắn'); }} className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-100 dark:border-gray-700 transition-colors text-red-500" title="Báo cáo">
                                  <Flag className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      {isMyMessage && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden ml-2 self-end flex-shrink-0">
                          {currentUser?.avatar ? (
                            <img src={currentUser.avatar} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                              {(currentUser?.fullName || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Context Menu */}
                      {contextMenu?.messageId === message.id && (
                        <div 
                          ref={contextMenuRef}
                          style={{ top: contextMenu.y, left: contextMenu.x }}
                          className="fixed bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-[100] min-w-[180px]"
                          onClick={(e) => e.stopPropagation()}
                          onMouseEnter={() => setHoveredMessageId(message.id)}
                          onMouseLeave={() => { setHoveredMessageId(null); setContextMenu(null); }}
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
                            onClick={() => handleRemindMessage(message)}
                            className="w-full px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                          >
                            <Bell className="w-4 h-4" />
                            Nhắc nhở
                          </button>
                          <button 
                            onClick={() => handleDeleteForMe(message.id)}
                            className="w-full px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                          >
                            <Trash2 className="w-4 h-4" />
                            Xóa phía bạn
                          </button>
                          {!isMyMessage && (
                            <button 
                              onClick={() => { setShowReportModal(true); setContextMenu(null); }}
                              className="w-full px-4 py-2.5 text-left hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-sm text-red-500"
                            >
                              <Flag className="w-4 h-4" />
                              Báo cáo
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
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 z-10 relative">
              {/* Hiển thị thông báo block nếu đang chat riêng và bị block */}
              {selectedChatType === 'friend' && blockStatus.iBlockedThem && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400 text-center mb-2">
                    Bạn đã chặn người dùng này
                  </p>
                  <button 
                    onClick={handleUnblockUser}
                    className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Bỏ chặn để tiếp tục nhắn tin
                  </button>
                </div>
              )}
              
              {/* Hiển thị khi người kia block mình */}
              {selectedChatType === 'friend' && blockStatus.theyBlockedMe && !blockStatus.iBlockedThem && (
                <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Bạn không thể liên lạc với người này!
                  </p>
                </div>
              )}
              
              {showEmojiPicker && !blockStatus.iBlockedThem && !blockStatus.theyBlockedMe && (<div className="absolute bottom-24 right-8 z-50 shadow-2xl rounded-xl"> <EmojiPicker onEmojiClick={onEmojiClick} theme={darkMode ? Theme.DARK : Theme.LIGHT} searchDisabled={false} width={350} height={400} /> </div>)}
              {filePreview && !blockStatus.iBlockedThem && !blockStatus.theyBlockedMe && (
                <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center gap-2 relative max-w-md">
                  <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                  <span className="flex-1 text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]" title={selectedFile?.name}>{selectedFile?.name}</span>
                  <button onClick={handleRemoveFile} disabled={isSendingMessage} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full disabled:opacity-50">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              )}
              {selectedFile && !filePreview && !blockStatus.iBlockedThem && !blockStatus.theyBlockedMe && (
                <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center gap-2 relative max-w-md">
                  <Paperclip className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <span className="flex-1 text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]" title={selectedFile.name}>{selectedFile.name}</span>
                  <button onClick={handleRemoveFile} disabled={isSendingMessage} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full disabled:opacity-50">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              )}
              
              {/* Ẩn form nhập tin nhắn nếu bị block (chat riêng) */}
              {selectedChatType === 'friend' && (blockStatus.iBlockedThem || blockStatus.theyBlockedMe) ? null : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-2 flex items-center gap-2 border border-gray-100 dark:border-gray-700 shadow-sm">
                {showVoiceRecorder ? (
                  <div className="flex-1">
                    <VoiceRecorder
                      onSend={handleSendVoice}
                      onCancel={() => setShowVoiceRecorder(false)}
                      isSending={isSendingMessage}
                    />
                  </div>
                ) : (
                  <>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden" 
                      id="file-input"
                      accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                    />
                    <label htmlFor="file-input" className={`p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-gray-400 cursor-pointer ${isSendingMessage ? 'pointer-events-none opacity-60' : ''}`}>
                      <Paperclip className="w-5 h-5" />
                    </label>
                    <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !isSendingMessage && (messageInput.trim() ? handleSendMessage() : handleSendQuickEmoji())} onFocus={() => setShowEmojiPicker(false)} placeholder="Nhắn tin..." className="flex-1 bg-transparent border-none focus:outline-none text-gray-800 dark:text-white px-2 py-2" />
                    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} disabled={isSendingMessage} className="p-2 rounded-xl text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-60"> <Smile className="w-5 h-5" /> </button>
                    <button onClick={() => setShowVoiceRecorder(true)} disabled={isSendingMessage} className="p-2 rounded-xl text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-60" title="Ghi âm"> <Mic className="w-5 h-5" /> </button>
                    {messageInput.trim() || selectedFile ? (
                      <button onClick={handleSendMessage} disabled={isSendingMessage} className="w-11 h-11 flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 rounded-xl shadow-md disabled:opacity-60"> <Send className="w-5 h-5 text-white" /> </button>
                    ) : (
                      <button onClick={handleSendQuickEmoji} disabled={isSendingMessage} className="w-11 h-11 flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 rounded-xl shadow-md disabled:opacity-60 text-xl"> {quickEmoji} </button>
                    )}
                  </>
                )}
              </div>
              )}
            </div>
          </div>
          {showChatInfo && currentUser && (
            <ChatInfoSidebar 
              chatData={selectedChatData} 
              onClose={() => setShowChatInfo(false)} 
              currentUser={currentUser} 
              onRefreshGroup={fetchGroups}
              pinnedMessages={pinnedMessages.map(pm => ({
                id: pm.id,
                text: pm.text,
                senderName: pm.senderName,
                timestamp: pm.timestamp,
                file_type: pm.file_type,
                file_name: pm.file_name
              }))}
              muted={mutedChats[getChatKey(selectedChatType || 'friend', selectedChat || '')]}
              onToggleMuted={() => toggleMuted(getChatKey(selectedChatType || 'friend', selectedChat || ''))}
              onInvite={() => setShowInviteMembersModal(true)}
              onSearchMessages={() => setShowSearchMessagesModal(true)}
              onCopyLink={() => {
                const url = `${window.location.origin}/chat?id=${selectedChat}&type=${selectedChatType}`;
                navigator.clipboard.writeText(url);
                toast.success('Đã sao chép liên kết');
              }}
              onOpenMembers={() => setShowMembersModal(true)}
              onOpenFiles={(tab) => { setAttachmentsTab(tab); setShowAttachmentsModal(true); }}
              onGoToPinned={(id) => { scrollToMessage(id); flashMessage(id); }}
              onUnpinMessage={handleUnpinMessage}
              quickEmoji={quickEmoji}
              onChangeQuickEmoji={handleChangeQuickEmoji}
              background={chatBackground}
              onChangeBackground={handleChangeBackground}
              onReport={handleReport}
              onNotificationSettings={handleNotificationSettings}
              onBlockUser={handleBlockUser}
              onlineUserIds={friendsList.filter(f => f.isOnline).map(f => f.id)}
            />
          )}
        </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#fdfdfd] dark:bg-gray-900"> <div className="text-center"> <div className="w-32 h-32 mx-auto mb-6 bg-purple-50 rounded-full flex items-center justify-center"> <MessageCircle className="w-16 h-16 text-purple-400" /> </div> <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3"> Xin chào! </h2> </div> </div>
        )}
      </div>
      {showProfileModal && <Information onClose={() => setShowProfileModal(false)} currentUser={currentUser} onUpdateSuccess={handleUpdateUser} />}
      {previewImage && <ImagePreviewModal src={previewImage} onClose={() => setPreviewImage(null)} />}
      {showCreateGroup && <CreateGroupModal onClose={() => setShowCreateGroup(false)} onSuccess={fetchGroups} friends={friendsList} />}
      {showAddFriend && <AddFriendModal onClose={() => setShowAddFriend(false)} onSuccess={fetchFriends} onViewProfile={(userId) => setProfileModal({userId, isFriend: false})} />}
      {showRequestModal && <FriendRequestModal onClose={() => setShowRequestModal(false)} onSuccess={fetchFriends} notifications={notifications} />}
      {showForwardModal && messageToForward && (
        <ForwardModal 
          onClose={() => { setShowForwardModal(false); setMessageToForward(null); }} 
          message={messageToForward}
          friends={friendsList}
          groups={groupChats}
          onForward={handleConfirmForward}
        />
      )}
      {showSendMessageModal && (
        <SendMessageModal 
            onClose={() => setShowSendMessageModal(false)} 
            friends={friendsList} 
            onSelectFriend={(id) => handleSelectChat(id, 'friend')}
            onViewProfile={(userId, isFriend) => setProfileModal({userId, isFriend})}
            onStartChatWithNonFriend={(userId) => handleSelectChat(userId, 'friend')}
        />
      )}
      {showSearchMessagesModal && (
        <SearchMessagesModal
          onClose={() => setShowSearchMessagesModal(false)}
          messages={msgList}
          onJump={(id) => { scrollToMessage(id); flashMessage(id); }}
        />
      )}
      {showInviteMembersModal && selectedChatType === 'group' && selectedChat && (
        <InviteMembersModal
          groupId={selectedChat}
          onClose={() => setShowInviteMembersModal(false)}
          onSuccess={() => { fetchGroups(); setShowInviteMembersModal(false); }}
          friends={friendsList.map(f => ({ id: f.id, name: f.name, avatar: f.avatar, letter: f.letter, phone: f.phone, username: f.username }))}
          existingMemberIds={(groupChats.find(g => g._id === selectedChat)?.users || []).map(u => typeof u.user_id === 'string' ? u.user_id : u.user_id?._id || '')}
        />
      )}
      {showAttachmentsModal && (
        <ChatAttachmentsModal
          onClose={() => setShowAttachmentsModal(false)}
          messages={msgList}
          tab={attachmentsTab}
        />
      )}
      {showMembersModal && selectedChatType === 'group' && selectedChat && (
        <GroupMembersModal
          groupId={selectedChat}
          onClose={() => setShowMembersModal(false)}
          onViewProfile={(userId, isFriend) => setProfileModal({userId, isFriend})}
          currentUserId={currentUser?._id}
          friendIds={friendsList.map(f => f.id)}
          onlineUserIds={friendsList.filter(f => f.isOnline).map(f => f.id)}
          blockedUserIds={blockedUsers}
        />
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Xóa tin nhắn</h3>
            <div className="space-y-2">
              <button onClick={() => { handleDeleteForMe(showDeleteModal.messageId); setShowDeleteModal(null); }} className="w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-sm">Xóa phía tôi</button>
              {showDeleteModal.isMyMessage && (
                <button onClick={() => { handleDeleteForEveryone(showDeleteModal.messageId); setShowDeleteModal(null); }} className="w-full p-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm text-red-500">Thu hồi với mọi người</button>
              )}
            </div>
            <button onClick={() => setShowDeleteModal(null)} className="w-full mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-medium">Hủy</button>
          </div>
        </div>
      )}
      {editingMessage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Chỉnh sửa tin nhắn</h3>
            <textarea value={editingMessage.text} onChange={(e) => setEditingMessage({ ...editingMessage, text: e.target.value })} className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-sm resize-none h-24" />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditingMessage(null)} className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-medium">Hủy</button>
              <button onClick={() => handleEditMessage(editingMessage.id, editingMessage.text)} className="flex-1 p-3 bg-purple-500 text-white rounded-xl text-sm font-medium">Lưu</button>
            </div>
          </div>
        </div>
      )}
      {showReportModal && selectedChat && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          reportedUserId={selectedChatType === 'friend' ? selectedChat : undefined}
          reportedGroupId={selectedChatType === 'group' ? selectedChat : undefined}
          targetName={selectedChatType === 'group' 
            ? groupChats.find(g => g._id === selectedChat)?.title || 'Nhóm' 
            : friendsList.find(f => f.id === selectedChat)?.name || 'Người dùng'}
        />
      )}
      {profileModal && (
        <UserProfileModal
          userId={profileModal.userId}
          isFriend={profileModal.isFriend}
          onClose={() => setProfileModal(null)}
          onSendMessage={(userId) => { handleSelectChat(userId, 'friend'); setProfileModal(null); }}
          onAddFriend={() => { fetchFriends(); setProfileModal(null); }}
        />
      )}
    </>
  );
};