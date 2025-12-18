"use client";
import React, { useEffect, useState } from "react";
import { X, UserPlus, MessageCircle } from "lucide-react";
import { toast } from "sonner";

type UserProfile = {
  _id: string;
  fullName?: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  isFriend?: boolean;
};

export const UserProfileModal = ({
  userId,
  onClose,
  onSendMessage,
  onAddFriend,
  isFriend = false,
}: {
  userId: string;
  onClose: () => void;
  onSendMessage?: (userId: string) => void;
  onAddFriend?: (userId: string) => void;
  isFriend?: boolean;
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/users/profile/${userId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.code === "success") {
          setUser(data.data);
        } else {
          toast.error(data.Message || "Không thể tải thông tin");
        }
      } catch {
        toast.error("Lỗi kết nối");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const handleAddFriend = async () => {
    setRequesting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/users/request-friend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ friendId: userId }),
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success("Đã gửi lời mời kết bạn!");
        onAddFriend?.(userId);
      } else {
        toast.error(data.Message || "Lỗi");
      }
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in slide-in-from-bottom-4" onClick={(e) => e.stopPropagation()}>
        <div className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 h-24">
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-6">
          <div className="relative -mt-12 mb-4">
            <div className="w-24 h-24 mx-auto rounded-full border-4 border-white dark:border-gray-900 overflow-hidden bg-gray-200">
              {user?.avatar ? (
                <img src={user.avatar} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
                  {(user?.fullName || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4 text-gray-500">Đang tải...</div>
          ) : user ? (
            <>
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user.fullName || "Người dùng"}</h3>
                {isFriend && user.phone && (
                  <p className="text-sm text-gray-500 mt-1">{user.phone}</p>
                )}
              </div>

              {isFriend && user.bio && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">{user.bio}</p>
                </div>
              )}

              {!isFriend && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 mb-4">
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 text-center">
                    Kết bạn để xem thông tin chi tiết
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                {!isFriend && (
                  <button
                    onClick={handleAddFriend}
                    disabled={requesting}
                    className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    {requesting ? "Đang gửi..." : "Kết bạn"}
                  </button>
                )}
                {onSendMessage && (
                  <button
                    onClick={() => { onSendMessage(userId); onClose(); }}
                    className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Nhắn tin
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-gray-500">Không tìm thấy người dùng</div>
          )}
        </div>
      </div>
    </div>
  );
};
