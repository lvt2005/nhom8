"use client";
import React, { useEffect, useState } from "react";
import { X, Info } from "lucide-react";
import { toast } from "sonner";

type AccountUser = {
  _id: string;
  fullName?: string;
  avatar?: string;
};

type Member = {
  user_id: AccountUser | string;
  role: string;
};

export const GroupMembersModal = ({
  groupId,
  onClose,
  onViewProfile,
  currentUserId,
  friendIds = [],
  onlineUserIds = [],
}: {
  groupId: string;
  onClose: () => void;
  onViewProfile?: (userId: string, isFriend: boolean) => void;
  currentUserId?: string;
  friendIds?: string[];
  onlineUserIds?: string[];
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/groups/members/${groupId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.code === "success") {
          setMembers((data.data || []) as Member[]);
        } else {
          toast.error(data.Message || "Lỗi");
        }
      } catch {
        toast.error("Lỗi");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [groupId]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in zoom-in-95">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Thành viên</h3>

        <div className="flex-1 overflow-y-auto custom-scrollbar border border-gray-100 dark:border-gray-700 rounded-xl p-2 bg-gray-50 dark:bg-gray-700/30">
          {loading ? (
            <div className="text-sm text-gray-400 px-2 py-6 text-center">Đang tải...</div>
          ) : members.length === 0 ? (
            <div className="text-sm text-gray-400 px-2 py-6 text-center">Chưa có</div>
          ) : (
            members.map((m, idx) => {
              const u = typeof m.user_id === "string" ? null : m.user_id;
              const userId = typeof m.user_id === "string" ? m.user_id : u?._id || "";
              const name = u?.fullName || "Người dùng";
              const isCurrentUser = userId === currentUserId;
              const isFriend = friendIds.includes(userId);
              const isOnline = isCurrentUser || onlineUserIds.includes(userId);
              
              return (
                <div 
                  key={idx} 
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-gray-700/60 border border-gray-100 dark:border-gray-600 group hover:bg-gray-100 dark:hover:bg-gray-600/60 cursor-pointer transition-colors"
                  onClick={() => !isCurrentUser && onViewProfile?.(userId, isFriend)}
                >
                  <div className="relative w-9 h-9 flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden">
                      {u?.avatar ? (
                        <img src={u.avatar} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-purple-500 flex items-center justify-center text-white font-bold">
                          {name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-700 ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate flex items-center gap-2">
                      {name}
                      {isCurrentUser && <span className="text-xs text-gray-400">(Bạn)</span>}
                      {!isCurrentUser && isFriend && <span className="text-xs text-green-500">Bạn bè</span>}
                    </div>
                    <div className="text-xs text-gray-400">{m.role === "superAdmin" ? "Trưởng nhóm" : "Thành viên"}</div>
                  </div>
                  {!isCurrentUser && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onViewProfile?.(userId, isFriend); }}
                      className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Xem thông tin"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
