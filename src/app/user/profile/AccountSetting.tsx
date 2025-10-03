'use client';

import { authApi } from '@/lib/auth/authApi';
import { profileApi } from '@/lib/profile/profileApi';
import { useEffect, useState } from 'react';
import { FiX, FiEye, FiEyeOff } from "react-icons/fi";
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { PiCamera } from 'react-icons/pi';

interface AccountSettingProps {
  open: boolean;
  onClose: () => void;
}

const PHONE_REGEX = /^0\d{9}$/;

export default function AccountSetting({ open, onClose }: AccountSettingProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    avatarUrl: '',
    avatarFile: null as File | null,
    email: '',
    phone: ''
  });

  const [originalAvatar, setOriginalAvatar] = useState('');

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState({
  currentPassword: false,
  newPassword: false,
  confirmPassword: false
  });
  
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"view" | "edit" | "password">("view");

  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await profileApi.getProfile();
        const user = res.data?.data;

        const names = user?.fullName?.split(' ') || [];
        const lastName = names.pop() || '';
        const firstName = names.join(' ') || '';

        setFormData({
          firstName,
          lastName,
          bio: user?.bio || '',
          avatarUrl: user?.avatar || '',
          avatarFile: null,
          email: user?.email || '',
          phone: user?.phone || ''
        });
        setOriginalAvatar(user?.avatar || '');
        setView("view");
        setErrors({
          firstName: '',
          lastName: '',
          bio: '',
          phone: '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (error) {
        console.error("Lỗi lấy profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [open]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: any) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  // Validate khi ấn Lưu (Edit)
  const validateEdit = () => {
    const newErrors: typeof errors = { ...errors };

    // FirstName
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Họ không được để trống';
    } else if (formData.firstName.length > 50) {
      newErrors.firstName = 'Họ tối đa 50 ký tự';
    } else {
      newErrors.firstName = '';
    }

    // LastName
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Tên không được để trống';
    } else if (formData.lastName.length > 50) {
      newErrors.lastName = 'Tên tối đa 50 ký tự';
    } else {
      newErrors.lastName = '';
    }

    // Bio
    if (formData.bio.length > 200) {
      newErrors.bio = 'Mô tả tối đa 200 ký tự';
    } else {
      newErrors.bio = '';
    }

    // Phone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!PHONE_REGEX.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại phải là 10 số hợp lệ (bắt đầu bằng 0)';
    } else {
      newErrors.phone = '';
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some(Boolean);
  };

  // Validate khi ấn Lưu (Password)
  const validatePassword = () => {
    const newErrors: typeof errors = { ...errors };

    if (!passwords.currentPassword) newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    else newErrors.currentPassword = '';

    if (!passwords.newPassword) newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    else if (passwords.newPassword.length < 6) newErrors.newPassword = 'Mật khẩu mới tối thiểu 6 ký tự';
    else newErrors.newPassword = '';

    if (passwords.newPassword !== passwords.confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    else newErrors.confirmPassword = '';

    setErrors(newErrors);

    return !Object.values(newErrors).some(Boolean);
  };

  const handleSaveProfile = async () => {
    if (!validateEdit()) return; 

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      await profileApi.updateProfile({
        fullName,
        bio: formData.bio,
        avatar: formData.avatarFile, 
        phone: formData.phone      
      });

      setOriginalAvatar(formData.avatarUrl);
      alert('Cập nhật thành công!');
      setView("view");
      setErrors({
        firstName: '',
        lastName: '',
        bio: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error(error);
      alert('Cập nhật thất bại. Vui lòng thử lại.');
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    try {
      await authApi.changePassword(passwords.currentPassword, passwords.newPassword);
      alert('Đổi mật khẩu thành công!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setView("view");
    } catch {
      alert('Đổi mật khẩu thất bại.');
    }
  };

  if (!open) return null;
  if (loading) return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-[420px] shadow-lg text-center" onClick={e => e.stopPropagation()}>Đang tải...</div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-[420px] shadow-lg relative" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-[var(--primary)] mb-4">
          Cài đặt tài khoản
        </h2>
        <button
          onClick={onClose}
          className="absolute top-7 right-6 cursor-pointer text-[var(--gray-2)] hover:text-[var(--gray-1)]"
        > 
          <FiX size={20} />
        </button>

        {view === "view" && (
          <div className="space-y-3">
            <div className="flex flex-col items-center">
              {originalAvatar ? (
                <img
                  src={originalAvatar }
                  alt="Avatar"
                  className="w-30 h-30 rounded-full mb-2 object-cover border border-gray-300"
                />
              ) : (
                <img
                  src="/Image.svg"
                  alt="Avatar"
                  className="w-30 h-30 rounded-full mb-2 object-cover border border-gray-300"
                />
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  name="lastName" 
                  value={formData.lastName || "Chưa có thông tin"} 
                  label="Họ"
                  readOnly
                  className="cursor-default"
                />
                <Input 
                  name="firstName" 
                  value={formData.firstName || "Chưa có thông tin"} 
                  label="Tên"
                  readOnly
                  className="cursor-default"
                />
              </div>

              <Input 
                name="email" 
                value={formData.email || "Chưa có thông tin"} 
                label="Email"
                readOnly
                className="bg-gray-100 cursor-default"
              />

              <Input 
                name="phone" 
                value={formData.phone || "Chưa có thông tin"} 
                label="Số điện thoại"
                readOnly
                className="cursor-default"
              />

              <Input 
                name="bio" 
                value={formData.bio || "Chưa có mô tả"} 
                label="Tiểu sử"
                readOnly
                className="cursor-default"
              />

              <div className="relative">
                <Input 
                  name="password" 
                  value="••••••••" 
                  label="Mật khẩu" 
                  type="password"
                  readOnly
                  className="cursor-default"
                />
                <span 
                  onClick={() => setView("password")}
                  className="absolute text-sm text-blue-500 mt-2 ml-1 cursor-pointer hover:underline"
                >
                  Đổi mật khẩu
                </span>
              </div>
            </div>

            <div className="flex justify-center mt-10">
              <Button variant="primary" onClick={() => setView("edit")} className="flex items-center gap-2 rounded-xl">
                Sửa thông tin
              </Button>              
            </div>
          </div>
        )}

        {view === "edit" && (
          <div className="space-y-4">
            <div className="flex flex-col items-center ">
              <div className="relative w-30 h-30">
                {formData.avatarUrl ? (
                  <img
                    src={formData.avatarUrl}
                    alt="Avatar"
                    className="w-30 h-30 rounded-full mb-2 object-cover border border-gray-300 cursor-pointer"
                    onClick={() => document.getElementById('avatarInput')?.click()}
                  />
                ) : (
                  <img
                    src="/Image.svg"
                    alt="Avatar"
                    className="w-30 h-30 rounded-full mb-2 object-cover border border-gray-300 cursor-pointer"
                      onClick={() => document.getElementById('avatarInput')?.click()}
                  />
                )}
                <div
                  className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full z-10 cursor-pointer"
                  onClick={() => document.getElementById('avatarInput')?.click()}
                >
                  <PiCamera className="w-10 h-10 text-white" />
                </div>
              </div>
              <input
                id="avatarInput"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const url = URL.createObjectURL(file);
                    setFormData(prev => ({
                      ...prev,
                      avatarUrl: url,
                      avatarFile: file
                    }));
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                label="Họ"
                status={errors.lastName ? "error" : "default"}
                supportText={errors.lastName}
              />
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                label="Tên"
                status={errors.firstName ? "error" : "default"}
                supportText={errors.firstName}
              />
            </div>
            <Input
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              label="Tiểu sử"
              status={errors.bio ? "error" : "default"}
              supportText={errors.bio}
            />
            <Input
              name="email"
              value={formData.email}
              label="Email"
              readOnly
              className="cursor-default bg-gray-100"
            />
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              label="Số điện thoại"
              status={errors.phone ? "error" : "default"}
              supportText={errors.phone}
            />

            <div className="flex justify-center mt-4 gap-4">
              <Button
                variant="outline-primary"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    avatarUrl: originalAvatar,
                    avatarFile: null
                  }));
                  setErrors({
                    firstName: '',
                    lastName: '',
                    bio: '',
                    phone: '',
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                  setView("view");
                }}
                className="flex items-center gap-2 rounded-xl"
              >
                Hủy
              </Button>
              <Button variant="primary" onClick={handleSaveProfile} className="flex items-center gap-2 rounded-xl">
                Lưu
              </Button>
            </div>
          </div>
        )}

        {view === "password" && (
          <div className="space-y-3">
            {/** Mật khẩu hiện tại */}
            <div className="relative">
              <Input
                type={showPassword.currentPassword ? "text" : "password"}
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                label="Mật khẩu hiện tại"
                status={errors.currentPassword ? "error" : "default"}
                supportText={errors.currentPassword}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() =>
                  setShowPassword(prev => ({
                    ...prev,
                    currentPassword: !prev.currentPassword
                  }))
                }
              >
                {showPassword.currentPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {/** Mật khẩu mới */}
            <div className="relative">
              <Input
                type={showPassword.newPassword ? "text" : "password"}
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                label="Mật khẩu mới"
                status={errors.newPassword ? "error" : "default"}
                supportText={errors.newPassword}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() =>
                  setShowPassword(prev => ({
                    ...prev,
                    newPassword: !prev.newPassword
                  }))
                }
              >
                {showPassword.newPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {/** Xác nhận mật khẩu mới */}
            <div className="relative">
              <Input
                type={showPassword.confirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                label="Xác nhận mật khẩu mới"
                status={errors.confirmPassword ? "error" : "default"}
                supportText={errors.confirmPassword}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() =>
                  setShowPassword(prev => ({
                    ...prev,
                    confirmPassword: !prev.confirmPassword
                  }))
                }
              >
                {showPassword.confirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            
            <div className="flex justify-center mt-4 gap-4">
              <Button variant="outline-primary" onClick={() => setView("view")} className="flex items-center gap-2 rounded-xl">
                Hủy
              </Button>
              <Button variant="primary" onClick={handleChangePassword} className="flex items-center gap-2 rounded-xl">
                Lưu
              </Button>
            </div>
          </div>
        )}        
      </div>
    </div>
  );
}
