"use client";
import React, { useState } from "react";
import { X, AlertTriangle, UserX, MessageSquareOff, Shield, Flag, Send } from "lucide-react";
import { toast } from "sonner";

type ReportType = "spam" | "harassment" | "fake" | "violence" | "inappropriate" | "other";

const REPORT_CATEGORIES: { value: ReportType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: "spam", label: "Spam", icon: <MessageSquareOff className="w-5 h-5" />, description: "Tin nhắn rác, quảng cáo không mong muốn" },
  { value: "harassment", label: "Quấy rối", icon: <AlertTriangle className="w-5 h-5" />, description: "Hành vi quấy rối, đe dọa hoặc bắt nạt" },
  { value: "fake", label: "Giả mạo", icon: <UserX className="w-5 h-5" />, description: "Tài khoản giả mạo người khác" },
  { value: "violence", label: "Bạo lực", icon: <Shield className="w-5 h-5" />, description: "Nội dung bạo lực hoặc nguy hiểm" },
  { value: "inappropriate", label: "Nội dung không phù hợp", icon: <Flag className="w-5 h-5" />, description: "Nội dung khiêu dâm hoặc không phù hợp" },
  { value: "other", label: "Lý do khác", icon: <AlertTriangle className="w-5 h-5" />, description: "Các vi phạm khác không thuộc danh mục trên" },
];

export const ReportModal = ({
  onClose,
  reportedUserId,
  reportedGroupId,
  targetName,
}: {
  onClose: () => void;
  reportedUserId?: string;
  reportedGroupId?: string;
  targetName: string;
}) => {
  const [selectedReason, setSelectedReason] = useState<ReportType | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"select" | "describe" | "success">("select");

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error("Vui lòng chọn lý do báo cáo");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/report/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          reported_user_id: reportedUserId,
          reported_group_id: reportedGroupId,
          reason: selectedReason,
          description: description.trim(),
        }),
      });
      const data = await res.json();
      if (data.code === "success") {
        setStep("success");
      } else {
        toast.error(data.Message || "Có lỗi xảy ra");
      }
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Báo cáo</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {step === "select" && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Tại sao bạn muốn báo cáo <span className="font-semibold text-gray-800 dark:text-white">{targetName}</span>?
              </p>
              <div className="space-y-2">
                {REPORT_CATEGORIES.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedReason(category.value)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      selectedReason === category.value
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${selectedReason === category.value ? "bg-red-100 text-red-600" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
                      {category.icon}
                    </div>
                    <div className="text-left flex-1">
                      <p className={`font-medium ${selectedReason === category.value ? "text-red-600" : "text-gray-800 dark:text-white"}`}>
                        {category.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{category.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "describe" && (
            <>
              <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  {REPORT_CATEGORIES.find((c) => c.value === selectedReason)?.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {REPORT_CATEGORIES.find((c) => c.value === selectedReason)?.label}
                  </p>
                  <button onClick={() => setStep("select")} className="text-xs text-purple-600 hover:underline">
                    Thay đổi
                  </button>
                </div>
              </div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mô tả chi tiết (không bắt buộc)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Hãy cho chúng tôi biết thêm chi tiết về vấn đề bạn gặp phải..."
                className="w-full h-32 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 text-right mt-1">{description.length}/500</p>
            </>
          )}

          {step === "success" && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Cảm ơn bạn đã báo cáo</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chúng tôi sẽ xem xét báo cáo của bạn và thực hiện các biện pháp cần thiết.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
          {step === "select" && (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={() => selectedReason && setStep("describe")}
                disabled={!selectedReason}
                className="flex-1 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tiếp tục
              </button>
            </>
          )}
          {step === "describe" && (
            <>
              <button
                onClick={() => setStep("select")}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Quay lại
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Đang gửi..." : <><Send className="w-4 h-4" /> Gửi báo cáo</>}
              </button>
            </>
          )}
          {step === "success" && (
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-purple-500 text-white font-medium rounded-xl hover:bg-purple-600"
            >
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
