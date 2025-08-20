import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: 'fas fa-tachometer-alt', path: '/dashboard' },
    { id: 'users', label: 'إدارة المستخدمين', icon: 'fas fa-users', path: '/users' },
    { id: 'properties', label: 'إدارة العقارات', icon: 'fas fa-home', path: '/properties' },
    { id: 'ads', label: 'إدارة الإعلانات', icon: 'fas fa-bullhorn', path: '/ads' },
    { id: 'subscriptions', label: 'إدارة الاشتراكات', icon: 'fas fa-crown', path: '/subscriptions' }
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="w-64 bg-white shadow-sm h-screen sticky top-0 border-l border-gray-200">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map(item => (
            <li key={item.id}>
              <button 
                onClick={() => navigate(item.path)}
                className={`w-full text-right px-4 py-3 rounded-lg transition duration-300 flex items-center hover-scale ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                    : 'hover:bg-blue-50 hover:text-blue-600 text-gray-700'
                }`}
              >
                <i className={`${item.icon} ml-3`}></i>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg text-center">
          <i className="fas fa-crown text-2xl mb-2"></i>
          <p className="text-sm font-medium">الإصدار المتقدم</p>
          <p className="text-xs opacity-90">جميع الميزات متاحة</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;