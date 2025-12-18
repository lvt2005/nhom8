"use client";
import React, { useMemo } from "react";
import { FileText, Image as ImageIcon, Link as LinkIcon, X } from "lucide-react";

type MessageItem = {
  id: string;
  text?: string;
  file_url?: string;
  file_type?: string;
  file_name?: string;
};

const extractLinks = (text: string) => {
  const matches = text.match(/https?:\/\/[^\s]+/g);
  return matches ? matches : [];
};

export const ChatAttachmentsModal = ({
  onClose,
  messages,
  tab,
}: {
  onClose: () => void;
  messages: MessageItem[];
  tab: "media" | "files" | "links";
}) => {
  const media = useMemo(() => messages.filter((m) => m.file_url && m.file_type === "image"), [messages]);
  const files = useMemo(() => messages.filter((m) => m.file_url && m.file_type === "file"), [messages]);
  const links = useMemo(() => {
    const all = messages.flatMap((m) => extractLinks(m.text || ""));
    return Array.from(new Set(all));
  }, [messages]);

  const title = tab === "media" ? "File phương tiện" : tab === "files" ? "File" : "Liên kết";
  const Icon = tab === "media" ? ImageIcon : tab === "files" ? FileText : LinkIcon;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in zoom-in-95">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h3>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar border border-gray-100 dark:border-gray-700 rounded-xl p-2 bg-gray-50 dark:bg-gray-700/30">
          {tab === "media" && (
            <div className="grid grid-cols-3 gap-2">
              {media.map((m) => (
                <a key={m.id} href={m.file_url} target="_blank" rel="noopener noreferrer" className="rounded-xl overflow-hidden bg-gray-200">
                  <img src={m.file_url} className="w-full h-24 object-cover" />
                </a>
              ))}
              {media.length === 0 && <div className="col-span-3 text-sm text-gray-400 px-2 py-6 text-center">Chưa có</div>}
            </div>
          )}

          {tab === "files" && (
            <div className="space-y-2">
              {files.map((m) => (
                <a
                  key={m.id}
                  href={m.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-xl bg-white/60 dark:bg-gray-700/60 hover:bg-white dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-600"
                >
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{m.file_name || "Tệp đính kèm"}</div>
                  <div className="text-xs text-gray-400 truncate">{m.file_url}</div>
                </a>
              ))}
              {files.length === 0 && <div className="text-sm text-gray-400 px-2 py-6 text-center">Chưa có</div>}
            </div>
          )}

          {tab === "links" && (
            <div className="space-y-2">
              {links.map((l) => (
                <a
                  key={l}
                  href={l}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-xl bg-white/60 dark:bg-gray-700/60 hover:bg-white dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 truncate"
                >
                  {l}
                </a>
              ))}
              {links.length === 0 && <div className="text-sm text-gray-400 px-2 py-6 text-center">Chưa có</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
