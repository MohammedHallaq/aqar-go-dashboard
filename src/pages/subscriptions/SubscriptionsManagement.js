import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStatusBadgeClasses } from '../../utils/helpers';
import axios from 'axios';

const SubscriptionsManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('plans');
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [useMockData, setUseMockData] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // بيانات وهمية للخطط
  const mockPlans = [
    {
      id: 1,
      name: "المجانية",
      price: 0,
      type: "free",
      duration: "شهرياً (مجانية للابد)",
      features: ["3 إعلانات كحد أقصى", "وصول إعلاني عادي", "خدمة دعم أساسية"],
      status: "active"
    },
    {
      id: 2,
      name: "المميزة",
      price: 4.99,
      type: "premium",
      duration: "شهرياً",
      features: ["النشر حتى 15 إعلان", "وصول إعلاني مميز", "دعم مميز على مدار الساعة", "والمزيد..."],
      status: "active"
    },
    {
      id: 3,
      name: "المحترفة",
      price: 9.99,
      type: "premium",
      duration: "شهرياً",
      features: ["عدد غير محدود من الإعلانات", "أولوية في النتائج", "دعم فني متقدم", "تقارير أداء"],
      status: "active"
    }
  ];

  // بيانات وهمية للاشتراكات
  const mockSubscriptions = [
    { 
      id: 1, 
      user: { name: 'أحمد محمد' }, 
      plan: { name: 'المميزة', price: 4.99, type: 'premium' }, 
      start_date: '2024-01-01', 
      end_date: '2024-12-31', 
      status: 'active'
    },
    { 
      id: 2, 
      user: { name: 'فاطمة علي' }, 
      plan: { name: 'المجانية', price: 0, type: 'free' }, 
      start_date: '2024-01-15', 
      end_date: '2024-07-15', 
      status: 'active'
    },
    { 
      id: 3, 
      user: { name: 'سارة أحمد' }, 
      plan: { name: 'المحترفة', price: 9.99, type: 'premium' }, 
      start_date: '2023-06-01', 
      end_date: '2023-12-01', 
      status: 'expired'
    }
  ];

  // جلب خطط الاشتراك من API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get('http://116.203.254.150:8001/api/plans', {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + localStorage.getItem('auth_token'),
          },
        });
        
        if (response.data && response.data.data) {
          setPlans(response.data.data);
          setUseMockData(false);
        } else {
          throw new Error('لا توجد بيانات');
        }
      } catch (err) {
        console.error('Error fetching plans:', err);
        setError('فشل في تحميل خطط الاشتراك. يتم عرض بيانات تجريبية');
        setPlans(mockPlans);
        setUseMockData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // جلب الاشتراكات من API
  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (activeTab !== 'management') return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get('http://116.203.254.150:8001/api/subscriptions', {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + localStorage.getItem('auth_token'),
          },
        });
        
        if (response.data && response.data.data) {
          setSubscriptions(response.data.data);
          setUseMockData(false);
        } else {
          throw new Error('لا توجد بيانات');
        }
      } catch (err) {
        console.error('Error fetching subscriptions:', err);
        setError('فشل في تحميل الاشتراكات. يتم عرض بيانات تجريبية');
        setSubscriptions(mockSubscriptions);
        setUseMockData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [activeTab]);

  const handleRenewSubscription = async (id) => {
    if (useMockData) {
      // معالجة وهمية للتجديد
      setSubscriptions(subscriptions.map(sub => 
        sub.id === id 
          ? { ...sub, status: 'active', end_date: '2024-12-31' }
          : sub
      ));
      alert('تم تجديد الاشتراك بنجاح (بيانات تجريبية)');
      return;
    }
    
    try {
      const response = await axios.put(`http://116.203.254.150:8001/api/subscriptions/${id}/renew`, {}, {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + localStorage.getItem('auth_token'),
        },
      });
      
      if (response.data && response.data.success) {
        setSubscriptions(subscriptions.map(sub => 
          sub.id === id 
            ? { ...sub, status: 'active', end_date: response.data.new_end_date }
            : sub
        ));
        alert('تم تجديد الاشتراك بنجاح');
      }
    } catch (err) {
      console.error('Error renewing subscription:', err);
      alert('فشل في تجديد الاشتراك');
    }
  };

  const handleCancelSubscription = async (id) => {
    if (window.confirm('هل أنت متأكد من إلغاء هذا الاشتراك؟')) {
      if (useMockData) {
        // معالجة وهمية للإلغاء
        setSubscriptions(subscriptions.map(sub => 
          sub.id === id 
            ? { ...sub, status: 'cancelled' }
            : sub
        ));
        alert('تم إلغاء الاشتراك (بيانات تجريبية)');
        return;
      }
      
      try {
        const response = await axios.put(`http://116.203.254.150:8001/api/subscriptions/${id}/cancel`, {}, {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + localStorage.getItem('auth_token'),
          },
        });
        
        if (response.data && response.data.success) {
          setSubscriptions(subscriptions.map(sub => 
            sub.id === id 
              ? { ...sub, status: 'cancelled' }
              : sub
          ));
          alert('تم إلغاء الاشتراك بنجاح');
        }
      } catch (err) {
        console.error('Error canceling subscription:', err);
        alert('فشل في إلغاء الاشتراك');
      }
    }
  };

  const handleDeleteSubscription = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الاشتراك؟')) {
      if (useMockData) {
        // معالجة وهمية للحذف
        setSubscriptions(subscriptions.filter(sub => sub.id !== id));
        alert('تم حذف الاشتراك (بيانات تجريبية)');
        return;
      }
      
      try {
        const response = await axios.delete(`http://116.203.254.150:8001/api/subscriptions/${id}`, {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + localStorage.getItem('auth_token'),
          },
        });
        
        if (response.data && response.data.success) {
          setSubscriptions(subscriptions.filter(sub => sub.id !== id));
          alert('تم حذف الاشتراك بنجاح');
        }
      } catch (err) {
        console.error('Error deleting subscription:', err);
        alert('فشل في حذف الاشتراك');
      }
    }
  };

  const handleSubscribe = async (planId) => {
    if (useMockData) {
      // معالجة وهمية للاشتراك
      const newSubscription = {
        id: Date.now(),
        user: { name: 'مستخدم جديد' },
        plan: mockPlans.find(p => p.id === planId),
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active'
      };
      
      setSubscriptions([...subscriptions, newSubscription]);
      setActiveTab('management');
      alert('تم الاشتراك في الخطة بنجاح (بيانات تجريبية)');
      return;
    }
    
    try {
      const response = await axios.post(`http://116.203.254.150:8001/api/subscriptions`, {
        plan_id: planId
      }, {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + localStorage.getItem('auth_token'),
        },
      });
      
      if (response.data && response.data.success) {
        alert('تم الاشتراك في الخطة بنجاح!');
        setActiveTab('management');
      }
    } catch (err) {
      console.error('Error subscribing to plan:', err);
      alert('فشل في الاشتراك في الخطة');
    }
  };

  const handleDeletePlan = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الخطة؟ سيؤثر هذا على جميع المشتركين فيها.')) {
      if (useMockData) {
        // معالجة وهمية لحذف الخطة
        setPlans(plans.filter(plan => plan.id !== id));
        alert('تم حذف الخطة (بيانات تجريبية)');
        setDeleteConfirm(null);
        return;
      }
      
      try {
        const response = await axios.delete(`http://116.203.254.150:8001/api/plans/${id}`, {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + localStorage.getItem('auth_token'),
          },
        });
        
        if (response.data && response.data.success) {
          setPlans(plans.filter(plan => plan.id !== id));
          alert('تم حذف الخطة بنجاح');
          setDeleteConfirm(null);
        }
      } catch (err) {
        console.error('Error deleting plan:', err);
        alert('فشل في حذف الخطة');
      }
    }
  };

  const handleTogglePlanStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    if (useMockData) {
      // معالجة وهمية لتغيير حالة الخطة
      setPlans(plans.map(plan => 
        plan.id === id ? { ...plan, status: newStatus } : plan
      ));
      alert(`تم ${newStatus === 'active' ? 'تفعيل' : 'إلغاء تفعيل'} الخطة (بيانات تجريبية)`);
      return;
    }
    
    try {
      const response = await axios.put(`http://116.203.254.150:8001/api/plans/${id}/status`, {
        status: newStatus
      }, {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + localStorage.getItem('auth_token'),
        },
      });
      
      if (response.data && response.data.success) {
        setPlans(plans.map(plan => 
          plan.id === id ? { ...plan, status: newStatus } : plan
        ));
        alert(`تم ${newStatus === 'active' ? 'تفعيل' : 'إلغاء تفعيل'} الخطة بنجاح`);
      }
    } catch (err) {
      console.error('Error toggling plan status:', err);
      alert('فشل في تغيير حالة الخطة');
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.plan?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || sub.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { text: 'نشط', icon: 'fas fa-check-circle' },
      expired: { text: 'منتهي', icon: 'fas fa-times-circle' },
      cancelled: { text: 'ملغي', icon: 'fas fa-ban' },
      pending: { text: 'قيد الانتظار', icon: 'fas fa-clock' },
      inactive: { text: 'غير مفعل', icon: 'fas fa-pause-circle' }
    };
    const config = statusConfig[status] || { text: status, icon: 'fas fa-question-circle' };
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center ${getStatusBadgeClasses(status)}`}>
        <i className={`${config.icon} ml-1`}></i>
        {config.text}
      </span>
    );
  };

  const getPlanIcon = (planType) => {
    const icons = {
      'basic': 'fas fa-star',
      'advanced': 'fas fa-crown',
      'premium': 'fas fa-gem',
      'free': 'fas fa-user'
    };
    return icons[planType] || 'fas fa-star';
  };

  const getPlanColor = (planType) => {
    const colors = {
      'basic': 'text-blue-600',
      'advanced': 'text-purple-600',
      'premium': 'text-yellow-600',
      'free': 'text-gray-600'
    };
    return colors[planType] || 'text-blue-600';
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const renderPlansSection = () => (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">خطط الاشتراك</h2>
        <div className="flex space-x-3 space-x-reverse">
          <button 
            onClick={() => navigate('/plans/new')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300 flex items-center"
          >
            <i className="fas fa-plus ml-2"></i>
            إضافة خطة
          </button>
          <button 
            onClick={() => setActiveTab('management')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center"
          >
            <i className="fas fa-users ml-2"></i>
            إدارة المشتركين
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700 mb-6 border border-yellow-200">
          <i className="fas fa-exclamation-triangle ml-2"></i>
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="mr-3">جاري التحميل...</span>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {plans.map(plan => (
              <div key={plan.id} className={`bg-white rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 
                ${plan.type === 'premium' ? 'border-yellow-400 ring-2 ring-yellow-200' : 'border-gray-200'}
                ${plan.status === 'inactive' ? 'opacity-70' : ''}`}>
                <div className={`p-6 rounded-t-xl text-center ${plan.type === 'premium' ? 'bg-yellow-100' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-start mb-2">
                    {getStatusBadge(plan.status)}
                    <div className="flex space-x-2 space-x-reverse">
                      <button 
                        onClick={() => navigate(`/plans/edit/${plan.id}`)}
                        className="text-blue-600 hover:text-blue-800"
                        title="تعديل"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm(plan.id)}
                        className="text-red-600 hover:text-red-800"
                        title="حذف"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  <i className={`${getPlanIcon(plan.type)} ${getPlanColor(plan.type)} text-4xl mb-4`}></i>
                  <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900">{plan.price} ريال</span>
                    <span className="text-gray-600"> / {plan.duration}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <ul className="space-y-3 mb-4">
                    {plan.features && plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <i className="fas fa-check text-green-500 ml-2"></i>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex space-x-2 space-x-reverse">
                    <button 
                      onClick={() => handleTogglePlanStatus(plan.id, plan.status)}
                      className={`flex-1 py-2 rounded-lg font-semibold transition duration-300 ${
                        plan.status === 'active' 
                          ? 'bg-gray-500 hover:bg-gray-600 text-white' 
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {plan.status === 'active' ? 'إلغاء التفعيل' : 'تفعيل'}
                    </button>
                    <button 
                      onClick={() => handleSubscribe(plan.id)}
                      className={`flex-1 py-2 rounded-lg font-semibold transition duration-300
                        ${plan.type === 'premium' 
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                          : plan.type === 'free'
                          ? 'bg-gray-500 hover:bg-gray-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                      disabled={plan.status === 'inactive'}
                    >
                      اشترك الآن
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* زر إضافة خطة جديدة */}
          <div 
            className="bg-white rounded-xl shadow-lg border border-dashed border-gray-300 p-8 text-center cursor-pointer hover:bg-gray-50 transition duration-300"
            onClick={() => navigate('/plans/new')}
          >
            <i className="fas fa-plus-circle text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-semibold text-gray-700">إضافة خطة جديدة</h3>
            <p className="text-gray-500">انقر هنا لإنشاء خطة اشتراك جديدة</p>
          </div>
        </div>
      )}
      
      {/* تأكيد الحذف */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">تأكيد الحذف</h3>
            <p className="text-gray-600 mb-6">هل أنت متأكد من أنك تريد حذف هذه الخطة؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex justify-end space-x-3 space-x-reverse">
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button 
                onClick={() => handleDeletePlan(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderManagementSection = () => (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">إدارة الاشتراكات</h2>
          <p className="text-gray-600">متابعة وإدارة اشتراكات المستخدمين</p>
        </div>
        <div className="flex space-x-3 space-x-reverse">
          <button 
            onClick={() => navigate('/subscriptions/new')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300 flex items-center"
          >
            <i className="fas fa-plus ml-2"></i>
            إضافة اشتراك
          </button>
          <button 
            onClick={() => setActiveTab('plans')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center"
          >
            <i className="fas fa-crown ml-2"></i>
            عرض الخطط
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700 mb-6 border border-yellow-200">
          <i className="fas fa-exclamation-triangle ml-2"></i>
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">إجمالي الاشتراكات</p>
              <p className="text-2xl font-bold text-blue-800">{subscriptions.length}</p>
            </div>
            <i className="fas fa-crown text-blue-600 text-2xl"></i>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">النشطة</p>
              <p className="text-2xl font-bold text-green-800">
                {subscriptions.filter(s => s.status === 'active').length}
              </p>
            </div>
            <i className="fas fa-check-circle text-green-600 text-2xl"></i>
          </div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">المنتهية</p>
              <p className="text-2xl font-bold text-red-800">
                {subscriptions.filter(s => s.status === 'expired').length}
              </p>
            </div>
            <i className="fas fa-times-circle text-red-600 text-2xl"></i>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-purple-800">
                {subscriptions.reduce((sum, s) => sum + (s.plan?.price || 0), 0).toLocaleString()} ريال
              </p>
            </div>
            <i className="fas fa-dollar-sign text-purple-600 text-2xl"></i>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="البحث في الاشتراكات..." 
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200" 
              />
              <i className="fas fa-search absolute right-3 top-3 text-gray-400"></i>
            </div>
            
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع الاشتراكات</option>
              <option value="active">النشطة</option>
              <option value="expired">المنتهية</option>
              <option value="cancelled">الملغية</option>
              <option value="pending">قيد الانتظار</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المستخدم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الخطة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">السعر</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ البداية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الانتهاء</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الأيام المتبقية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSubscriptions.map(subscription => (
                <tr key={subscription.id} className="hover:bg-gray-50 transition duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center ml-3">
                        <i className="fas fa-user text-blue-600 text-sm"></i>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{subscription.user?.name || 'مستخدم'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <i className={`${getPlanIcon(subscription.plan?.type)} ${getPlanColor(subscription.plan?.type)} ml-2`}></i>
                      <span className="text-sm font-medium text-gray-900">{subscription.plan?.name || 'غير معروف'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {subscription.plan?.price ? subscription.plan.price.toLocaleString() + ' ريال' : 'غير معروف'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subscription.start_date || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subscription.end_date || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subscription.status === 'active' && subscription.end_date ? (
                      <span className={`${getDaysRemaining(subscription.end_date) <= 30 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                        {getDaysRemaining(subscription.end_date)} يوم
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(subscription.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2 space-x-reverse">
                      {subscription.status === 'expired' && (
                        <button 
                          onClick={() => handleRenewSubscription(subscription.id)}
                          className="text-green-600 hover:text-green-900 transition duration-200"
                          title="تجديد"
                        >
                          <i className="fas fa-redo"></i>
                        </button>
                      )}
                      {subscription.status === 'active' && (
                        <button 
                          onClick={() => handleCancelSubscription(subscription.id)}
                          className="text-orange-600 hover:text-orange-900 transition duration-200"
                          title="إلغاء"
                        >
                          <i className="fas fa-ban"></i>
                        </button>
                      )}
                      <button 
                        onClick={() => navigate(`/subscriptions/edit/${subscription.id}`)}
                        className="text-blue-600 hover:text-blue-900 transition duration-200"
                        title="تعديل"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="text-purple-600 hover:text-purple-900 transition duration-200"
                        title="عرض التفاصيل"
                        onClick={() => navigate(`/subscriptions/${subscription.id}`)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        onClick={() => handleDeleteSubscription(subscription.id)}
                        className="text-red-600 hover:text-red-900 transition duration-200"
                        title="حذف"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredSubscriptions.length === 0 && (
          <div className="text-center py-8">
            <i className="fas fa-crown text-gray-400 text-4xl mb-4"></i>
            <p className="text-gray-500">لا توجد اشتراكات مطابقة للبحث</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {activeTab === 'plans' ? renderPlansSection() : renderManagementSection()}
    </div>
  );
};

export default SubscriptionsManagement;