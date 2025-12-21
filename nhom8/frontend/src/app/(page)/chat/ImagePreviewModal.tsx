import { X, Download } from "lucide-react";

export const ImagePreviewModal = ({ src, onClose }: { src: string; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center animate-in fade-in duration-200" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
        <X className="w-6 h-6" />
      </button>
      <a 
        href={src} 
        download 
        onClick={(e) => e.stopPropagation()}
        className="absolute top-4 right-16 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Download className="w-6 h-6" />
      </a>
      <img src={src} alt="Preview" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
    </div>
  );
};
