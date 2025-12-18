"use client";
import React, { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, ChevronRight, Crown, FileText, Flag, Image as ImageIcon, Link as LinkIcon, LogOut as LogOutIcon, Palette, Pin, Search, Smile, Trash2, UserMinus, UserPlus, X, Ban } from "lucide-react";
import { toast } from "sonner";
import { GroupAvatar } from "./GroupAvatar";

type AccountUser = {
  _id: string;
  fullName?: string;
  avatar?: string;
  phone?: string;
  username?: string;
};

type GroupMember = {
  user_id: AccountUser | string;
  role: string;
};

type GroupChatData = {
  type: "group";
  _id: string;
  title: string;
  avatar?: string;
  users: GroupMember[];
  background?: string;
  quickEmoji?: string;
};

type FriendChatData = {
  type: "friend";
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  color?: string;
};

type ChatData = GroupChatData | FriendChatData;

type PinnedMessagePreview = {
  id: string;
  text?: string;
  senderName?: string;
  timestamp?: string;
  file_type?: string;
  file_name?: string;
};

const BACKGROUND_OPTIONS = [
  { value: null, label: "Mặc định", color: "bg-white dark:bg-gray-900" },
  { value: "system", label: "Hệ thống", color: "bg-[#fdfdfd] dark:bg-gray-900" },
  { value: "bg-gradient-to-b from-purple-50 to-pink-50", label: "Tím hồng", color: "bg-gradient-to-r from-purple-200 to-pink-200" },
  { value: "bg-gradient-to-b from-blue-50 to-cyan-50", label: "Xanh dương", color: "bg-gradient-to-r from-blue-200 to-cyan-200" },
  { value: "bg-gradient-to-b from-green-50 to-emerald-50", label: "Xanh lá", color: "bg-gradient-to-r from-green-200 to-emerald-200" },
  { value: "bg-gradient-to-b from-orange-50 to-yellow-50", label: "Cam vàng", color: "bg-gradient-to-r from-orange-200 to-yellow-200" },
  { value: "bg-gradient-to-b from-gray-100 to-slate-100", label: "Xám", color: "bg-gradient-to-r from-gray-300 to-slate-300" },
];

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "👏", "🎉"];

