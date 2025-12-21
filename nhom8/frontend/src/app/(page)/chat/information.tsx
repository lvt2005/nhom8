import React, { useState, useEffect, useRef } from 'react';
import { toast, Toaster } from 'sonner';
import { Eye, EyeOff, Ban, X } from 'lucide-react';
import Link from 'next/link';

// 1. Định nghĩa Interface
interface User {
  _id?: string;
  fullName: string;
  email: string;
  bio?: string;
  username?: string;
  phone?: string;
  avatar?: string;
}

interface BlockedUser {
  _id: string;
  fullName: string;
  avatar?: string;
  phone?: string;
}

interface InformationProps {
  onClose: () => void;
  currentUser: User | null;
  onUpdateSuccess: (newData: User) => void;
}

export const Information: React.FC<InformationProps> = ({ onClose, currentUser, onUpdateSuccess }) => {
  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'blocked'>('account');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string>('');

  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [formData, setFormData] = useState<User>({
    fullName: '',
    email: '',
    bio: '',
    username: '',
    phone: '',
    avatar: ''
  });

  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // --- USE EFFECT 1: Đổ dữ liệu ---
  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.fullName || '',
        email: currentUser.email || '',
        bio: currentUser.bio || '',
        username: currentUser.username || '',
        phone: currentUser.phone || '',
        avatar: currentUser.avatar || ''
      });
      setPreviewAvatar(currentUser.avatar || '');
    }
  }, [currentUser]);

  // --- USE EFFECT 2: Cleanup Memory Leak ---
  useEffect(() => {
    return () => {
      if (previewAvatar && previewAvatar.startsWith('blob:')) {
        URL.revokeObjectURL(previewAvatar);
      }
    };
  }, [previewAvatar]);

  // --- USE EFFECT 3: Fetch blocked users khi chuyển tab ---
  useEffect(() => {
    if (activeTab === 'blocked') {
      fetchBlockedUsers();
    }
  }, [activeTab]);

  const fetchBlockedUsers = async () => {
    setLoadingBlocked(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/users/blocked`, { credentials: 'include' });
      const data = await res.json();
      if (data.code === "success") {
        setBlockedUsers(data.data || []);
      }
    } catch {
      toast.error("Lỗi tải danh sách chặn");
    } finally {
      setLoadingBlocked(false);
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/users/unblock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success("Đã bỏ chặn người dùng");
        setBlockedUsers(prev => prev.filter(u => u._id !== userId));
      } else {
        toast.error(data.Message || "Lỗi");
      }
    } catch {
      toast.error("Lỗi kết nối");
    }
  };

  // --- HÀM XỬ LÝ ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB.");
        return;
      }
      setAvatarFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewAvatar(objectUrl);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassData({ ...passData, [e.target.id]: e.target.value });
  };

  // --- API: CẬP NHẬT PROFILE ---
  const handleSaveProfile = async () => {
    setIsLoading(true);
    
    try {
      const dataToSend = new FormData();
      dataToSend.append('fullName', formData.fullName);
      dataToSend.append('phone', formData.phone || '');
      dataToSend.append('bio', formData.bio || '');

      if (avatarFile) {
        dataToSend.append('avatar', avatarFile);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/users/update`, {
        method: "PUT",
        credentials: "include",
        body: dataToSend,
      });

      const data = await res.json();
      
      if (data.code === "success") {
        toast.success(data.Message || "Cập nhật thành công!");
        onUpdateSuccess({
          ...currentUser!,
          ...formData,
          avatar: data.data?.avatar || previewAvatar || currentUser?.avatar || ''
        });
      } else {
        toast.error(data.Message || "Cập nhật thất bại.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi kết nối server, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- API: ĐỔI MẬT KHẨU ---
  const handleChangePassword = async () => {
    if (passData.newPassword !== passData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (passData.newPassword.length < 6) {
      toast.error("Mật khẩu phải trên 6 ký tự!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/users/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passData.currentPassword,
          newPassword: passData.newPassword
        }),
      });

      const data = await res.json();
      if (data.code === "success") {
        toast.success("Đổi mật khẩu thành công!");
        setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.Message || "Đổi mật khẩu thất bại.");
      }
    } catch (err) {
      toast.error("❌ Lỗi kết nối server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster richColors closeButton position="top-right" style={{ zIndex: 9999 }} />
      
      <div className="fixed flex inset-0 z-[1000] items-center justify-center bg-black/60 backdrop-blur-sm py-10" onClick={onClose}>
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl transform transition-all max-h-[90vh] overflow-y-auto flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile & Settings</h2>
            <button 
                type="button" 
                onClick={onClose} 
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Profile Banner - Gradient hồng-tím như ảnh */}
          <div className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                    {previewAvatar ? (
                      <img src={previewAvatar} className="w-full h-full object-cover" alt="Avatar" />
                    ) : (
                      <span className="text-4xl font-bold text-white">{formData.fullName?.charAt(0).toUpperCase() || "U"}</span>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    disabled={isLoading}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-white text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-100 hover:text-indigo-600 transition-all shadow-lg cursor-pointer disabled:opacity-50"
                    title="Đổi ảnh đại diện"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </button>
                </div>

                <div className="flex-1 text-white">
                  <h3 className="text-3xl font-bold mb-1 tracking-tight">{formData.fullName || "User Một"}</h3>
                  <p className="text-white/90 text-sm">{formData.bio || ""}</p>
                </div>
              </div>
              
              {/* Online Badge */}
              <div className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2 font-medium shadow-lg">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                Online
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10">
            {['account', 'security', 'blocked'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab as 'account' | 'security' | 'blocked')}
                className={`flex-1 px-6 py-4 font-medium transition-all duration-200 relative ${
                  activeTab === tab
                    ? 'text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-800 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {tab === 'account' ? 'Tài khoản' : tab === 'security' ? 'Bảo mật' : 'Danh sách chặn'}
              </button>
            ))}
          </div>

          {/* Tab Content: Account */}
          <div className={`p-8 ${activeTab === 'account' ? 'block' : 'hidden'}`}>
            <div>
                {/* Section Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                    <h3 className="text-lg font-bold">Thông tin cá nhân</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cập nhật chi tiết cá nhân và thông tin hồ sơ của bạn</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cột trái */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tên hiển thị</label>
                      <input
                        type="text"
                        id="fullName"
                        value={formData.fullName}
                        onChange={handleProfileChange}
                        disabled={isLoading}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-400 mt-1">Email không thể thay đổi</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giới thiệu</label>
                      <textarea
                        id="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleProfileChange}
                        disabled={isLoading}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none transition-all disabled:opacity-60"
                      />
                    </div>
                  </div>

                  {/* Cột phải */}
                  <div className="space-y-4">

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Số điện thoại</label>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={handleProfileChange}
                        disabled={isLoading}
                        placeholder="Nhập số điện thoại"
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white transition-all disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button - Gradient hồng tím */}
                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="px-8 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading && (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
            </div>
          </div>

          {/* Tab Content: Security */}
          <div className={`p-8 ${activeTab === 'security' ? 'block' : 'hidden'}`}>
            <div>
                <div className="max-w-md mx-auto space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mật khẩu hiện tại</label>
                    <div className="relative">
                      <input
                      type={showCurrentPass ? "text" : "password"}
                      id="currentPassword"
                      value={passData.currentPassword}
                      onChange={handlePassChange}
                      disabled={isLoading}
                      className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white transition-all"
                      />
                      <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {showCurrentPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mật khẩu mới</label>
                    <div className="relative">
                      <input
                      type={showNewPass ? "text" : "password"}
                      id="newPassword"
                      value={passData.newPassword}
                      onChange={handlePassChange}
                      disabled={isLoading}
                      className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white transition-all"
                      />
                      <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {showNewPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Xác nhận mật khẩu mới</label>
                    <div className="relative">
                      <input
                      type={showConfirmPass ? "text" : "password"}
                      id="confirmPassword"
                      value={passData.confirmPassword}
                      onChange={handlePassChange}
                      disabled={isLoading}
                      className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white transition-all"
                      />
                      <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {showConfirmPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={isLoading}
                    className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg shadow-md transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
                </button>
                
                <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link href="/forgotPassword" onClick={onClose} className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400">
                    Quên mật khẩu? Khôi phục qua email
                  </Link>
                </div>
                </div>
            </div>
          </div>

          {/* Tab Content: Blocked Users */}
          <div className={`p-8 ${activeTab === 'blocked' ? 'block' : 'hidden'}`}>
            <div>
              <div className="mb-6">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                  <Ban className="w-5 h-5" />
                  <h3 className="text-lg font-bold">Danh sách chặn</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Quản lý những người dùng bạn đã chặn</p>
              </div>

              {loadingBlocked ? (
                <div className="text-center py-8 text-gray-500">Đang tải...</div>
              ) : blockedUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Ban className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">Bạn chưa chặn ai cả</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {blockedUsers.map(user => (
                    <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-red-500 flex items-center justify-center text-white font-bold">
                              {user.fullName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">{user.fullName}</p>
                          {user.phone && <p className="text-xs text-gray-500">{user.phone}</p>}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleUnblock(user._id)}
                        className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Bỏ chặn
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};