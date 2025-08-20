import React from 'react';

const Dashboard = () => {
  const stats = [
    { 
      title: 'إجمالي المستخدمين', 
      value: '1,234', 
      icon: 'fas fa-users', 
      color: 'blue',
      change: '+12%',
      changeType: 'increase'
    },
    { 
      title: 'العقارات المنشورة', 
      value: '856', 
      icon: 'fas fa-home', 
      color: 'green',
      change: '+8%',
      changeType: 'increase'
    },
    { 
      title: 'الإعلانات النشطة', 
      value: '42', 
      icon: 'fas fa-bullhorn', 
      color: 'purple',
      change: '+15%',
      changeType: 'increase'
    },
    { 
      title: 'الاشتراكات النشطة', 
      value: '189', 
      icon: 'fas fa-crown', 
      color: 'yellow',
      change: '-3%',
      changeType: 'decrease'
    }
  ];

  const recentActivities = [
    { id: 1, action: 'تم إضافة عقار جديد', user: 'أحمد محمد', time: 'منذ 5 دقائق' },
    { id: 2, action: 'تم تجديد اشتراك', user: 'فاطمة علي', time: 'منذ 15 دقيقة' },
    { id: 3, action: 'تم الموافقة على إعلان', user: 'سارة أحمد', time: 'منذ 30 دقيقة' },
    { id: 4, action: 'مستخدم جديد انضم', user: 'محمد علي', time: 'منذ ساعة' }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      yellow: 'bg-yellow-100 text-yellow-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="p-6 fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">مرحباً بك في لوحة التحكم</h2>
        <p className="text-gray-600">نظرة عامة على أداء منصة عقار جو</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover-scale">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-full ${getColorClasses(stat.color)}`}>
                <i className={stat.icon}></i>
              </div>
              <div className={`text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <i className="fas fa-clock text-blue-600 ml-2"></i>
              الأنشطة الأخيرة
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{activity.action}</p>
                    <p className="text-xs text-gray-500">بواسطة {activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <i className="fas fa-bolt text-yellow-600 ml-2"></i>
              إجراءات سريعة
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition duration-200">
                <i className="fas fa-plus text-blue-600 text-xl mb-2"></i>
                <p className="text-sm font-medium text-gray-800">إضافة مستخدم</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition duration-200">
                <i className="fas fa-home text-green-600 text-xl mb-2"></i>
                <p className="text-sm font-medium text-gray-800">إضافة عقار</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition duration-200">
                <i className="fas fa-bullhorn text-purple-600 text-xl mb-2"></i>
                <p className="text-sm font-medium text-gray-800">إنشاء إعلان</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition duration-200">
                <i className="fas fa-chart-bar text-yellow-600 text-xl mb-2"></i>
                <p className="text-sm font-medium text-gray-800">عرض التقارير</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;