import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const SubscriptionEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    user_id: '',
    plan_id: '',
    start_date: '',
    end_date: '',
    price: '',
    status: 'active',
    auto_renew: false,
    payment_method: 'credit_card',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [useMockData, setUseMockData] = useState(false);

  // بيانات وهمية للمستخدمين
  const mockUsers = [
    { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com' },
    { id: 2, name: 'فاطمة علي', email: 'fatima@example.com' },
    { id: 3, name: 'سارة أحمد', email: 'sara@example.com' }
  ];

  // بيانات وهمية للخطط
  const mockPlans = [
    { id: 1, name: 'المجانية', price: 0, type: 'free', duration: 'شهري', features: ['3 إعلانات كحد أقصى', 'وصول إعلاني عادي', 'خدمة دعم أساسية'] },
    { id: 2, name: 'المميزة', price: 4.99, type: 'premium', duration: 'شهري', features: ['النشر حتى 15 إعلان', 'وصول إعلاني مميز', 'دعم مميز على مدار الساعة'] },
    { id: 3, name: 'المحترفة', price: 9.99, type: 'premium', duration: 'شهري', features: ['عدد غير محدود من الإعلانات', 'أولوية في النتائج', 'دعم فني متقدم'] }
  ];

  // بيانات وهمية للاشتراك
  const mockSubscription = {
    id: 1,
    user_id: '1',
    plan_id: '2',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    price: '4.99',
    status: 'active',
    auto_renew: true,
    payment_method: 'credit_card',
    notes: 'اشتراك مميز للعميل'
  };

  // جلب المستخدمين من API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://116.203.254.150:8001/api/users', {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + localStorage.getItem('auth_token'),
          },
        });
        
        if (response.data && response.data.data) {
          setUsers(response.data.data);
          setUseMockData(false);
        } else {
          throw new Error('لا توجد بيانات');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setUsers(mockUsers);
        setUseMockData(true);
      }
    };

    fetchUsers();
  }, []);

  // جلب الخطط من API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
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
        setPlans(mockPlans);
        setUseMockData(true);
      }
    };

    fetchPlans();
  }, []);

  // جلب بيانات الاشتراك في حالة التعديل
  useEffect(() => {
    if (isEditing) {
      const fetchSubscription = async () => {
        try {
          const response = await axios.get(`http://116.203.254.150:8001/api/subscriptions/${id}`, {
            headers: {
              Accept: "application/json",
              Authorization: "Bearer " + localStorage.getItem('auth_token'),
            },
          });
          
          if (response.data && response.data.data) {
            setFormData(response.data.data);
            setUseMockData(false);
          } else {
            throw new Error('لا توجد بيانات');
          }
        } catch (err) {
          console.error('Error fetching subscription:', err);
          setFormData(mockSubscription);
          setUseMockData(true);
        }
      };

      fetchSubscription();
    }
  }, [id, isEditing]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.user_id) {
      newErrors.user_id = 'المستخدم مطلوب';
    }

    if (!formData.plan_id) {
      newErrors.plan_id = 'الخطة مطلوبة';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'تاريخ البداية مطلوب';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'تاريخ الانتهاء مطلوب';
    } else if (formData.start_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية';
    }

    if (!formData.price) {
      newErrors.price = 'السعر مطلوب';
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = 'السعر يجب أن يكون رقم صحيح';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (useMockData) {
        // معالجة وهمية للحفظ
        setTimeout(() => {
          console.log('Saving subscription (mock):', formData);
          setIsLoading(false);
          alert('تم حفظ الاشتراك بنجاح (بيانات تجريبية)');
          navigate('/subscriptions');
        }, 1000);
        return;
      }

      if (isEditing) {
        // تحديث الاشتراك الموجود
        const response = await axios.put(`http://116.203.254.150:8001/api/subscriptions/${id}`, formData, {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + localStorage.getItem('auth_token'),
          },
        });
        
        if (response.data && response.data.success) {
          alert('تم تحديث الاشتراك بنجاح');
          navigate('/subscriptions');
        }
      } else {
        // إنشاء اشتراك جديد
        const response = await axios.post('http://116.203.254.150:8001/api/subscriptions', formData, {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + localStorage.getItem('auth_token'),
          },
        });
        
        if (response.data && response.data.success) {
          alert('تم إنشاء الاشتراك بنجاح');
          navigate('/subscriptions');
        }
      }
    } catch (err) {
      console.error('Error saving subscription:', err);
      alert('فشل في حفظ الاشتراك');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePlanChange = (e) => {
    const selectedPlanId = e.target.value;
    const selectedPlan = plans.find(plan => plan.id == selectedPlanId);
    
    if (selectedPlan) {
      setFormData(prev => ({
        ...prev,
        plan_id: selectedPlanId,
        price: selectedPlan.price || ''
      }));
    }
  };

  // الحصول على ميزات الخطة المحددة
  const getSelectedPlanFeatures = () => {
    const selectedPlan = plans.find(plan => plan.id == formData.plan_id);
    return selectedPlan ? selectedPlan.features : [];
  };

  return (
    <div className="p-6 fade-in">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => navigate('/subscriptions')}
            className="text-gray-600 hover:text-gray-800 ml-4"
          >
            <i className="fas fa-arrow-right text-xl"></i>
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'تعديل الاشتراك' : 'إضافة اشتراك جديد'}
          </h2>
        </div>
        <p className="text-gray-600">
          {isEditing ? 'تعديل بيانات الاشتراك' : 'إضافة اشتراك جديد للمستخدم'}
        </p>
        
        {useMockData && (
          <div className="bg-yellow-50 p-3 rounded-lg text-yellow-700 mt-4 border border-yellow-200">
            <i className="fas fa-exclamation-triangle ml-2"></i>
            يتم استخدام بيانات تجريبية لعرض الصفحة
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">المعلومات الأساسية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المستخدم *
                </label>
                <select
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                    errors.user_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">اختر المستخدم</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} - {user.email}
                    </option>
                  ))}
                </select>
                {errors.user_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.user_id}</p>
                )}
              </div>

              {/* Plan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الخطة *
                </label>
                <select
                  name="plan_id"
                  value={formData.plan_id}
                  onChange={handlePlanChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                    errors.plan_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">اختر الخطة</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {plan.price} ريال ({plan.duration})
                    </option>
                  ))}
                </select>
                {errors.plan_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.plan_id}</p>
                )}
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ البداية *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                    errors.start_date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.start_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
                )}
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ الانتهاء *
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                    errors.end_date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.end_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السعر (ريال) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                    errors.price ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="أدخل السعر"
                  step="0.01"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  طريقة الدفع
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
                >
                  <option value="credit_card">بطاقة ائتمان</option>
                  <option value="bank_transfer">تحويل بنكي</option>
                  <option value="cash">نقدي</option>
                </select>
              </div>
            </div>
          </div>

          {/* Features */}
          {getSelectedPlanFeatures().length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">مميزات الخطة</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="space-y-2">
                  {getSelectedPlanFeatures().map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <i className="fas fa-check text-green-600 ml-2"></i>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">الإعدادات</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحالة
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
                >
                  <option value="active">نشط</option>
                  <option value="expired">منتهي</option>
                  <option value="cancelled">ملغي</option>
                  <option value="pending">قيد الانتظار</option>
                </select>
              </div>

              {/* Auto Renew */}
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="auto_renew"
                    checked={formData.auto_renew}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 ml-2"
                  />
                  <span className="text-sm font-medium text-gray-700">التجديد التلقائي</span>
                </label>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">ملاحظات</h3>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
              placeholder="أدخل أي ملاحظات إضافية..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 space-x-reverse pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/subscriptions')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50 flex items-center"
            >
              {isLoading && <i className="fas fa-spinner fa-spin ml-2"></i>}
              {isEditing ? 'تحديث الاشتراك' : 'إضافة الاشتراك'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionEdit;