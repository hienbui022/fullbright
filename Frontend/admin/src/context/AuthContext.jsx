import { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../services/auth.service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa khi tải trang
    const initAuth = async () => {
      try {
        const currentUser = AuthService.getCurrentUser();
      
        
        if (currentUser) {
          // Xác thực token bằng cách gọi API profile
        
          const profileData = await AuthService.getProfile();
          setUser(profileData.user);
        } else {
          console.log('No user found in localStorage');
        }
      } catch (err) {
        // Nếu token không hợp lệ, đăng xuất
        AuthService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const data = await AuthService.login(email, password);
      setUser(data.user);
      return data;
    } catch (err) {
      console.error('Login error in AuthContext:', err);
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
      throw err;
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const register = async (userData) => {
    try {
      setError(null);
      const data = await AuthService.register(userData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
      throw err;
    }
  };

  const updateProfile = async (userData) => {
    try {
      setError(null);
      const data = await AuthService.updateProfile(userData);
      setUser(prevUser => ({
        ...prevUser,
        ...data.user
      }));
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật thông tin thất bại');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 