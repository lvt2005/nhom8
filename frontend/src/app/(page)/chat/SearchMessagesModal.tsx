"use client";
import React, { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

type MessageItem = {
  id: string;
  text?: string;
  senderName?: string;
  timestamp?: string;
  file_type?: string;
  file_name?: string;
};

export const SearchMessagesModal = ({
  onClose,
  messages,
  onJump,
}: {
  onClose: () => void;
  messages: MessageItem[];
  onJump: (messageId: string) => void;
}) => {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as MessageItem[];
    return messages
      .filter((m) => {
        const t = (m.text || "").toLowerCase();
        const f = (m.file_name || "").toLowerCase();
        return t.includes(q) || f.includes(q);
      })
      .slice(-50)
      .reverse();
  }, [messages, query]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in zoom-in-95">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Tìm tin nhắn</h3>
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2 mb-4">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập nội dung hoặc tên file..."
            className="w-full bg-transparent outline-none text-sm text-gray-800 dark:text-gray-100"
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar border border-gray-100 dark:border-gray-700 rounded-xl p-2 bg-gray-50 dark:bg-gray-700/30">
          {!query.trim() ? (
            <div className="text-sm text-gray-400 px-2 py-6 text-center">Nhập từ khóa để tìm</div>
          ) : results.length === 0 ? (
            <div className="text-sm text-gray-400 px-2 py-6 text-center">Không tìm thấy</div>
          ) : (
            results.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  onJump(m.id);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 border border-transparent hover:border-gray-100 dark:hover:border-gray-600"
              >
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                  {m.file_type === "file" ? (m.file_name || "Tệp đính kèm") : (m.text || "")}
                </div>
                <div className="text-[11px] text-gray-400 truncate">
                  {(m.senderName || "")}{m.timestamp ? ` · ${m.timestamp}` : ""}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
