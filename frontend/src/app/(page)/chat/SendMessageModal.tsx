"use client";
import React, { useEffect, useMemo, useState } from "react";
import { X, UserPlus, Info } from "lucide-react";
import { toast } from "sonner";

export type FriendChat = {
  id: string;
  name: string;
  status: string;
  letter: string;
  color: string;
  isOnline: boolean;
  avatar?: string;
  phone?: string;
  username?: string;
};

type SearchUser = {
  _id: string;
  fullName: string;
  avatar?: string;
  phone?: string;
  isFriend: boolean;
};

export const SendMessageModal = ({
  onClose,
  friends,
  onSelectFriend,
  onViewProfile,
  onStartChatWithNonFriend,
}: {
  onClose: () => void;
  friends: FriendChat[];
  onSelectFriend: (id: string) => void;
  onViewProfile?: (userId: string, isFriend: boolean) => void;
  onStartChatWithNonFriend?: (userId: string, userName: string) => void;
}) => {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Search all users when input changes
  useEffect(() => {
    const q = search.trim();
    if (!q || q.length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/users/search-all`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ query: q }),
        });
        const data = await res.json();
        if (data.code === "success") {
          setSearchResults(data.data || []);
        }
      } catch {
        // ignore
      } finally {
        setIsSearching(false);
        setHasSearched(true);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  // Filter friends for quick suggestions when not searching
  const filteredFriends = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter(f => {
      const name = f.name?.toLowerCase() || "";
      const username = f.username?.toLowerCase() || "";
      const phone = f.phone || "";
      return name.includes(q) || username.includes(q) || phone.includes(q);
    });
  }, [friends, search]);

  const handleAddFriend = async (userId: string) => {
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
      } else {
        toast.error(data.Message || "Lỗi");
      }
    } catch {
      toast.error("Lỗi kết nối");
    }
  };

  const showSearchResults = search.trim().length >= 2 && hasSearched;

  return (
    <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in zoom-in-95">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative flex flex-col max-h-[80vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Tin nhắn mới</h3>

        <div className="mb-4">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400">Đến:</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nhập tên hoặc số điện thoại..."
              className="w-full pl-12 pr-4 py-2.5 border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-purple-500 bg-transparent dark:text-white"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isSearching && (
            <div className="text-center py-4 text-gray-500 text-sm">Đang tìm kiếm...</div>
          )}

          {showSearchResults ? (
            <>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Kết quả tìm kiếm</p>
              {searchResults.length > 0 ? (
                searchResults.map(user => (
                  <div
                    key={user._id}
                    className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl cursor-pointer transition-colors group"
                  >
                    <div 
                      className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden mr-3"
                      onClick={() => onViewProfile?.(user._id, user.isFriend)}
                    >
                      {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div 
                      className="flex-1 min-w-0"
                      onClick={() => {
                        if (user.isFriend) {
                          onSelectFriend(user._id);
                          onClose();
                        } else {
                          onStartChatWithNonFriend?.(user._id, user.fullName);
                          onClose();
                        }
                      }}
                    >
                      <div className="font-semibold text-sm text-gray-900 dark:text-white truncate flex items-center gap-2">
                        {user.fullName}
                        {user.isFriend && <span className="text-xs text-green-500 font-normal">Bạn bè</span>}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{user.phone || ""}</div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); onViewProfile?.(user._id, user.isFriend); }}
                        className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500"
                        title="Xem thông tin"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      {!user.isFriend && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAddFriend(user._id); }}
                          className="p-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-500"
                          title="Kết bạn"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">Không tìm thấy người dùng</div>
              )}
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Gợi ý từ bạn bè</p>
              {filteredFriends.length > 0 ? (
                filteredFriends.map(friend => (
                  <div
                    key={friend.id}
                    className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl cursor-pointer transition-colors group"
                  >
                    <div 
                      className={`w-10 h-10 rounded-full ${friend.color} flex items-center justify-center text-white font-bold text-sm overflow-hidden mr-3`}
                      onClick={() => onViewProfile?.(friend.id, true)}
                    >
                      {friend.avatar ? <img src={friend.avatar} className="w-full h-full object-cover" /> : friend.letter}
                    </div>
                    <div 
                      className="flex-1 min-w-0"
                      onClick={() => {
                        onSelectFriend(friend.id);
                        onClose();
                      }}
                    >
                      <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{friend.name}</div>
                      <div className="text-xs text-gray-500 truncate">{friend.username || friend.phone || ""}</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onViewProfile?.(friend.id, true); }}
                      className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Xem thông tin"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">Không tìm thấy người dùng</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
