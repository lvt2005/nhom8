"use client";
import React, { useMemo, useState } from "react";
import { Check, Search, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

type FriendItem = {
  id: string;
  name: string;
  avatar?: string;
  letter: string;
  phone?: string;
  username?: string;
};

type PhoneSearchUser = {
  _id: string;
  fullName: string;
  avatar?: string;
  phone?: string;
};

export const InviteMembersModal = ({
  groupId,
  onClose,
  onSuccess,
  friends,
  existingMemberIds,
}: {
  groupId: string;
  onClose: () => void;
  onSuccess: () => void;
  friends: FriendItem[];
  existingMemberIds: string[];
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [friendQuery, setFriendQuery] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneUser, setPhoneUser] = useState<PhoneSearchUser | null>(null);
  const [loadingPhone, setLoadingPhone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toggle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const filteredFriends = useMemo(() => {
    const q = friendQuery.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) => {
      return (
        (f.name || "").toLowerCase().includes(q) ||
        (f.phone || "").toLowerCase().includes(q) ||
        (f.username || "").toLowerCase().includes(q)
      );
    });
  }, [friends, friendQuery]);

  const handleSearchPhone = async () => {
    const p = phone.trim();
    if (!p) return toast.error("Vui lòng nhập số điện thoại");
    setLoadingPhone(true);
    setPhoneUser(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/users/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: p }),
      });
      const data = await res.json();
      if (data.code === "success") {
        setPhoneUser(data.data as PhoneSearchUser);
      } else {
        toast.error(data.Message || "Không tìm thấy");
      }
    } catch {
      toast.error("Lỗi tìm kiếm");
    } finally {
      setLoadingPhone(false);
    }
  };

  const handleSubmit = async () => {
    const ids = Array.from(new Set(selectedIds))
      .filter((id) => !existingMemberIds.includes(id));
    if (phoneUser?._id && !ids.includes(phoneUser._id) && !existingMemberIds.includes(phoneUser._id)) {
      ids.push(phoneUser._id);
    }
    if (ids.length === 0) return toast.error("Chưa chọn thành viên");

    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/groups/add-members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ groupId, userIds: ids }),
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success(data.Message || "Đã mời thành viên");
        onSuccess();
        onClose();
      } else {
        toast.error(data.Message || "Lỗi");
      }
    } catch {
      toast.error("Lỗi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in zoom-in-95">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Mời vào nhóm</h3>

        <div className="mb-4">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Theo số điện thoại</div>
          <div className="flex items-center gap-2">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại..."
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={handleSearchPhone}
              disabled={loadingPhone}
              className="px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              type="button"
            >
              <Search className="w-5 h-5 text-gray-600 dark:text-gray-200" />
            </button>
          </div>

          {phoneUser && (
            <div className="mt-2 flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700">
              <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                {phoneUser.avatar ? (
                  <img src={phoneUser.avatar} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-purple-500 flex items-center justify-center text-white font-bold">
                    {(phoneUser.fullName || "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{phoneUser.fullName}</div>
                <div className="text-xs text-gray-400 truncate">{phoneUser.phone || ""}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (existingMemberIds.includes(phoneUser._id)) return toast.info("Đã ở trong nhóm");
                  toggle(phoneUser._id);
                }}
                className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bạn bè</div>
        <div className="mb-3 flex items-center gap-2 bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            value={friendQuery}
            onChange={(e) => setFriendQuery(e.target.value)}
            placeholder="Tìm theo tên / username / số điện thoại"
            className="w-full bg-transparent outline-none text-sm text-gray-800 dark:text-gray-100"
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar border border-gray-100 dark:border-gray-700 rounded-xl p-2 bg-gray-50 dark:bg-gray-700/30">
          {filteredFriends.map((f) => {
            const disabled = existingMemberIds.includes(f.id);
            const checked = selectedIds.includes(f.id);
            return (
              <button
                key={f.id}
                type="button"
                disabled={disabled}
                onClick={() => toggle(f.id)}
                className={`w-full flex items-center p-2 rounded-lg cursor-pointer transition-all ${disabled ? 'opacity-50' : 'hover:bg-white dark:hover:bg-gray-700'} ${checked ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-200' : ''}`}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden mr-3 bg-gray-200 flex-shrink-0">
                  {f.avatar ? (
                    <img src={f.avatar} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center font-bold text-gray-500">{f.letter}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{f.name}</div>
                  <div className="text-xs text-gray-400 truncate">{f.username || f.phone || ''}</div>
                </div>
                {checked && <Check className="w-4 h-4 text-purple-600" />}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full mt-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-lg"
          type="button"
        >
          {submitting ? "Đang mời..." : "Mời"}
        </button>
      </div>
    </div>
  );
};
