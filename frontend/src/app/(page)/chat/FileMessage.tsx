import { FileText, Download } from "lucide-react";

interface FileMessageProps {
  url: string;
  name?: string;
  type?: string;
  isMyMessage: boolean;
}

export const FileMessage = ({ url, name, type, isMyMessage }: FileMessageProps) => {
  const fileName = name || "Tệp đính kèm";
  
  return (
    <div className={`p-3 rounded-2xl flex items-center gap-3 max-w-xs ${isMyMessage ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'}`}>
      <div className={`p-2 rounded-lg ${isMyMessage ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
        <FileText className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" title={fileName}>{fileName}</p>
        <p className="text-xs opacity-80 uppercase">{type || 'FILE'}</p>
      </div>
      <a 
        href={url} 
        download={fileName}
        target="_blank"
        rel="noopener noreferrer"
        className={`p-2 rounded-full transition-colors ${isMyMessage ? 'hover:bg-white/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'}`}
        title="Tải xuống"
      >
        <Download className="w-4 h-4" />
      </a>
    </div>
  );
};
