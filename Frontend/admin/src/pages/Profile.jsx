import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Alert from '../components/Common/Alert';
import Modal from '../components/Common/Modal';
import { AuthService } from '../services';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  // State for profile data
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    fullName: '',
    phone: '',
    avatar: '',
    bio: '',
    role: ''
  });
  
  // State for password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // State for alerts
  const [alert, setAlert] = useState({
    show: false,
    type: '',
    message: ''
  });
  
  // State for avatar
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  
  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  
  // State for password modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  // State for loading
  const [isLoading, setIsLoading] = useState(false);
  
  // Load user data
  useEffect(() => {
    fetchUserProfile();
  }, [user]);
  
  const fetchUserProfile = async () => {
    if (user) {
      try {
        setIsLoading(true);
        const response = await AuthService.getProfile();
        const userData = response.user;
        
        setProfileData({
          username: userData.username || '',
          email: userData.email || '',
          fullName: userData.fullName || '',
          phone: userData.phone || '',
          avatar: userData.avatar || 'https://via.placeholder.com/150',
          bio: userData.bio || '',
          role: userData.role || 'user'
        });
        
        setAvatarPreview(userData.avatar || 'https://via.placeholder.com/150');
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setAlert({
          show: true,
          type: 'error',
          message: 'Không thể tải thông tin người dùng. Vui lòng thử lại sau.'
        });
        
        // Fallback to user data from auth context
        setProfileData({
          username: user.username || '',
          email: user.email || '',
          fullName: user.fullName || '',
          phone: user.phone || '',
          avatar: user.avatar || 'https://via.placeholder.com/150',
          bio: user.bio || '',
          role: user.role || 'user'
        });
        
        setAvatarPreview(user.avatar || 'https://via.placeholder.com/150');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Handle profile data change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  // Handle password data change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };
  
  // Handle avatar change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    
    // If canceling edit, reset to original data
    if (isEditMode) {
      fetchUserProfile();
    }
  };
  
  // Save profile changes
  const saveProfileChanges = async () => {
    try {
      setIsLoading(true);
      
      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        if (key !== 'avatar') {
          formData.append(key, profileData[key]);
        }
      });
      
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      
      const response = await AuthService.updateProfile(formData);
      
      // Update user in auth context
      updateProfile(response.user);
      
      setAlert({
        show: true,
        type: 'success',
        message: 'Cập nhật thông tin thành công!'
      });
      
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Không thể cập nhật thông tin. Vui lòng thử lại sau.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Change password
  const changePassword = async () => {
    // Validate password
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Mật khẩu mới và xác nhận mật khẩu không khớp.'
      });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự.'
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      await AuthService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      setAlert({
        show: true,
        type: 'success',
        message: 'Đổi mật khẩu thành công!'
      });
      
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setIsPasswordModalOpen(false);
    } catch (error) {
      console.error('Error changing password:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại sau.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format role for display
  const formatRole = (role) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'teacher':
        return 'Giáo viên';
      case 'staff':
        return 'Nhân viên';
      default:
        return role;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {alert.show && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ ...alert, show: false })}
          autoClose={true}
        />
      )}
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h1>
        <p className="text-gray-600">
          Xem và quản lý thông tin cá nhân của bạn
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <Card>
            <div className="flex flex-col items-center p-4">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-gray-200">
                <img 
                  src={avatarPreview} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h2 className="text-xl font-bold">{profileData.fullName}</h2>
              <p className="text-gray-600">{formatRole(profileData.role)}</p>
              
              {isEditMode && (
                <div className="mt-4 w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thay đổi ảnh đại diện
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                  />
                </div>
              )}
              
              <div className="mt-6 w-full">
                <Button
                  variant={isEditMode ? "secondary" : "primary"}
                  onClick={toggleEditMode}
                  className="w-full"
                >
                  {isEditMode ? 'Hủy chỉnh sửa' : 'Chỉnh sửa thông tin'}
                </Button>
                
                {!isEditMode && (
                  <Button
                    variant="outline"
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="w-full mt-2"
                  >
                    Đổi mật khẩu
                  </Button>
                )}
                
                {isEditMode && (
                  <Button
                    variant="primary"
                    onClick={saveProfileChanges}
                    className="w-full mt-2"
                  >
                    Lưu thay đổi
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
        
        {/* Profile Details */}
        <div className="md:col-span-2">
          <Card title="Thông tin chi tiết">
            <div className="p-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
                  <input
                    type="text"
                    name="username"
                    value={profileData.username}
                    onChange={handleProfileChange}
                    disabled={!isEditMode || true} // Username typically can't be changed
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    disabled={!isEditMode}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                  <input
                    type="text"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleProfileChange}
                    disabled={!isEditMode}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                  <input
                    type="text"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    disabled={!isEditMode}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Giới thiệu</label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    disabled={!isEditMode}
                    rows="4"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">Thông tin tài khoản</h3>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Vai trò</p>
                    <p className="font-medium">{formatRole(profileData.role)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <p className="font-medium">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Đang hoạt động
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Password Change Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Đổi mật khẩu"
        size="md"
      >
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsPasswordModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={changePassword}
            >
              Đổi mật khẩu
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile; 