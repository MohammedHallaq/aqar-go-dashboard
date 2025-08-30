import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AD_TYPES, URL } from '../../utils/constants';
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
    property_id: '',
    start_date: '',
    end_date: '',
    is_active: true
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPropertySelector, setShowPropertySelector] = useState(false);
  const [propertySearch, setPropertySearch] = useState('');

  // دالة جلب العقارات مع useCallback
  const fetchProperties = useCallback(async () => {
    setPropertiesLoading(true);
    try {
      const response = await axios.get(URL+'api/property/getUserProperties', {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + context.auth.token,
        },
      });
      
      if (response.data && response.data.data) {
        // استخراج البيانات من response.data.data.data
        const propertiesData = response.data.data.data || response.data.data || [];
        setProperties(Array.isArray(propertiesData) ? propertiesData : [propertiesData]);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setPropertiesLoading(false);
    }
  }, [showPropertySelector]);

  // جلب العقارات مرة واحدة فقط
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // دالة جلب بيانات الإعلان مع useCallback
  const fetchAdData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(URL+`api/ad/show/${id}`, {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + context.auth.token,
        },
      });
      
      if (response.data && response.data.ad) {
        const adData = response.data.ad;
        setFormData({
          property_id: adData.property_id?.toString() || '',
          start_date: adData.start_date?.split('T')[0] || '',
          end_date: adData.end_date?.split('T')[0] || '',
          is_active: adData.is_active || true
        });
      }
    } catch (error) {
      console.error('Error fetching ad data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id, context.auth.token]);

  // جلب بيانات الإعلان للتعديل مرة واحدة فقط
  useEffect(() => {
    if (isEditing) {
      fetchAdData();
    }
  }, [isEditing, fetchAdData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.property_id) {
      newErrors.property_id = 'يجب اختيار عقار للإعلان';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'تاريخ البداية مطلوب';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'تاريخ الانتهاء مطلوب';
    } else if (formData.start_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية';
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
        property_id: parseInt(formData.property_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.is_active
      };

      if (isEditing) {
        await axios.put(URL+`api/ad/update/${id}`, adData, {
          headers: {
            Authorization: "Bearer " + context.auth.token,
          },
        });
      } else {
        await axios.post(URL+'api/ad/create', adData, {
          headers: {
            Authorization: "Bearer " + context.auth.token,
          },
        });
      }

      navigate('/ads');
    } catch (error) {
      console.error('Error saving ad:', error);
      alert('فشل في حفظ الإعلان: ' + (error.response?.data?.message || error.message));
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
      property_id: property.id.toString()
    }));
    setShowPropertySelector(false);
  };

  const getSelectedProperty = () => {
    return properties.find(prop => prop.id.toString() === formData.property_id);
  };

  const filteredProperties = properties.filter(property =>
    property.name?.toLowerCase().includes(propertySearch.toLowerCase()) ||
    property.address?.toLowerCase().includes(propertySearch.toLowerCase()) ||
    property.description?.toLowerCase().includes(propertySearch.toLowerCase())
  );

  const formatPrice = (price) => {
    return `${price?.toLocaleString('ar-EG') || '0'} $`;
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

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    try {
      return new Date(dateString).toLocaleDateString('ar-EG');
    } catch {
      return 'غير محدد';
    }
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
          {/* Property Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">اختيار العقار</h3>
            <div className="grid grid-cols-1 gap-6">
              {formData.property_id ? (
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
                      {getSelectedProperty().images?.[0]?.image_url ? (
                        <img 
                          src={getSelectedProperty().images[0].image_url.replace("http://116.203.254.150:8001", "https://aqargo.duckdns.org")} 
                          alt={getSelectedProperty().name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                          <i className={`${getPropertyTypeIcon(getSelectedProperty().type)} text-blue-600 text-xl`}></i>
                        </div>
                      )}
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
              {errors.property_id && (
                <p className="text-sm text-red-600">{errors.property_id}</p>
              )}
            </div>
          </div>

          {/* Campaign Details */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">تفاصيل الفترة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
          </div>

          {/* Status */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">الحالة</h3>
            <select
              name="is_active"
              value={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
              className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
            >
              <option value={true}>نشط</option>
              <option value={false}>متوقف</option>
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
                        {property.images?.[0]?.image_url ? (
                          <img 
                            src={property.images[0].image_url.replace("http://116.203.254.150:8001", "https://aqargo.duckdns.org")} 
                            alt={property.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <i className={`${getPropertyTypeIcon(property.type)} text-blue-600`}></i>
                          </div>
                        )}
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
                            <span className="text-xs text-gray-400">
                              {formatDate(property.created_at)}
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