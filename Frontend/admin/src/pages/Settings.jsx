import React, { useState, useEffect } from 'react';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Alert from '../components/Common/Alert';
import Modal from '../components/Common/Modal';
import { SettingsService } from '../services';

const Settings = () => {
  // State for general settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    supportPhone: '',
    address: '',
    facebookUrl: '',
    youtubeUrl: '',
    instagramUrl: ''
  });

  // State for email settings
  const [emailSettings, setEmailSettings] = useState({
    smtpServer: '',
    smtpPort: '',
    smtpUsername: '',
    smtpPassword: '',
    senderName: '',
    senderEmail: ''
  });

  // State for payment settings
  const [paymentSettings, setPaymentSettings] = useState({
    currency: 'VND',
    paymentMethods: [],
    bankName: '',
    bankAccount: '',
    bankAccountName: '',
    momoPhone: ''
  });

  // State for system settings
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    debugMode: false,
    cacheTimeout: 3600,
    defaultPagination: 10,
    allowRegistration: true,
    requireEmailVerification: true
  });

  // State for alerts
  const [alert, setAlert] = useState({
    show: false,
    type: '',
    message: ''
  });

  // State for confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  
  // State for loading
  const [isLoading, setIsLoading] = useState(false);

  // Fetch settings from API
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      // Fetch all settings in parallel
      const [generalData, emailData, paymentData, systemData] = await Promise.all([
        SettingsService.getGeneralSettings(),
        SettingsService.getEmailSettings(),
        SettingsService.getPaymentSettings(),
        SettingsService.getSystemSettings()
      ]);
      
      setGeneralSettings(generalData.settings);
      setEmailSettings(emailData.settings);
      setPaymentSettings(paymentData.settings);
      setSystemSettings(systemData.settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Không thể tải cài đặt. Vui lòng thử lại sau.'
      });
      
      // Set default values if API fails
      setGeneralSettings({
        siteName: 'English Fullbright',
        siteDescription: 'Nền tảng học tiếng Anh trực tuyến hàng đầu',
        contactEmail: 'contact@englishfullbright.com',
        supportPhone: '0123456789',
        address: 'Số 123, Đường ABC, Quận XYZ, TP. Hồ Chí Minh',
        facebookUrl: 'https://facebook.com/englishfullbright',
        youtubeUrl: 'https://youtube.com/englishfullbright',
        instagramUrl: 'https://instagram.com/englishfullbright'
      });
      
      setEmailSettings({
        smtpServer: 'smtp.example.com',
        smtpPort: '587',
        smtpUsername: 'noreply@englishfullbright.com',
        smtpPassword: '********',
        senderName: 'English Fullbright',
        senderEmail: 'noreply@englishfullbright.com'
      });
      
      setPaymentSettings({
        currency: 'VND',
        paymentMethods: ['momo', 'vnpay', 'bank_transfer'],
        bankName: 'Vietcombank',
        bankAccount: '1234567890',
        bankAccountName: 'CÔNG TY TNHH ENGLISH FULLBRIGHT',
        momoPhone: '0987654321'
      });
      
      setSystemSettings({
        maintenanceMode: false,
        debugMode: false,
        cacheTimeout: 3600,
        defaultPagination: 10,
        allowRegistration: true,
        requireEmailVerification: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle general settings change
  const handleGeneralSettingsChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: value
    });
  };

  // Handle email settings change
  const handleEmailSettingsChange = (e) => {
    const { name, value } = e.target;
    setEmailSettings({
      ...emailSettings,
      [name]: value
    });
  };

  // Handle payment settings change
  const handlePaymentSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'paymentMethods') {
      const methods = [...paymentSettings.paymentMethods];
      if (checked) {
        methods.push(value);
      } else {
        const index = methods.indexOf(value);
        if (index > -1) {
          methods.splice(index, 1);
        }
      }
      
      setPaymentSettings({
        ...paymentSettings,
        paymentMethods: methods
      });
    } else {
      setPaymentSettings({
        ...paymentSettings,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Handle system settings change
  const handleSystemSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSystemSettings({
      ...systemSettings,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseInt(value) : value
    });
  };

  // Handle save settings
  const handleSaveSettings = (settingType) => {
    setConfirmAction(() => () => saveSettings(settingType));
    setIsConfirmModalOpen(true);
  };

  // Save settings
  const saveSettings = async (settingType) => {
    setIsLoading(true);
    try {
      let response;
      
      switch (settingType) {
        case 'general':
          response = await SettingsService.updateGeneralSettings(generalSettings);
          break;
        case 'email':
          response = await SettingsService.updateEmailSettings(emailSettings);
          break;
        case 'payment':
          response = await SettingsService.updatePaymentSettings(paymentSettings);
          break;
        case 'system':
          response = await SettingsService.updateSystemSettings(systemSettings);
          break;
        default:
          throw new Error('Invalid setting type');
      }
      
      setAlert({
        show: true,
        type: 'success',
        message: `Cài đặt ${getSettingTypeName(settingType)} đã được lưu thành công!`
      });
    } catch (error) {
      console.error(`Error saving ${settingType} settings:`, error);
      setAlert({
        show: true,
        type: 'error',
        message: `Không thể lưu cài đặt ${getSettingTypeName(settingType)}. Vui lòng thử lại sau.`
      });
    } finally {
      setIsLoading(false);
      setIsConfirmModalOpen(false);
    }
  };

  // Test email connection
  const testEmailConnection = async () => {
    setIsLoading(true);
    try {
      await SettingsService.testEmailConnection(emailSettings);
      
      setAlert({
        show: true,
        type: 'success',
        message: 'Kết nối email thành công!'
      });
    } catch (error) {
      console.error('Error testing email connection:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Không thể kết nối đến máy chủ email. Vui lòng kiểm tra lại cài đặt.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cache
  const clearCache = async () => {
    setIsLoading(true);
    try {
      await SettingsService.clearCache();
      
      setAlert({
        show: true,
        type: 'success',
        message: 'Đã xóa cache thành công!'
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Không thể xóa cache. Vui lòng thử lại sau.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get setting type name
  const getSettingTypeName = (type) => {
    switch (type) {
      case 'general':
        return 'chung';
      case 'email':
        return 'email';
      case 'payment':
        return 'thanh toán';
      case 'system':
        return 'hệ thống';
      default:
        return type;
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
        <h1 className="text-2xl font-bold text-gray-800">Cài đặt hệ thống</h1>
        <p className="text-gray-600">
          Quản lý các cài đặt và cấu hình cho hệ thống
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        {/* General Settings */}
        <Card
          title="Cài đặt chung"
          subtitle="Thông tin cơ bản về trang web"
          headerAction={
            <Button
              variant="primary"
              onClick={() => handleSaveSettings('general')}
            >
              Lưu thay đổi
            </Button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên trang web</label>
              <input
                type="text"
                name="siteName"
                value={generalSettings.siteName}
                onChange={handleGeneralSettingsChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email liên hệ</label>
              <input
                type="email"
                name="contactEmail"
                value={generalSettings.contactEmail}
                onChange={handleGeneralSettingsChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Mô tả trang web</label>
              <textarea
                name="siteDescription"
                value={generalSettings.siteDescription}
                onChange={handleGeneralSettingsChange}
                rows="2"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Số điện thoại hỗ trợ</label>
              <input
                type="text"
                name="supportPhone"
                value={generalSettings.supportPhone}
                onChange={handleGeneralSettingsChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
              <textarea
                name="address"
                value={generalSettings.address}
                onChange={handleGeneralSettingsChange}
                rows="2"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Facebook URL</label>
              <input
                type="url"
                name="facebookUrl"
                value={generalSettings.facebookUrl}
                onChange={handleGeneralSettingsChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Youtube URL</label>
              <input
                type="url"
                name="youtubeUrl"
                value={generalSettings.youtubeUrl}
                onChange={handleGeneralSettingsChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Instagram URL</label>
              <input
                type="url"
                name="instagramUrl"
                value={generalSettings.instagramUrl}
                onChange={handleGeneralSettingsChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </Card>
        
        {/* Email Settings */}
        <Card
          title="Cài đặt Email"
          subtitle="Cấu hình gửi email từ hệ thống"
          headerAction={
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                onClick={testEmailConnection}
              >
                Kiểm tra kết nối
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSaveSettings('email')}
              >
                Lưu thay đổi
              </Button>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">SMTP Server</label>
              <input
                type="text"
                name="smtpServer"
                value={emailSettings.smtpServer}
                onChange={handleEmailSettingsChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
              <input
                type="text"
                name="smtpPort"
                value={emailSettings.smtpPort}
                onChange={handleEmailSettingsChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">SMTP Username</label>
              <input
                type="text"
                name="smtpUsername"
                value={emailSettings.smtpUsername}
                onChange={handleEmailSettingsChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">SMTP Password</label>
              <input
                type="password"
                name="smtpPassword"
                value={emailSettings.smtpPassword}
                onChange={handleEmailSettingsChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên người gửi</label>
              <input
                type="text"
                name="senderName"
                value={emailSettings.senderName}
                onChange={handleEmailSettingsChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email người gửi</label>
              <input
                type="email"
                name="senderEmail"
                value={emailSettings.senderEmail}
                onChange={handleEmailSettingsChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </Card>
        
        {/* Payment Settings */}
        <Card
          title="Cài đặt thanh toán"
          subtitle="Cấu hình phương thức thanh toán"
          headerAction={
            <Button
              variant="primary"
              onClick={() => handleSaveSettings('payment')}
            >
              Lưu thay đổi
            </Button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Đơn vị tiền tệ</label>
              <select
                name="currency"
                value={paymentSettings.currency}
                onChange={handlePaymentSettingsChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="VND">VND - Việt Nam Đồng</option>
                <option value="USD">USD - US Dollar</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức thanh toán</label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="paymentMethods"
                    value="momo"
                    checked={paymentSettings.paymentMethods.includes('momo')}
                    onChange={handlePaymentSettingsChange}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    MoMo
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="paymentMethods"
                    value="vnpay"
                    checked={paymentSettings.paymentMethods.includes('vnpay')}
                    onChange={handlePaymentSettingsChange}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    VNPay
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="paymentMethods"
                    value="bank_transfer"
                    checked={paymentSettings.paymentMethods.includes('bank_transfer')}
                    onChange={handlePaymentSettingsChange}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Chuyển khoản ngân hàng
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên ngân hàng</label>
              <input
                type="text"
                name="bankName"
                value={paymentSettings.bankName}
                onChange={handlePaymentSettingsChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Số tài khoản</label>
              <input
                type="text"
                name="bankAccount"
                value={paymentSettings.bankAccount}
                onChange={handlePaymentSettingsChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên chủ tài khoản</label>
              <input
                type="text"
                name="bankAccountName"
                value={paymentSettings.bankAccountName}
                onChange={handlePaymentSettingsChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Số điện thoại MoMo</label>
              <input
                type="text"
                name="momoPhone"
                value={paymentSettings.momoPhone}
                onChange={handlePaymentSettingsChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </Card>
        
        {/* System Settings */}
        <Card
          title="Cài đặt hệ thống"
          subtitle="Cấu hình chung cho hệ thống"
          headerAction={
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                onClick={clearCache}
              >
                Xóa cache
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSaveSettings('system')}
              >
                Lưu thay đổi
              </Button>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={systemSettings.maintenanceMode}
                onChange={handleSystemSettingsChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Chế độ bảo trì
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="debugMode"
                checked={systemSettings.debugMode}
                onChange={handleSystemSettingsChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Chế độ debug
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Thời gian cache (giây)</label>
              <input
                type="number"
                name="cacheTimeout"
                value={systemSettings.cacheTimeout}
                onChange={handleSystemSettingsChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Số mục mỗi trang</label>
              <input
                type="number"
                name="defaultPagination"
                value={systemSettings.defaultPagination}
                onChange={handleSystemSettingsChange}
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="allowRegistration"
                checked={systemSettings.allowRegistration}
                onChange={handleSystemSettingsChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Cho phép đăng ký tài khoản mới
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="requireEmailVerification"
                checked={systemSettings.requireEmailVerification}
                onChange={handleSystemSettingsChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Yêu cầu xác thực email
              </label>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Xác nhận thay đổi"
        size="sm"
      >
        <div className="p-4">
          <p className="mb-4">Bạn có chắc chắn muốn lưu các thay đổi này?</p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={confirmAction}
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings; 