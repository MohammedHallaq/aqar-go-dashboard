import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { User } from '../../Contexts/Context';
import { URL } from '../../utils/constants';
const PlanForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const context = useContext(User);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    type: 'monthly', // تغيير القيمة الافتراضية إلى monthly
    duration: 30,
    features: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [useMockData, setUseMockData] = useState(false);
  const [originalName, setOriginalName] = useState('');

  // دالة جلب بيانات الخطة مع useCallback
  const fetchPlan = useCallback(async () => {
    try {
      const response = await axios.get(URL+`api/plans/${id}`, {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + context.auth.token,
        },
      });
      
      if (response.data && response.data.data) {
        const planData = response.data.data;
        // تحويل البيانات لتتناسب مع حالة النموذج
        setFormData({
          ...planData,
          features: Array.isArray(planData.features) ? planData.features.join(', ') : planData.features,
          duration: parseInt(planData.duration) || 30
        });
        setOriginalName(planData.name);
        setUseMockData(false);
      } else {
        throw new Error('لا توجد بيانات');
      }
    } catch (err) {
      console.error('Error fetching plan:', err);
      // استخدام بيانات وهمية للتعديل
      setFormData({
        name: "الخطة المميزة",
        price: 99.99,
        type: "yearly",
        duration: 365,
        features: "النشر حتى 50 إعلان, وصول إعلاني مميز, دعم مميز على مدار الساعة, تقارير متقدمة",
        status: "active"
      });
      setUseMockData(true);
    }
  }, [id, context.auth.token]);

  // جلب بيانات الخطة في حالة التعديل مرة واحدة فقط
  useEffect(() => {
    if (isEditing) {
      fetchPlan();
    }
  }, [isEditing, fetchPlan]);

  // إخفاء رسالة النجاح تلقائياً بعد 3 ثوان
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'اسم الخطة مطلوب';
    } else if (formData.name.length > 255) {
      newErrors.name = 'اسم الخطة يجب أن لا يتجاوز 255 حرف';
    }

    if (!formData.price) {
      newErrors.price = 'السعر مطلوب';
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = 'السعر يجب أن يكون رقم صحيح موجب';
    }

    if (!formData.duration) {
      newErrors.duration = 'المدة مطلوبة';
    } else if (isNaN(formData.duration) || parseInt(formData.duration) <= 0) {
      newErrors.duration = 'المدة يجب أن تكون رقم صحيح موجب';
    }

    if (!formData.features) {
      newErrors.features = 'المميزات مطلوبة';
    } else if (formData.features.length > 65535) {
      newErrors.features = 'المميزات يجب أن لا تتجاوز 65535 حرف';
    }

    if (!formData.type) {
      newErrors.type = 'نوع الخطة مطلوب';
    } else if (!['monthly', 'yearly'].includes(formData.type)) {
      newErrors.type = 'نوع الخطة يجب أن يكون monthly أو yearly';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const prepareFormData = () => {
    // تحويل البيانات لتتناسب مع متطلبات الخادم
    return {
      ...formData,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      features: formData.features // إرسال كسلسلة نصية كما يطلب الخادم
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const preparedData = prepareFormData();

      if (useMockData) {
        // معالجة وهمية للحفظ
        setTimeout(() => {
          console.log('Saving plan (mock):', preparedData);
          setIsLoading(false);
          setSuccessMessage('تم حفظ الخطة بنجاح (بيانات تجريبية)');
          setTimeout(() => navigate('/subscriptions?tab=plans'), 2000);
        }, 1000);
        return;
      }

      let response;
      
      if (isEditing) {
        // التحقق من إذا كان الاسم قد تغير
        if (formData.name !== originalName) {
          preparedData._method = 'PUT'; // لإخبار Laravel أن هذه عملية تحديث
        }
        
        // تحديث الخطة الموجودة
        response = await axios.put(URL+`api/plans/${id}`, preparedData, {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + context.auth.token,
            'Content-Type': 'multipart/form-data'
          },
        });
      } else {
        // إنشاء خطة جديدة
        response = await axios.post(URL+'api/plans', preparedData, {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + context.auth.token,
            'Content-Type': 'multipart/form-data'
          },
        });
      }
      
      if (response.data && response.data.status === 1) {
        setSuccessMessage(response.data.message || 'تم حفظ الخطة بنجاح');
        // الانتقال التلقائي بعد ثانيتين
        setTimeout(() => {
          navigate('/subscriptions?tab=plans');
        }, 2000);
      }
    } catch (err) {
      console.error('Error saving plan:', err);
      if (err.response?.data?.data) {
        // عرض أخطاء التحقق من الصحة من الخادم
        const serverErrors = err.response.data.data;
        const formattedErrors = {};
        
        // تحويل أخطاء الخادم إلى تنسيق مناسب
        Object.keys(serverErrors).forEach(key => {
          if (Array.isArray(serverErrors[key])) {
            formattedErrors[key] = serverErrors[key][0];
          } else {
            formattedErrors[key] = serverErrors[key];
          }
        });
        
        setErrors(formattedErrors);
      } else {
        alert('فشل في حفظ الخطة: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDurationPreset = (days, label) => {
    setFormData(prev => ({
      ...prev,
      duration: days
    }));
    
    if (errors.duration) {
      setErrors(prev => ({
        ...prev,
        duration: ''
      }));
    }
  };

  const handleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      type: type,
      duration: type === 'yearly' ? 365 : 30
    }));
    
    if (errors.type) {
      setErrors(prev => ({
        ...prev,
        type: ''
      }));
    }
  };

  return (
    <div className="p-6 fade-in">
      {/* رسالة النجاح */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center">
          <i className="fas fa-check-circle ml-2"></i>
          <span>{successMessage}</span>
          <button 
            onClick={() => setSuccessMessage('')}
            className="text-green-700 hover:text-green-900 mr-2"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => navigate('/subscriptions?tab=plans')}
            className="text-gray-600 hover:text-gray-800 ml-4"
          >
            <i className="fas fa-arrow-right text-xl"></i>
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'تعديل الخطة' : 'إضافة خطة جديدة'}
          </h2>
        </div>
        <p className="text-gray-600">
          {isEditing ? 'تعديل بيانات الخطة' : 'إضافة خطة اشتراك جديدة'}
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
              {/* Plan Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الخطة *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="أدخل اسم الخطة"
                  maxLength={255}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  {formData.name.length}/255 حرف
                </p>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السعر ($) *
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
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              {/* Plan Type */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الخطة *
                </label>
                <div className="flex space-x-4 space-x-reverse">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('monthly')}
                    className={`px-6 py-3 rounded-lg border transition duration-200 flex-1 flex flex-col items-center ${
                      formData.type === 'monthly' 
                        ? 'bg-blue-100 border-blue-300 text-blue-700' 
                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="font-semibold">شهرية</span>
                    <span className="text-sm">(30 يوم)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('yearly')}
                    className={`px-6 py-3 rounded-lg border transition duration-200 flex-1 flex flex-col items-center ${
                      formData.type === 'yearly' 
                        ? 'bg-green-100 border-green-300 text-green-700' 
                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="font-semibold">سنوية</span>
                    <span className="text-sm">(365 يوم)</span>
                  </button>
                </div>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المدة (أيام) *
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                    errors.duration ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="أدخل المدة بالأيام"
                  min="1"
                  readOnly={formData.type === 'monthly' || formData.type === 'yearly'}
                />
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                )}
                
                <p className="mt-1 text-sm text-gray-500">
                  المدة محددة تلقائياً حسب نوع الخطة
                </p>
              </div>

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
                  <option value="active">مفعل</option>
                  <option value="inactive">غير مفعل</option>
                </select>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">مميزات الخطة</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المميزات *
              </label>
              <textarea
                name="features"
                value={formData.features}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                  errors.features ? 'border-red-300' : 'border-gray-300'
                }`}
                rows="4"
                placeholder="أدخل مميزات الخطة (يتم إرسالها كنص واحد)"
                maxLength={65535}
              />
              {errors.features && (
                <p className="mt-1 text-sm text-red-600">{errors.features}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.features.length}/65535 حرف - اكتب جميع المميزات في هذا الحقل
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 space-x-reverse pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/subscriptions?tab=plans')}
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
              {isEditing ? 'تحديث الخطة' : 'إضافة الخطة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanForm;