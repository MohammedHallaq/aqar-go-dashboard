import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const PlanForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    type: 'basic',
    duration: 'شهري',
    features: [''],
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const fetchPlan = async () => {
        try {
          const response = await axios.get(`http://116.203.254.150:8001/api/plans/${id}`, {
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
          console.error('Error fetching plan:', err);
          // استخدام بيانات وهمية للتعديل
          setFormData({
            name: "المميزة",
            price: 4.99,
            type: "premium",
            duration: "شهري",
            features: ["النشر حتى 15 إعلان", "وصول إعلاني مميز", "دعم مميز على مدار الساعة"],
            status: "active"
          });
          setUseMockData(true);
        }
      };

      fetchPlan();
    }
  }, [id, isEditing]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'اسم الخطة مطلوب';
    }

    if (!formData.price) {
      newErrors.price = 'السعر مطلوب';
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = 'السعر يجب أن يكون رقم صحيح';
    }

    if (!formData.duration) {
      newErrors.duration = 'المدة مطلوبة';
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
          console.log('Saving plan (mock):', formData);
          setIsLoading(false);
          alert('تم حفظ الخطة بنجاح (بيانات تجريبية)');
          navigate('/subscriptions?tab=plans');
        }, 1000);
        return;
      }

      if (isEditing) {
        // تحديث الخطة الموجودة
        const response = await axios.put(`http://116.203.254.150:8001/api/plans/${id}`, formData, {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + localStorage.getItem('auth_token'),
          },
        });
        
        if (response.data && response.data.success) {
          alert('تم تحديث الخطة بنجاح');
          navigate('/subscriptions?tab=plans');
        }
      } else {
        // إنشاء خطة جديدة
        const response = await axios.post('http://116.203.254.150:8001/api/plans', formData, {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + localStorage.getItem('auth_token'),
          },
        });
        
        if (response.data && response.data.success) {
          alert('تم إنشاء الخطة بنجاح');
          navigate('/subscriptions?tab=plans');
        }
      }
    } catch (err) {
      console.error('Error saving plan:', err);
      alert('فشل في حفظ الخطة');
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

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        features: newFeatures
      }));
    }
  };

  return (
    <div className="p-6 fade-in">
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
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
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

              {/* Plan Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الخطة
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
                >
                  <option value="free">مجانية</option>
                  <option value="basic">أساسية</option>
                  <option value="premium">مميزة</option>
                  <option value="professional">محترفة</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المدة *
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                    errors.duration ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="مثال: شهري، سنوي"
                />
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                )}
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">مميزات الخطة</h3>
              <button
                type="button"
                onClick={addFeature}
                className="bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200 transition duration-300 flex items-center"
              >
                <i className="fas fa-plus ml-2"></i>
                إضافة ميزة
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="أدخل ميزة جديدة"
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-600 hover:text-red-800 mr-3"
                    >
                      <i className="fas fa-times text-lg"></i>
                    </button>
                  )}
                </div>
              ))}
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