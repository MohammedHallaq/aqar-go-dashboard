import React, { useEffect, useContext, useState } from 'react';
import { User } from "../Contexts/Context";
import { URL } from '../utils/constants';
import axios from 'axios';

const Header = ({ onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationType, setNotificationType] = useState('all');
  const { logout, auth } = useContext(User);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const determineNotificationType = (notification) => {
    const title = notification.title?.toLowerCase() || '';
    const body = notification.body?.toLowerCase() || '';
    
    if (title.includes('favorite') || body.includes('favorite')) {
      return 'favorite';
    } else if (title.includes('ad') || body.includes('ad') || title.includes('عقار')) {
      return 'property';
    } else if (title.includes('user') || body.includes('user') || title.includes('مستخدم')) {
      return 'user';
    } else if (title.includes('subscription') || body.includes('subscription') || title.includes('اشتراك')) {
      return 'subscription';
    } else if (title.includes('message') || body.includes('message') || title.includes('رسالة')) {
      return 'message';
    }
    return 'general';
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'property': return 'fas fa-home text-blue-500';
      case 'user': return 'fas fa-user text-green-500';
      case 'subscription': return 'fas fa-crown text-yellow-500';
      case 'favorite': return 'fas fa-heart text-red-500';
      case 'message': return 'fas fa-comment text-purple-500';
      default: return 'fas fa-bell text-gray-500';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'منذ وقت غير محدد';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'الآن';
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
    if (diffInSeconds < 2592000) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
    
    return date.toLocaleDateString('ar-SA');
  };

  // جلب عدد الإشعارات غير المقروءة - تم التصحيح هنا
  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(URL + 'api/fcm/notifications/unread-count', {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + auth.token,
        },
      });
      
      if (response.data && response.data.status === 1) {
        // التصحيح: استخراج القيمة الرقمية من الكائن
        const count = response.data.data?.unread_count || 
                     response.data.data?.count || 
                     response.data.unread_count || 
                     0;
        setUnreadCount(count);
      }
    } catch (error) {
      console.log('Error fetching unread count:', error);
      setUnreadCount(0); // تعيين قيمة افتراضية في حالة الخطأ
    }
  };

  // جلب الإشعارات بناءً على النوع
  const fetchNotifications = async (type = 'all') => {
    if (!auth.token) return;
    
    setLoadingNotifications(true);
    try {
      let endpoint = 'api/fcm/notifications';
      if (type === 'read') {
        endpoint = 'api/fcm/notifications/read';
      } else if (type === 'unread') {
        endpoint = 'api/fcm/notifications/unread';
      }

      const response = await axios.get(URL + endpoint, {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + auth.token,
        },
      });

      if (response.data && response.data.status === 1) {
        // التصحيح: استخراج البيانات بشكل صحيح
        const notificationsData = response.data.data?.data || 
                                 response.data.data || 
                                 [];
        setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      }
    } catch (error) {
      console.log('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (auth.token) {
      fetchUnreadCount();
      
      // جلب الإشعارات تلقائياً كل 30 ثانية
      const interval = setInterval(fetchUnreadCount, 9000000);
      return () => clearInterval(interval);
    }
  }, [auth.token]);

  useEffect(() => {
    if (showNotifications && auth.token) {
      fetchNotifications(notificationType);
    }
  }, [showNotifications, notificationType, auth.token]);

  const handleNotificationClick = () => {
    const newShowState = !showNotifications;
    setShowNotifications(newShowState);
    
    if (newShowState && auth.token) {
      fetchNotifications(notificationType);
      fetchUnreadCount(); // تحديث العدد عند فتح الإشعارات
    }
  };

  const markAsRead = async (notificationId) => {
    if (!auth.token) return;
    
    try {
      await axios.post(URL + `api/fcm/notifications/${notificationId}/read`, {}, {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + auth.token,
        },
      });
      
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.log('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!auth.token || unreadCount === 0) return;
    
    try {
     
      const unreadNotifications = notifications.filter(notif => !notif.is_read);
      
      for (const notif of unreadNotifications) {
        try {
          await axios.post(URL + `api/fcm/notifications/${notif.id}/read`, {}, {
            headers: {
              Accept: "application/json",
              Authorization: "Bearer " + auth.token,
            },
          });
        } catch (error) {
          console.log(`Error marking notification ${notif.id} as read:`, error);
        }
      }
      
      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
      setUnreadCount(0);
      
    } catch (error) {
      console.log('Error marking all as read:', error);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (notificationType === 'read') return notif.is_read;
    if (notificationType === 'unread') return !notif.is_read;
    return true;
  });

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
            <button 
              onClick={handleNotificationClick}
              className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition duration-200"
            >
              <i className="fas fa-bell text-xl"></i>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute left-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">الإشعارات</h3>
                  <div className="flex items-center space-x-2">
                    {loadingNotifications && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    )}
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                        title=" الكل كمقروء"
                      >
                        <i className="fas fa-check-double ml-1"></i>
                        الكل
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex space-x-2">
                    {['all', 'unread', 'read'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setNotificationType(type)}
                        className={`px-3 py-1 text-xs rounded-full ${
                          notificationType === type 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {type === 'all' && 'الكل'}
                        {type === 'unread' && `غير المقروء (${unreadCount})`}
                        {type === 'read' && 'المقروء'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => {
                      const type = determineNotificationType(notification);
                      return (
                        <div 
                          key={notification.id} 
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition duration-200 cursor-pointer ${
                            !notification.is_read ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => !notification.is_read && markAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3 space-x-reverse">
                            <i className={`${getNotificationIcon(type)} text-lg mt-1`}></i>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">
                                {notification.title || 'بدون عنوان'}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.body || 'بدون محتوى'}
                              </p>
                              <div className="flex justify-between items-center mt-2">
                                <p className="text-xs text-gray-500">
                                  {formatTime(notification.created_at || notification.updated_at)}
                                </p>
                                {!notification.is_read && (
                                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                    جديد
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <i className="fas fa-bell-slash text-3xl mb-3"></i>
                      <p>لا توجد إشعارات</p>
                    </div>
                  )}
                </div>
                
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center text-xs text-gray-600">
                    <span>الإجمالي: {notifications.length}</span>
                    <span>غير المقروء: {unreadCount}</span>
                  </div>
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