export const ChatInfoSidebar = ({
  chatData,
  onClose,
  currentUser,
  onRefreshGroup,
  pinnedMessages,
  muted,
  onToggleMuted,
  onInvite,
  onSearchMessages,
  onCopyLink,
  onOpenMembers,
  onOpenFiles,
  onGoToPinned,
  onUnpinMessage,
  quickEmoji,
  onChangeQuickEmoji,
  background,
  onChangeBackground,
  onReport,
  onNotificationSettings,
  onBlockUser,
  onlineUserIds = [],
}: {
  chatData: ChatData;
  onClose: () => void;
  currentUser: AccountUser;
  onRefreshGroup?: () => void;
  pinnedMessages?: PinnedMessagePreview[];
  muted?: boolean;
  onToggleMuted?: () => void;
  onInvite?: () => void;
  onSearchMessages?: () => void;
  onCopyLink?: () => void;
  onOpenMembers?: () => void;
  onOpenFiles?: (tab: "media" | "files" | "links") => void;
  onGoToPinned?: (messageId: string) => void;
  onUnpinMessage?: (messageId: string) => void;
  quickEmoji?: string;
  onChangeQuickEmoji?: (emoji: string) => void;
  background?: string | null;
  onChangeBackground?: (bg: string | null) => void;
  onBlockUser?: () => void;
  onReport?: () => void;
  onNotificationSettings?: () => void;
  onlineUserIds?: string[];
  onRefreshGroup?: () => void;
  pinnedMessages?: PinnedMessagePreview[];
  muted?: boolean;
  onToggleMuted?: () => void;
  onInvite?: () => void;
  onSearchMessages?: () => void;
  onCopyLink?: () => void;
  onOpenMembers?: () => void;
  onOpenFiles?: (tab: "media" | "files" | "links") => void;
  onGoToPinned?: (messageId: string) => void;
  onUnpinMessage?: (messageId: string) => void;
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(["chatInfo", "members", "files", "privacy", "customize"]);
  const [isUploading, setIsUploading] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => (prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]));
  };

  const isGroup = chatData.type === "group";
  const displayTitle = isGroup ? (chatData as GroupChatData).title : (chatData as FriendChatData).name;
  const currentUserId = currentUser?._id && (currentUser._id as unknown as { toString?: () => string }).toString ? (currentUser._id as unknown as { toString: () => string }).toString() : currentUser?._id;
  let myRoleInGroup: string | null = null;
  if (isGroup) {
    const group = chatData as GroupChatData;
    myRoleInGroup =
      group.users?.find((u) => {
        const userId = typeof u.user_id === "string" ? u.user_id : u.user_id?._id;
        const userIdStr = userId && (userId as unknown as { toString?: () => string }).toString ? (userId as unknown as { toString: () => string }).toString() : userId;
        return userIdStr === currentUserId;
      })?.role || null;
  }
  const isSuperAdmin = myRoleInGroup === "superAdmin";

  const handleLeaveGroup = async () => {
    if (!isGroup) return;
    if (!confirm("Rời nhóm?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/groups/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ groupId: (chatData as GroupChatData)._id }),
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success(data.Message || "Đã rời nhóm");
        onClose();
        onRefreshGroup?.();
      } else {
        toast.error(data.Message || "Lỗi");
      }
    } catch (e) {
      toast.error("Lỗi");
    }
  };

  const handleDeleteGroup = async () => {
    if (!isGroup) return;
    if (!confirm("Giải tán nhóm?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/groups/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ groupId: (chatData as GroupChatData)._id }),
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success(data.Message || "Đã giải tán");
        onClose();
        onRefreshGroup?.();
      } else {
        toast.error(data.Message || "Lỗi");
      }
    } catch (e) {
      toast.error("Lỗi");
    }
  };

  const handleDeleteFriend = async () => {
    if (chatData.type !== "friend") return;
    if (!confirm("Xóa bạn bè?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/users/remove-friend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ friendId: chatData.id }),
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success("Đã xóa");
        onClose();
      } else {
        toast.error(data.Message || "Lỗi");
      }
    } catch (e) {
      toast.error("Lỗi");
    }
  };
  const handleTransferOwner = async (userId: string) => {
    if (!isGroup || !isSuperAdmin) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/groups/transfer-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ groupId: (chatData as GroupChatData)._id, newAdminId: userId }),
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success("Đã chuyển quyền trưởng nhóm");
        setShowTransferModal(false);
        onRefreshGroup?.();
      } else { toast.error(data.Message || "Lỗi"); }
    } catch { toast.error("Lỗi"); }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!isGroup || !isSuperAdmin) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/groups/kick-member`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ groupId: (chatData as GroupChatData)._id, userId }),
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success("Đã xóa thành viên");
        setShowRemoveModal(null);
        onRefreshGroup?.();
      } else { toast.error(data.Message || "Lỗi"); }
    } catch { toast.error("Lỗi"); }
  };
  const handlePickAvatar = () => {
    if (!isSuperAdmin || !isGroup) return;
    fileRef.current?.click();
  };

  const handleUploadAvatar = async (file: File) => {
    if (!isSuperAdmin || !isGroup) return;
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("groupId", (chatData as GroupChatData)._id);
      form.append("avatar", file);
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/groups/upload-avatar`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success(data.Message || "Đã cập nhật ảnh nhóm");
        onRefreshGroup?.();
      } else {
        toast.error(data.Message || "Lỗi");
      }
    } catch (e) {
      toast.error("Lỗi");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-[350px] bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 h-full flex flex-col shadow-xl">
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-800">
        <span className="font-bold text-lg text-gray-800 dark:text-white">Thông tin hội thoại</span>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col items-center p-6 border-b border-gray-100 dark:border-gray-800">
          {isGroup ? (
            <GroupAvatar
              groupId={(chatData as GroupChatData)._id}
              title={(chatData as GroupChatData).title}
              avatar={(chatData as GroupChatData).avatar}
              users={(chatData as GroupChatData).users || []}
              className="w-20 h-20 rounded-full"
            />
          ) : (
            <div className={`w-20 h-20 rounded-full ${chatData.color || "bg-purple-500"} flex items-center justify-center text-white text-3xl font-bold overflow-hidden`}>
              {chatData.avatar ? <img src={chatData.avatar} className="w-full h-full object-cover" /> : (chatData.name || "U").charAt(0).toUpperCase()}
            </div>
          )}

          <h2 className="text-lg font-bold text-gray-900 dark:text-white text-center mt-3">{displayTitle}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{isGroup ? `${(chatData as GroupChatData).users?.length || 0} thành viên` : chatData.phone || ""}</p>

          <div className="flex items-center gap-4 mt-4 w-full justify-center">
            {isGroup && (
              <button onClick={onInvite} className="flex flex-col items-center gap-1 cursor-pointer group" type="button">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                  <UserPlus className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Mời</span>
              </button>
            )}
            <button onClick={onToggleMuted} className="flex flex-col items-center gap-1 cursor-pointer group" type="button">
              <div className={`w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors ${muted ? 'opacity-60' : ''}`}>
                <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Tắt</span>
            </button>
            <button onClick={onSearchMessages} className="flex flex-col items-center gap-1 cursor-pointer group" type="button">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                <Search className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Tìm</span>
            </button>
          </div>

          {isGroup && isSuperAdmin && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUploadAvatar(f);
                }}
              />
              <button
                onClick={handlePickAvatar}
                disabled={isUploading}
                className="mt-4 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-semibold"
              >
                {isUploading ? "Đang tải..." : "Đổi ảnh nhóm"}
              </button>
            </>
          )}
        </div>

        <div className="p-2">
          <div className="mb-1">
            <button onClick={() => toggleSection("chatInfo")} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">Thông tin về đoạn chat</span>
              {expandedSections.includes("chatInfo") ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
            </button>
            {expandedSections.includes("chatInfo") && (
              <div className="pl-4 pr-2 pb-2 space-y-1">
                {isGroup && (
                  <button onClick={onCopyLink} type="button" className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                    <LinkIcon className="w-4 h-4" /> Sao chép liên kết
                  </button>
                )}

                {pinnedMessages && pinnedMessages.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 flex items-center gap-1">
                      <Pin className="w-3 h-3" /> Tin nhắn đã ghim ({pinnedMessages.length})
                    </div>
                    {pinnedMessages.slice(0, 5).map((pm) => (
                      <div key={pm.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg group">
                        <button
                          type="button"
                          onClick={() => onGoToPinned?.(pm.id)}
                          className="flex-1 text-left min-w-0"
                        >
                          <div className="text-sm text-gray-700 dark:text-gray-200 truncate">
                            {pm.file_type === 'file' ? (pm.file_name || 'Tệp đính kèm') : (pm.text || '')}
                          </div>
                          <div className="text-[11px] text-gray-400 truncate">
                            {pm.senderName || ''}{pm.timestamp ? ` · ${pm.timestamp}` : ''}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => onUnpinMessage?.(pm.id)}
                          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          title="Bỏ ghim"
                        >
                          <X className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mb-1">
            <button onClick={() => toggleSection("customize")} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">Tùy chỉnh đoạn chat</span>
              {expandedSections.includes("customize") ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
            </button>
            {expandedSections.includes("customize") && (
              <div className="pl-4 pr-2 pb-2 space-y-1">
                <div className="flex items-center gap-3 p-2 relative">
                  <Smile className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <span className="text-sm text-gray-600 dark:text-gray-300 flex-1">Emoji nhanh</span>
                  <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-lg">{quickEmoji || "👍"}</button>
                  {showEmojiPicker && (
                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 flex gap-1 z-10">
                      {EMOJI_OPTIONS.map((e) => (
                        <button key={e} onClick={() => { onChangeQuickEmoji?.(e); setShowEmojiPicker(false); }} className="text-xl p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">{e}</button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 p-2 relative">
                  <Palette className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <span className="text-sm text-gray-600 dark:text-gray-300 flex-1">Đổi nền chat</span>
                  <button onClick={() => setShowBackgroundPicker(!showBackgroundPicker)} className={`w-6 h-6 rounded-full border-2 border-gray-300 ${background || 'bg-gray-100'}`} />
                  {showBackgroundPicker && (
                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 z-10">
                      <div className="grid grid-cols-3 gap-2">
                        {BACKGROUND_OPTIONS.map((opt) => (
                          <button
                            key={opt.label}
                            onClick={() => { onChangeBackground?.(opt.value); setShowBackgroundPicker(false); }}
                            className={`w-12 h-12 rounded-lg ${opt.color} border-2 ${background === opt.value ? 'border-purple-500' : 'border-transparent'}`}
                            title={opt.label}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mb-1">
            <button onClick={() => toggleSection("members")} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">Thành viên trong đoạn chat</span>
              {expandedSections.includes("members") ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
            </button>
            {expandedSections.includes("members") && (
              <div className="pl-4 pr-2 pb-2 space-y-1">
                {isGroup ? (
                  ((chatData as GroupChatData).users || []).slice(0, 6).map((u, idx: number) => {
                    const userId = typeof u.user_id === "string" ? u.user_id : u.user_id?._id;
                    const isSelf = userId === currentUserId;
                    const isOwner = u.role === "superAdmin";
                    const isOnline = isSelf || (userId ? onlineUserIds?.includes(userId) : false);
                    return (
                      <div key={idx} className="flex items-center gap-3 p-2 group">
                        <div className="relative w-8 h-8 flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                            {typeof u.user_id !== "string" && u.user_id?.avatar ? (
                              <img src={u.user_id.avatar} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-xs">{(typeof u.user_id !== "string" ? (u.user_id?.fullName || "U") : "U").charAt(0)}</div>
                            )}
                          </div>
                          <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800 ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-gray-800 dark:text-gray-200">{typeof u.user_id !== "string" ? u.user_id?.fullName : ""}</p>
                          <p className="text-xs text-gray-500">{isOwner ? "Trưởng nhóm" : "Thành viên"}</p>
                        </div>
                        {isSuperAdmin && !isSelf && !isOwner && (
                          <div className="hidden group-hover:flex gap-1">
                            <button onClick={() => setShowTransferModal(true)} title="Chuyển quyền" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"><Crown className="w-4 h-4 text-yellow-500" /></button>
                            <button onClick={() => setShowRemoveModal(userId || null)} title="Xóa thành viên" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"><UserMinus className="w-4 h-4 text-red-500" /></button>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center gap-3 p-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                      {chatData.avatar ? <img src={chatData.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-xs">{(chatData.name || "U").charAt(0)}</div>}
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{chatData.name}</span>
                  </div>
                )}
                <button onClick={onOpenMembers} type="button" className="w-full text-center py-2 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">Xem tất cả</button>
              </div>
            )}
          </div>

          <div className="mb-1">
            <button onClick={() => toggleSection("files")} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">File phương tiện, file và liên kết</span>
              {expandedSections.includes("files") ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
            </button>
            {expandedSections.includes("files") && (
              <div className="pl-4 pr-2 pb-2 space-y-1">
                <button onClick={() => onOpenFiles?.('media')} type="button" className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                  <ImageIcon className="w-4 h-4" /> File phương tiện
                </button>
                <button onClick={() => onOpenFiles?.('files')} type="button" className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                  <FileText className="w-4 h-4" /> File
                </button>
                <button onClick={() => onOpenFiles?.('links')} type="button" className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                  <LinkIcon className="w-4 h-4" /> Liên kết
                </button>
              </div>
            )}
          </div>

          <div className="mb-1">
            <button onClick={() => toggleSection("privacy")} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">Quyền riêng tư và hỗ trợ</span>
              {expandedSections.includes("privacy") ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
            </button>
            {expandedSections.includes("privacy") && (
              <div className="pl-4 pr-2 pb-2 space-y-1">
                <button onClick={onNotificationSettings} className="w-full flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4" /> Thông báo
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${muted ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{muted ? 'Tắt' : 'Bật'}</span>
                </button>
                <button onClick={onReport} className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                  <Flag className="w-4 h-4" /> Báo cáo
                </button>
                {!isGroup && (
                  <button onClick={onBlockUser} className="w-full flex items-center gap-3 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm text-red-500">
                    <Ban className="w-4 h-4" /> Chặn người dùng
                  </button>
                )}
                {isGroup ? (
                  <button onClick={handleLeaveGroup} className="w-full flex items-center gap-3 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm text-red-500">
                    <LogOutIcon className="w-4 h-4" /> Rời khỏi đoạn chat
                  </button>
                ) : (
                  <button onClick={handleDeleteFriend} className="w-full flex items-center gap-3 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm text-red-500">
                    <Trash2 className="w-4 h-4" /> Xóa bạn bè
                  </button>
                )}
                {isGroup && isSuperAdmin && (
                  <button onClick={handleDeleteGroup} className="w-full flex items-center gap-3 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm text-red-600">
                    <Trash2 className="w-4 h-4" /> Giải tán nhóm
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showTransferModal && isGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowTransferModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 w-80 max-h-96 overflow-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Chuyển quyền trưởng nhóm</h3>
            <div className="space-y-2">
              {((chatData as GroupChatData).users || []).filter(u => {
                const uid = typeof u.user_id === "string" ? u.user_id : u.user_id?._id;
                return uid !== currentUserId && u.role !== "superAdmin";
              }).map((u, idx) => {
                const uid = typeof u.user_id === "string" ? u.user_id : u.user_id?._id;
                return (
                  <button key={idx} onClick={() => uid && handleTransferOwner(uid)} className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                      {typeof u.user_id !== "string" && u.user_id?.avatar ? <img src={u.user_id.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-xs">{(typeof u.user_id !== "string" ? (u.user_id?.fullName || "U") : "U").charAt(0)}</div>}
                    </div>
                    <span className="text-sm text-gray-800 dark:text-gray-200">{typeof u.user_id !== "string" ? u.user_id?.fullName : ""}</span>
                  </button>
                );
              })}
            </div>
            <button onClick={() => setShowTransferModal(false)} className="mt-3 w-full py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm">Hủy</button>
          </div>
        </div>
      )}

      {showRemoveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowRemoveModal(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 w-72" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Xóa thành viên</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Bạn có chắc muốn xóa thành viên này khỏi nhóm?</p>
            <div className="flex gap-2">
              <button onClick={() => setShowRemoveModal(null)} className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm">Hủy</button>
              <button onClick={() => handleRemoveMember(showRemoveModal)} className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
