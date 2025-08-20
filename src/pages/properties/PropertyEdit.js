import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PROPERTY_TYPES, SAUDI_CITIES, LAND_TYPES, SHOP_TYPES, LAND_SLOPES, FURNISHING_TYPES } from '../../utils/constants';

const PropertyEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  // الحالة الابتدائية للعقار
  const initialFormData = {
    // معلومات أساسية
    title: '',
    description: '',
    type: '',
    price: '',
    city: '',
    district: '',
    address: '',
    area: '',
    images: [],
    status: 'pending',
    
    // حقول مشتركة
    hasElectricity: false,
    hasWater: false,
    
    // حقول خاصة بالأرض
    landType: '',
    landSlope: '',
    isServiced: false,
    inMasterPlan: false,
    
    // حقول خاصة بالمحل
    shopType: '',
    hasWarehouse: false,
    hasRestroom: false,
    
    // حقول خاصة بالمكتب
    floor: '',
    meetingRooms: '',
    hasParking: false,
    isFurnished: false,
    
    // حقول خاصة بالشقة
    bedrooms: '',
    bathrooms: '',
    furnishingType: '',
    hasElevator: false,
    hasGarage: false
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      // Simulate loading property data
      const propertyData = {
        title: 'شقة فاخرة في الرياض',
        description: 'شقة مميزة في موقع استراتيجي',
        type: 'شقة',
        price: '500000',
        city: 'الرياض',
        district: 'حي النرجس',
        address: 'شارع الملك فهد',
        bedrooms: '3',
        bathrooms: '2',
        area: '120',
        furnishingType: 'deluxe',
        hasElevator: true,
        hasGarage: true,
        images: [],
        status: 'pending'
      };
      setFormData(propertyData);
    }
  }, [isEditing]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'عنوان العقار مطلوب';
    }

    if (!formData.type) {
      newErrors.type = 'نوع العقار مطلوب';
    }

    if (!formData.price) {
      newErrors.price = 'السعر مطلوب';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'السعر يجب أن يكون رقم صحيح';
    }

    if (!formData.city) {
      newErrors.city = 'المدينة مطلوبة';
    }

    if (!formData.area) {
      newErrors.area = 'المساحة مطلوبة';
    } else if (isNaN(formData.area) || parseFloat(formData.area) <= 0) {
      newErrors.area = 'المساحة يجب أن تكون رقم صحيح';
    }

    // التحقق من الحقول الخاصة بكل نوع
    if (formData.type === 'قطعة أرض') {
      if (!formData.landType) {
        newErrors.landType = 'نوع الأرض مطلوب';
      }
      if (!formData.landSlope) {
        newErrors.landSlope = 'ميل الأرض مطلوب';
      }
    }

    if (formData.type === 'محل') {
      if (!formData.shopType) {
        newErrors.shopType = 'نوع المحل مطلوب';
      }
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

    // Simulate API call
    setTimeout(() => {
      console.log('Saving property:', formData);
      setIsLoading(false);
      navigate('/properties');
    }, 1000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const renderPropertySpecificFields = () => {
    switch(formData.type) {
      case 'قطعة أرض':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الأرض *
              </label>
              <select
                name="landType"
                value={formData.landType}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                  errors.landType ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">اختر نوع الأرض</option>
                {LAND_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.landType && (
                <p className="mt-1 text-sm text-red-600">{errors.landType}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ميل الأرض *
              </label>
              <select
                name="landSlope"
                value={formData.landSlope}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                  errors.landSlope ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">اختر ميل الأرض</option>
                {LAND_SLOPES.map(slope => (
                  <option key={slope} value={slope}>{slope}</option>
                ))}
              </select>
              {errors.landSlope && (
                <p className="mt-1 text-sm text-red-600">{errors.landSlope}</p>
              )}
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isServiced"
                checked={formData.isServiced}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="mr-2 text-sm text-gray-700">الأرض مخدومة</span>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="inMasterPlan"
                checked={formData.inMasterPlan}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="mr-2 text-sm text-gray-700">ضمن المخطط الرئيسي</span>
            </div>
          </div>
        );
        
      case 'محل':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع المحل *
              </label>
              <select
                name="shopType"
                value={formData.shopType}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                  errors.shopType ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">اختر نوع المحل</option>
                {SHOP_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.shopType && (
                <p className="mt-1 text-sm text-red-600">{errors.shopType}</p>
              )}
            </div>
            
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="hasWarehouse"
                  checked={formData.hasWarehouse}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="mr-2 text-sm text-gray-700">يحتوي على مستودع</span>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="hasRestroom"
                  checked={formData.hasRestroom}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="mr-2 text-sm text-gray-700">يحتوي على حمام</span>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="hasElectricity"
                  checked={formData.hasElectricity}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="mr-2 text-sm text-gray-700">يوجد مصدر كهرباء</span>
              </div>
            </div>
          </div>
        );
        
      case 'مكتب':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الطابق
              </label>
              <select
                name="floor"
                value={formData.floor}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
              >
                <option value="">اختر الطابق</option>
                {[0, 1, 2, 3, 4, 5].map(floor => (
                  <option key={floor} value={floor}>الطابق {floor}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                غرف الاجتماعات
              </label>
              <select
                name="meetingRooms"
                value={formData.meetingRooms}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
              >
                <option value="">اختر عدد الغرف</option>
                {[0, 1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num} غرفة</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="hasParking"
                checked={formData.hasParking}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="mr-2 text-sm text-gray-700">يوجد موقف سيارات</span>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isFurnished"
                checked={formData.isFurnished}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="mr-2 text-sm text-gray-700">مكتب مؤثث</span>
            </div>
          </div>
        );
        
      case 'شقة':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عدد غرف النوم
              </label>
              <select
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
              >
                <option value="">اختر عدد الغرف</option>
                {[0, 1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num} غرفة</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عدد الحمامات
              </label>
              <select
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
              >
                <option value="">اختر عدد الحمامات</option>
                {[0, 1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num} حمام</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع التأثيث
              </label>
              <select
                name="furnishingType"
                value={formData.furnishingType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
              >
                <option value="">اختر نوع التأثيث</option>
                {FURNISHING_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="hasElevator"
                  checked={formData.hasElevator}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="mr-2 text-sm text-gray-700">يوجد مصعد</span>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="hasGarage"
                  checked={formData.hasGarage}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="mr-2 text-sm text-gray-700">يوجد كراج</span>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="p-6 fade-in">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => navigate('/properties')}
            className="text-gray-600 hover:text-gray-800 ml-4"
          >
            <i className="fas fa-arrow-right text-xl"></i>
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'تعديل العقار' : 'إضافة عقار جديد'}
          </h2>
        </div>
        <p className="text-gray-600">
          {isEditing ? 'تعديل بيانات العقار' : 'إضافة عقار جديد إلى النظام'}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">المعلومات الأساسية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان العقار *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="أدخل عنوان العقار"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع العقار *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                    errors.type ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">اختر نوع العقار</option>
                  {PROPERTY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type}</p>
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
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف العقار
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="أدخل وصف مفصل للعقار"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">الموقع</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المدينة *
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                    errors.city ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">اختر المدينة</option>
                  {SAUDI_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                )}
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحي
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="أدخل اسم الحي"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان التفصيلي
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="أدخل العنوان التفصيلي"
                />
              </div>
            </div>
          </div>

          {/* Area */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">المساحة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المساحة (م²) *
                </label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                    errors.area ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="أدخل المساحة"
                />
                {errors.area && (
                  <p className="mt-1 text-sm text-red-600">{errors.area}</p>
                )}
              </div>
            </div>
          </div>

          {/* Property Specific Fields */}
          {renderPropertySpecificFields()}

          {/* Status - Only for editing */}
          {isEditing && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">الحالة</h3>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
              >
                <option value="pending">في الانتظار</option>
                <option value="approved">معتمد</option>
                <option value="rejected">مرفوض</option>
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 space-x-reverse pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/properties')}
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
              {isEditing ? 'تحديث العقار' : 'إضافة العقار'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyEdit;