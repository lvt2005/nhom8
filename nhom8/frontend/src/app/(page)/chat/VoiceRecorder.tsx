"use client";
import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Send, Trash2, Pause, Play } from "lucide-react";

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob) => void;
  onCancel: () => void;
  isSending?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSend, onCancel, isSending }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setDuration(0);

      timerRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = window.setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob);
    }
  };

  const handleCancel = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    onCancel();
  };

  const handleReset = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
  };

  // Auto-start recording when component mounts
  useEffect(() => {
    startRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl animate-in slide-in-from-bottom-2">
      {/* Delete button */}
      <button
        onClick={handleCancel}
        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
        title="Hủy"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      {/* Recording indicator / Audio player */}
      <div className="flex-1 flex items-center gap-3">
        {isRecording ? (
          <>
            {/* Recording animation */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isPaused ? "bg-yellow-500" : "bg-red-500 animate-pulse"}`} />
              <span className="text-sm font-mono text-gray-700 dark:text-gray-300 min-w-[50px]">
                {formatDuration(duration)}
              </span>
            </div>
            {/* Waveform visualization */}
            <div className="flex-1 flex items-center justify-center gap-0.5 h-8">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 bg-purple-500 rounded-full transition-all ${isPaused ? "h-1" : ""}`}
                  style={{
                    height: isPaused ? "4px" : `${Math.random() * 24 + 8}px`,
                    animationDelay: `${i * 50}ms`,
                  }}
                />
              ))}
            </div>
          </>
        ) : audioUrl ? (
          <>
            <audio ref={audioRef} src={audioUrl} className="hidden" />
            <span className="text-sm font-mono text-gray-700 dark:text-gray-300 min-w-[50px]">
              {formatDuration(duration)}
            </span>
            <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: "100%" }} />
            </div>
            <button
              onClick={handleReset}
              className="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
              title="Ghi lại"
            >
              <Mic className="w-4 h-4" />
            </button>
          </>
        ) : null}
      </div>

      {/* Action buttons */}
      {isRecording ? (
        <div className="flex items-center gap-2">
          <button
            onClick={pauseRecording}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            title={isPaused ? "Tiếp tục" : "Tạm dừng"}
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
          <button
            onClick={stopRecording}
            className="p-2.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            title="Dừng ghi"
          >
            <Square className="w-5 h-5" />
          </button>
        </div>
      ) : audioBlob ? (
        <button
          onClick={handleSend}
          disabled={isSending}
          className="p-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          title="Gửi"
        >
          <Send className="w-5 h-5" />
        </button>
      ) : null}
    </div>
  );
};
