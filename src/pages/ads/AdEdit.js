import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AD_TYPES } from '../../utils/constants';
import axios from 'axios';
import { User } from '../../Contexts/Context';

const AdEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const context = useContext(User);
  const isEditing = Boolean(id);

  const [properties, setProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    client: '',
    startDate: '',
    endDate: '',
    budget: '',
    targetAudience: '',
    keywords: '',
    imageUrl: '',
    linkUrl: '',
    status: 'active',
    propertyId: '' // ID العقار المختار
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPropertySelector, setShowPropertySelector] = useState(false);
  const [propertySearch, setPropertySearch] = useState('');

  // جلب العقارات من API
  useEffect(() => {
    const fetchProperties = async () => {
      setPropertiesLoading(true);
      try {
        const response = await axios.get('http://116.203.254.150:8001/api/property/getProperty/4', {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + context.auth.token,
          },
        });
        
        if (response && response.data) {
          // التأكد من أن البيانات مصفوفة
          const propertiesData = Array.isArray(response.data.data) 
            ? response.data.data 
            : [response.data.data];
          setProperties(propertiesData);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setPropertiesLoading(false);
      }
    };

    fetchProperties();
  }, [context.auth.token]);

  useEffect(() => {
    if (isEditing) {
      // جلب بيانات الإعلان للتعديل
      const fetchAdData = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(`http://116.203.254.150:8001/api/ad/show/${id}`, {
            headers: {
              Accept: "application/json",
              Authorization: "Bearer " + context.auth.token,
            },
          });
          
          if (response.data && response.data.data) {
            const adData = response.data.data;
            setFormData({
              title: adData.property?.name || '',
              description: adData.property?.description || '',
              type: 'بانر', // يمكن تعديله حسب نوع الإعلان الفعلي
              client: 'عميل', // يمكن تعديله حسب البيانات الفعلية
              startDate: adData.start_date?.split('T')[0] || '',
              endDate: adData.end_date?.split('T')[0] || '',
              budget: '5000', // يمكن تعديله حسب البيانات الفعلية
              targetAudience: 'الباحثين عن عقارات',
              keywords: 'عقارات',
              imageUrl: adData.property?.images?.[0]?.image_url || '',
              linkUrl: `https://example.com/properties/${adData.property_id}`,
              status: adData.is_active ? 'active' : 'paused',
              propertyId: adData.property_id?.toString() || ''
            });
          }
        } catch (error) {
          console.error('Error fetching ad data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchAdData();
    }
  }, [isEditing, id, context.auth.token]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'عنوان الإعلان مطلوب';
    }

    if (!formData.type) {
      newErrors.type = 'نوع الإعلان مطلوب';
    }

    if (!formData.client.trim()) {
      newErrors.client = 'اسم العميل مطلوب';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'تاريخ البداية مطلوب';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'تاريخ الانتهاء مطلوب';
    } else if (formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية';
    }

    if (!formData.budget) {
      newErrors.budget = 'الميزانية مطلوبة';
    } else if (isNaN(formData.budget) || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'الميزانية يجب أن تكون رقم صحيح';
    }

    if (!formData.propertyId) {
      newErrors.propertyId = 'يجب اختيار عقار للإعلان';
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
      const adData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        client: formData.client,
        start_date: formData.startDate,
        end_date: formData.endDate,
        budget: parseFloat(formData.budget),
        target_audience: formData.targetAudience,
        keywords: formData.keywords,
        image_url: formData.imageUrl,
        link_url: formData.linkUrl,
        property_id: parseInt(formData.propertyId),
        is_active: formData.status === 'active'
      };

      if (isEditing) {
        await axios.put(`http://116.203.254.150:8001/api/ad/update/${id}`, adData, {
          headers: {
            Authorization: "Bearer " + context.auth.token,
          },
        });
      } else {
        await axios.post('http://116.203.254.150:8001/api/ad/create', adData, {
          headers: {
            Authorization: "Bearer " + context.auth.token,
          },
        });
      }

      navigate('/ads');
    } catch (error) {
      console.error('Error saving ad:', error);
      alert('فشل في حفظ الإعلان');
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

  const handlePropertySelect = (property) => {
    setFormData(prev => ({
      ...prev,
      propertyId: property.id.toString(),
      title: property.name || 'إعلان عقار',
      description: property.description || '',
      imageUrl: property.images?.[0]?.image_url || '',
      linkUrl: `https://example.com/properties/${property.id}`
    }));
    setShowPropertySelector(false);
  };

  const getSelectedProperty = () => {
    return properties.find(prop => prop.id.toString() === formData.propertyId);
  };

  const filteredProperties = properties.filter(property =>
    property.name?.toLowerCase().includes(propertySearch.toLowerCase()) ||
    property.address?.toLowerCase().includes(propertySearch.toLowerCase()) ||
    property.description?.toLowerCase().includes(propertySearch.toLowerCase())
  );

  const formatPrice = (price) => {
    return `${price?.toLocaleString('ar-EG') || '0'} ريال`;
  };

  const getPropertyTypeText = (type) => {
    const types = {
      land: 'أرض',
      apartment: 'شقة',
      shop: 'محل',
      office: 'مكتب',
      villa: 'فيلا'
    };
    return types[type] || type;
  };

  const getPropertyTypeIcon = (type) => {
    const icons = {
      land: 'fas fa-map-marker-alt',
      apartment: 'fas fa-building',
      shop: 'fas fa-store',
      office: 'fas fa-briefcase',
      villa: 'fas fa-home'
    };
    return icons[type] || 'fas fa-home';
  };

  if (isLoading && isEditing) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">جاري تحميل بيانات الإعلان...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 fade-in">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => navigate('/ads')}
            className="text-gray-600 hover:text-gray-800 ml-4"
          >
            <i className="fas fa-arrow-right text-xl"></i>
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'تعديل الإعلان' : 'إنشاء إعلان جديد'}
          </h2>
        </div>
        <p className="text-gray-600">
          {isEditing ? 'تعديل بيانات الإعلان' : 'إنشاء إعلان جديد في النظام'}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">المعلومات الأساسية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان الإعلان *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="أدخل عنوان الإعلان"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الإعلان *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                    errors.type ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">اختر نوع الإعلان</option>
                  {AD_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم العميل *
                </label>
                <input
                  type="text"
                  name="client"
                  value={formData.client}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                    errors.client ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="أدخل اسم العميل"
                />
                {errors.client && (
                  <p className="mt-1 text-sm text-red-600">{errors.client}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف الإعلان
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="أدخل وصف مفصل للإعلان"
                />
              </div>
            </div>
          </div>

          {/* Property Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">اختيار العقار</h3>
            <div className="grid grid-cols-1 gap-6">
              {formData.propertyId ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">العقار المختار</h4>
                    <button
                      type="button"
                      onClick={() => setShowPropertySelector(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <i className="fas fa-edit ml-1"></i>
                      تغيير العقار
                    </button>
                  </div>
                  
                  {getSelectedProperty() && (
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i className={`${getPropertyTypeIcon(getSelectedProperty().type)} text-blue-600 text-xl`}></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">{getSelectedProperty().name}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{getSelectedProperty().address}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold text-orange-600">
                            {formatPrice(getSelectedProperty().price)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getSelectedProperty().area} م²
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {getPropertyTypeText(getSelectedProperty().type)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPropertySelector(true)}
                  className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition duration-200"
                >
                  <i className="fas fa-plus-circle text-2xl mb-2"></i>
                  <div>اختر عقار للإعلان</div>
                </button>
              )}
              {errors.propertyId && (
                <p className="text-sm text-red-600">{errors.propertyId}</p>
              )}
            </div>
          </div>

          {/* Campaign Details */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">تفاصيل الحملة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ البداية *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                    errors.startDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ الانتهاء *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                    errors.endDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الميزانية (ريال) *
                </label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  min="100"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                    errors.budget ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="أدخل الميزانية"
                />
                {errors.budget && (
                  <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الجمهور المستهدف
                </label>
                <input
                  type="text"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="مثال: الباحثين عن عقارات فاخرة"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الكلمات المفتاحية
                </label>
                <input
                  type="text"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="مثال: عقارات، الرياض، فلل، شقق (مفصولة بفواصل)"
                />
              </div>
            </div>
          </div>

          {/* Media & Links */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">الوسائط والروابط</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط الصورة
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط الهدف
                </label>
                <input
                  type="url"
                  name="linkUrl"
                  value={formData.linkUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">الحالة</h3>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
            >
              <option value="active">نشط</option>
              <option value="paused">متوقف</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 space-x-reverse pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/ads')}
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
              {isEditing ? 'تحديث الإعلان' : 'إنشاء الإعلان'}
            </button>
          </div>
        </form>
      </div>

      {/* Property Selector Modal */}
      {showPropertySelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">اختيار العقار</h3>
                <button 
                  onClick={() => setShowPropertySelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              <div className="relative">
                <input 
                  type="text"
                  value={propertySearch}
                  onChange={(e) => setPropertySearch(e.target.value)}
                  placeholder="ابحث عن عقار..."
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <i className="fas fa-search absolute right-3 top-3 text-gray-400"></i>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-96">
              {propertiesLoading ? (
                <div className="p-8 text-center">
                  <i className="fas fa-spinner fa-spin text-2xl text-blue-600 mb-4"></i>
                  <p className="text-gray-600">جاري تحميل العقارات...</p>
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <i className="fas fa-home text-4xl mb-4"></i>
                  <p>لا توجد عقارات مطابقة للبحث</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredProperties.map(property => (
                    <div 
                      key={property.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition duration-200"
                      onClick={() => handlePropertySelect(property)}
                    >
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <i className={`${getPropertyTypeIcon(property.type)} text-blue-600`}></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{property.name}</span>
                            <span className="text-sm font-bold text-orange-600">
                              {formatPrice(property.price)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{property.address}</p>
                          <div className="flex items-center space-x-4 space-x-reverse mt-1">
                            <span className="text-xs text-gray-400">{property.area} م²</span>
                            <span className="text-xs text-gray-400">
                              {getPropertyTypeText(property.type)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdEdit;