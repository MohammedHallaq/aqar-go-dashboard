import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { User } from '../../Contexts/Context';

const SubscriptionEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const context = useContext(User);
  const [formData, setFormData] = useState({
    user_id: '',
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    price: '',
    status: 'active',
    auto_renew: false,
    payment_method: 'credit_card',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [emailValidation, setEmailValidation] = useState({ loading: false, valid: false });

  // دالة جلب الخطط مع useCallback
  const fetchPlans = useCallback(async () => {
    try {
      const response = await axios.get('http://116.203.254.150:8001/api/plans', {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + context.auth.token,
        },
      });
      
      if (response.data && response.data.data) {
        setPlans(response.data.data);
      } else {
        throw new Error('لا توجد بيانات للخطط');
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      alert('فشل في تحميل قائمة الخطط: ' + (err.response?.data?.message || err.message));
    }
  }, [context.auth.token]);

  // دالة جلب بيانات الاشتراك مع useCallback
  const fetchSubscription = useCallback(async () => {
    try {
      const response = await axios.get(`http://116.203.254.150:8001/api/subscriptions/${id}`, {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + context.auth.token,
        },
      });
      
      if (response.data && response.data.data) {
        const subscriptionData = response.data.data;
        setFormData({
          user_id: subscriptionData.user_id || subscriptionData.user?.id || '',
          plan_id: subscriptionData.plan_id || subscriptionData.plan?.id || '',
          start_date: subscriptionData.start_date || new Date().toISOString().split('T')[0],
          end_date: subscriptionData.end_date || '',
          price: subscriptionData.price || '',
          status: subscriptionData.status || 'active',
          auto_renew: subscriptionData.auto_renew || false,
          payment_method: subscriptionData.payment_method || 'credit_card',
          notes: subscriptionData.notes || ''
        });
        
        // تعيين البريد الإلكتروني إذا كان موجوداً
        if (subscriptionData.user?.email) {
          setEmail(subscriptionData.user.email);
          setUser(subscriptionData.user);
          setEmailValidation({ loading: false, valid: true });
        }
      } else {
        throw new Error('لا توجد بيانات للاشتراك');
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      alert('فشل في تحميل بيانات الاشتراك: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingData(false);
    }
  }, [id, context.auth.token]);

  // دالة للتحقق من البريد الإلكتروني والحصول على user_id
  const validateEmailAndGetUser = async (email) => {
    if (!email) {
      setEmailValidation({ loading: false, valid: false });
      setUser(null);
      setFormData(prev => ({ ...prev, user_id: '' }));
      return;
    }

    // تحقق من صيغة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: 'صيغة البريد الإلكتروني غير صحيحة' }));
      setEmailValidation({ loading: false, valid: false });
      setUser(null);
      setFormData(prev => ({ ...prev, user_id: '' }));
      return;
    }

    setEmailValidation({ loading: true, valid: false });
    
    try {
      const response = await axios.post('http://116.203.254.150:8001/api/user/getUserByEmail', {email:email},{
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + context.auth.token,
        },
      });

      if (response) {
        const userData = response.data;
        setUser(userData);
        setFormData(prev => ({ ...prev, user_id: userData.id }));
        setEmailValidation({ loading: false, valid: true });
        setErrors(prev => ({ ...prev, email: '' }));
      } else {
        throw new Error('المستخدم غير موجود');
      }
    } catch (err) {
      console.error('Error validating email:', err);
      setEmailValidation({ loading: false, valid: false });
      setUser(null);
      setFormData(prev => ({ ...prev, user_id: '' }));
      
      if (err.response?.status === 404) {
        setErrors(prev => ({ ...prev, email: 'المستخدم غير موجود' }));
      } else {
        setErrors(prev => ({ ...prev, email: 'فشل في التحقق من البريد الإلكتروني' }));
      }
    }
  };

  // جلب البيانات عند تحميل المكون
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      await fetchPlans();
      if (isEditing) {
        await fetchSubscription();
      } else {
        setLoadingData(false);
      }
    };
    
    loadData();
  }, [isEditing, fetchPlans, fetchSubscription]);

  // التحقق من البريد الإلكتروني عند تغييره
  useEffect(() => {
    const timer = setTimeout(() => {
      validateEmailAndGetUser(email);
    }, 800);

    return () => clearTimeout(timer);
  }, [email]);

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!emailValidation.valid) {
      newErrors.email = 'يجب التحقق من صحة البريد الإلكتروني';
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
      newErrors.price = 'السعر يجب أن يكون رقم صحيح موجب';
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
      const submissionData = {
        user_id: formData.user_id,
        plan_id: formData.plan_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        price: parseFloat(formData.price),
        status: formData.status,
        auto_renew: formData.auto_renew,
        payment_method: formData.payment_method,
        notes: formData.notes
      };

      if (isEditing) {
        // تحديث الاشتراك الموجود
        const response = await axios.put(`http://116.203.254.150:8001/api/subscriptions/${id}`, submissionData, {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + context.auth.token,
          },
        });
        
        if (response.data && response.data.success) {
          alert('تم تحديث الاشتراك بنجاح');
          navigate('/subscriptions');
        }
      } else {
        // إنشاء اشتراك جديد
        const response = await axios.post('http://116.203.254.150:8001/api/subscriptions/client', submissionData, {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + context.auth.token,
          },
        });
        
        if (response.data && response.data.success) {
          alert('تم إنشاء الاشتراك بنجاح');
          navigate('/subscriptions');
        }
      }
    } catch (err) {
      console.error('Error saving subscription:', err);
      if (err.response?.data?.data) {
        // عرض أخطاء التحقق من الصحة من الخادم
        const serverErrors = err.response.data.data;
        const formattedErrors = {};
        
        Object.keys(serverErrors).forEach(key => {
          if (Array.isArray(serverErrors[key])) {
            formattedErrors[key] = serverErrors[key][0];
          } else {
            formattedErrors[key] = serverErrors[key];
          }
        });
        
        setErrors(formattedErrors);
      } else {
        alert('فشل في حفظ الاشتراك: ' + (err.response?.data?.message || err.message));
      }
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
      // حساب تاريخ الانتهاء بناءً على مدة الخطة
      const startDate = formData.start_date ? new Date(formData.start_date) : new Date();
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (selectedPlan.duration || 30));
      
      setFormData(prev => ({
        ...prev,
        plan_id: selectedPlanId,
        price: selectedPlan.price || '',
        end_date: endDate.toISOString().split('T')[0]
      }));
    }
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setFormData(prev => ({
      ...prev,
      start_date: newStartDate
    }));
    
    // إذا كانت هناك خطة محددة، تحديث تاريخ الانتهاء تلقائياً
    if (formData.plan_id) {
      const selectedPlan = plans.find(plan => plan.id == formData.plan_id);
      if (selectedPlan && newStartDate) {
        const startDate = new Date(newStartDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + (selectedPlan.duration || 30));
        
        setFormData(prev => ({
          ...prev,
          end_date: endDate.toISOString().split('T')[0]
        }));
      }
    }
  };

  // الحصول على ميزات الخطة المحددة
  const getSelectedPlanFeatures = () => {
    const selectedPlan = plans.find(plan => plan.id == formData.plan_id);
    if (!selectedPlan) return [];
    
    if (Array.isArray(selectedPlan.features)) {
      return selectedPlan.features;
    } else if (typeof selectedPlan.features === 'string') {
      return selectedPlan.features.split(',').map(feature => feature.trim()).filter(feature => feature !== '');
    }
    return [];
  };

  if (loadingData) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

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
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">المعلومات الأساسية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  إيميل المستخدم *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
                {emailValidation.loading && (
                  <p className="mt-1 text-sm text-yellow-600">
                    <i className="fas fa-spinner fa-spin ml-1"></i>
                    جاري التحقق من البريد الإلكتروني...
                  </p>
                )}
                {emailValidation.valid && user && (
                  <p className="mt-1 text-sm text-green-600">
                    <i className="fas fa-check-circle ml-1"></i>
                    تم التحقق
                  </p>
                )}
              </div>

              {/* Plan Selection */}
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
                  required
                >
                  <option value="">اختر الخطة</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {plan.price} $ ({plan.duration} يوم)
                    </option>
                  ))}
                </select>
                {errors.plan_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.plan_id}</p>
                )}
                {formData.plan_id && (
                  <p className="mt-1 text-sm text-green-600">
                    <i className="fas fa-check-circle ml-1"></i>
                    تم اختيار الخطة
                  </p>
                )}
              </div>

{/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ البداية 
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleStartDateChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                    errors.start_date ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.start_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
                )}
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ الانتهاء 
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                    errors.end_date ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                  min={formData.start_date}
                />
                {errors.end_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السعر ($) 
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
                  min="0"
                  required
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
                  <option value="wallet">محفظة إلكترونية</option>
                </select>
              </div>
            </div>
          </div>

          {/* Features */}
          {getSelectedPlanFeatures().length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">مميزات الخطة المحددة</h3>
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
                  <option value="suspended">موقوف</option>
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
                <span className="text-xs text-gray-500 mr-2">(سيتم تجديد الاشتراك تلقائياً عند انتهائه)</span>
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
              placeholder="أدخل أي ملاحظات إضافية حول الاشتراك..."
            />
            <p className="text-sm text-gray-500 mt-1">هذا الحقل اختياري، يمكنك إضافة أي ملاحظات تريدها</p>
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
              disabled={isLoading || !emailValidation.valid || !formData.plan_id}
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