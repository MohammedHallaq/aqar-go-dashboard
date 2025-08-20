import React, { useContext ,useState } from 'react';
import { User } from "../Contexts/Context";
const Header = ({ onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { logout } = useContext(User);
  const notifications = [
    { id: 1, message: 'عقار جديد في انتظار الموافقة', time: 'منذ 5 دقائق', type: 'property' },
    { id: 2, message: 'مستخدم جديد سجل في التطبيق', time: 'منذ 15 دقيقة', type: 'user' },
    { id: 3, message: 'انتهاء اشتراك مستخدم', time: 'منذ ساعة', type: 'subscription' }
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'property': return 'fas fa-home text-blue-500';
      case 'user': return 'fas fa-user text-green-500';
      case 'subscription': return 'fas fa-crown text-yellow-500';
      default: return 'fas fa-bell text-gray-500';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-10 h-10 rounded-full flex items-center justify-center">
            <i className="fas fa-building text-white"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">عقار جو</h1>
        </div>
        
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="relative">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث عن عقار أو مستخدم..." 
              className="w-64 px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200" 
            />
            <i className="fas fa-search absolute right-3 top-3 text-gray-400"></i>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition duration-200"
            >
              <i className="fas fa-bell text-xl"></i>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications.length}
              </span>
            </button>
            
            {showNotifications && (
              <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">الإشعارات</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map(notification => (
                    <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition duration-200">
                      <div className="flex items-start space-x-3 space-x-reverse">
                        <i className={getNotificationIcon(notification.type)}></i>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-200">
                  <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800">
                    عرض جميع الإشعارات
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300 flex items-center"
          >
            <i className="fas fa-sign-out-alt ml-2"></i>
            تسجيل الخروج
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;