import React, { useEffect, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStatusBadgeClasses } from '../../utils/helpers';
import axios from 'axios';
import { User } from '../../Contexts/Context';

const AdsManagement = () => {
  const navigate = useNavigate();
  const context = useContext(User);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAd, setSelectedAd] = useState(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);

  // Debounce effect للبحث
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // دالة جلب البيانات مع useCallback
  const fetchAds = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`http://116.203.254.150:8001/api/ad/index?page=${page}`, {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + context.auth.token,
        },
      });

      if (response.data && response.data.data) {
        const adsData = response.data.data.data;
        const paginationData = response.data.data;
        
        setAds(adsData || []);
        setPagination({
          current_page: paginationData.current_page || 1,
          last_page: paginationData.last_page || 1,
          per_page: paginationData.per_page || 10,
          total: paginationData.total || 0
        });
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
      setError('فشل في تحميل الإعلانات');
      setAds([]);
    } finally {
      setLoading(false);
    }
  }, [context.auth.token]);

  // التحميل الأولي
  useEffect(() => {
    fetchAds(1);
  }, [fetchAds]);

  const handleDeleteAd = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
      try {
        await axios.delete(`http://116.203.254.150:8001/api/ad/delete/${id}`, {
          headers: {
            Authorization: "Bearer " + context.auth.token,
          },
        });
        
        // تحديث محلي بدون إعادة جلب البيانات
        setAds(prevAds => prevAds.filter(ad => ad.id !== id));
        setPagination(prev => ({ ...prev, total: prev.total - 1 }));
        
      } catch (error) {
        console.error('Error deleting ad:', error);
        alert('فشل في حذف الإعلان');
      }
    }
  };

  const toggleAdStatus = async (id) => {
    const ad = ads.find(ad => ad.id === id);
    if (!ad) return;
    
    const newStatus = !ad.is_active;
    
    try {
      const endpoint = newStatus 
        ? `http://116.203.254.150:8001/api/ad/activate/${id}`
        : `http://116.203.254.150:8001/api/ad/unactivate/${id}`;
      
      await axios.get(endpoint, {
        headers: {
          Authorization: "Bearer " + context.auth.token,
        },
      });
      
      // تحديث محلي بدون إعادة جلب البيانات
      setAds(prevAds => prevAds.map(ad => 
        ad.id === id ? { ...ad, is_active: newStatus } : ad
      ));
      
      alert(newStatus ? 'تم تفعيل الإعلان بنجاح' : 'تم إيقاف الإعلان بنجاح');
    } catch (error) {
      console.error('Error updating ad status:', error);
      alert('فشل في تحديث حالة الإعلان');
    }
  };

  const viewPropertyDetails = (ad) => {
    setSelectedAd(ad);
    setShowPropertyModal(true);
  };
  const handleOpenWhatsApp = (phone) => {
    if (!phone) {
      alert("رقم الهاتف غير متوفر");
      return;
    }

    let formattedNumber = phone.toString().replace(/\D/g, "");
    if (formattedNumber.startsWith("0")) {
      formattedNumber = "963" + formattedNumber.substring(1); // مثال: سوريا
    }

    const url = `https://wa.me/${formattedNumber}`;
    window.open(url, "_blank");
  };

  // الاتصال المباشر
  const handleCall = (phone) => {
    if (!phone) {
      alert("رقم الهاتف غير متوفر");
      return;
    }
    let formattedNumber = phone.toString().replace(/\D/g, "");
    if (formattedNumber.startsWith("0")) {
      formattedNumber = "963" + formattedNumber.substring(1); // مثال: سوريا
    }
    window.location.href = `tel:${formattedNumber}`;
  };

  const closePropertyModal = () => {
    setShowPropertyModal(false);
    setSelectedAd(null);
  };

  const loadPage = (page) => {
    fetchAds(page);
  };

  // الدوال المساعدة لأنواع العقارات
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

  const getLandTypeText = (type) => {
    const types = {
      residential: 'سكني',
      commercial: 'تجاري',
      industrial: 'صناعي',
      agricultural: 'زراعي'
    };
    return types[type] || type;
  };

  const getShopTypeText = (type) => {
    const types = {
      salon: 'صالون',
      restaurant: 'مطعم',
      supermarket: 'سوبرماركت',
      clothing: 'ملابس',
      electronics: 'إلكترونيات',
      pharmacy: 'صيدلية',
      bookstore: 'مكتبة'
    };
    return types[type] || type;
  };

  const getSlopeText = (slope) => {
    const slopes = {
      flat: 'مسطحة',
      sloping: 'منحدرة',
      mountainous: 'جبلية'
    };
    return slopes[slope] || slope;
  };

  const getFurnishingTypeText = (type) => {
    const types = {
      luxury: 'فاخر',
      superDeluxe: 'سوبر ديلوكس',
      deluxe: 'ديلوكس',
      standard: 'عادي',
      economic: 'اقتصادي'
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

  const renderPropertyPreview = (ad) => {
    if (!ad.property) return null;

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-800">العقار المعلن عنه</h4>
          <button 
            onClick={() => viewPropertyDetails(ad)}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            <i className="fas fa-eye ml-1"></i>
            عرض التفاصيل
          </button>
        </div>
        
        <div className="flex items-center space-x-3 space-x-reverse">
          {ad.property.images?.[0]?.image_url && (
            <img 
              src={ad.property.images[0].image_url} 
              alt={ad.property.name || 'عقار'}
              className="w-16 h-16 object-cover rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <div className="flex-1">
            <div className="flex items-center">
              <i className={`${getPropertyTypeIcon(ad.property.type)} text-blue-600 ml-2`}></i>
              <span className="text-sm font-medium text-gray-900">{ad.property.name || 'بدون عنوان'}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{ad.id || 'بدون عنوان'}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-bold text-orange-600">{formatPrice(ad.property.price)}</span>
              <span className="text-xs text-gray-500">{ad.property.area || '0'} م²</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {getPropertyTypeText(ad.property.type)}
            </div>
          </div>
        </div>

        {/* معلومات صاحب الإعلان */}
        {ad.property.user && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h5 className="text-sm font-semibold text-gray-800 mb-2">معلومات المعلن</h5>
            <div className="flex items-center space-x-3 space-x-reverse">
              {ad.property.user.profile?.image_url && (
                <img 
                  src={ad.property.user.profile.image_url} 
                  alt={ad.property.user.first_name || 'مستخدم'}
                  className="w-10 h-10 object-cover rounded-full"
                />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {ad.property.user.first_name || ''} {ad.property.user.last_name || ''}
                </p>
                <p className="text-xs text-gray-500">{ad.property.user.phone_number || ''}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // عرض الخصائص الخاصة بكل نوع عقار
  const renderPropertySpecificDetails = (property) => {
    if (!property || !property.propertyable) return null;

    switch(property.type) {
      case 'land':
        return (
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className="bg-blue-50 p-2 rounded">
              <div className="font-semibold text-blue-700">نوع الأرض</div>
              <div>{getLandTypeText(property.propertyable.type)}</div>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <div className="font-semibold text-green-700">الميل</div>
              <div>{getSlopeText(property.propertyable.slope)}</div>
            </div>
            <div className="bg-yellow-50 p-2 rounded">
              <div className="font-semibold text-yellow-700">مخدومة</div>
              <div>{property.propertyable.is_serviced ? 'نعم' : 'لا'}</div>
            </div>
            <div className="bg-purple-50 p-2 rounded">
              <div className="font-semibold text-purple-700">ضمن المخطط</div>
              <div>{property.propertyable.is_inside_master_plan ? 'نعم' : 'لا'}</div>
            </div>
          </div>
        );

      case 'shop':
        return (
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className="bg-blue-50 p-2 rounded">
              <div className="font-semibold text-blue-700">نوع المحل</div>
              <div>{getShopTypeText(property.propertyable.type)}</div>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <div className="font-semibold text-green-700">الطابق</div>
              <div>{property.propertyable.floor}</div>
            </div>
            <div className="bg-yellow-50 p-2 rounded">
              <div className="font-semibold text-yellow-700">مستودع</div>
              <div>{property.propertyable.has_warehouse ? 'نعم' : 'لا'}</div>
            </div>
            <div className="bg-purple-50 p-2 rounded">
              <div className="font-semibold text-purple-700">حمام</div>
              <div>{property.propertyable.has_bathroom ? 'نعم' : 'لا'}</div>
            </div>
            {property.propertyable.has_ac && (
              <div className="bg-red-50 p-2 rounded col-span-2">
                <div className="font-semibold text-red-700">مكيف</div>
                <div>نعم</div>
              </div>
            )}
          </div>
        );

      case 'office':
        return (
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className="bg-blue-50 p-2 rounded">
              <div className="font-semibold text-blue-700">الطابق</div>
              <div>{property.propertyable.floor}</div>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <div className="font-semibold text-green-700">الغرف</div>
              <div>{property.propertyable.rooms}</div>
            </div>
            <div className="bg-yellow-50 p-2 rounded">
              <div className="font-semibold text-yellow-700">الحمامات</div>
              <div>{property.propertyable.bathrooms}</div>
            </div>
            <div className="bg-purple-50 p-2 rounded">
              <div className="font-semibold text-purple-700">غرف الاجتماعات</div>
              <div>{property.propertyable.meeting_rooms}</div>
            </div>
            <div className="bg-red-50 p-2 rounded">
              <div className="font-semibold text-red-700">موقف سيارات</div>
              <div>{property.propertyable.has_parking ? 'نعم' : 'لا'}</div>
            </div>
            <div className="bg-indigo-50 p-2 rounded">
              <div className="font-semibold text-indigo-700">مؤثث</div>
              <div>{property.propertyable.furnished ? 'نعم' : 'لا'}</div>
            </div>
          </div>
        );

      case 'apartment':
        return (
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className="bg-blue-50 p-2 rounded">
              <div className="font-semibold text-blue-700">الطابق</div>
              <div>{property.propertyable.floor}</div>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <div className="font-semibold text-green-700">الغرف</div>
              <div>{property.propertyable.rooms}</div>
            </div>
            <div className="bg-yellow-50 p-2 rounded">
              <div className="font-semibold text-yellow-700">غرف النوم</div>
              <div>{property.propertyable.bedrooms}</div>
            </div>
            <div className="bg-purple-50 p-2 rounded">
              <div className="font-semibold text-purple-700">الحمامات</div>
              <div>{property.propertyable.bathrooms}</div>
            </div>
            <div className="bg-red-50 p-2 rounded">
              <div className="font-semibold text-red-700">كراج</div>
              <div>{property.propertyable.has_garage ? 'نعم' : 'لا'}</div>
            </div>
            <div className="bg-indigo-50 p-2 rounded">
              <div className="font-semibold text-indigo-700">مصعد</div>
              <div>{property.propertyable.has_elevator ? 'نعم' : 'لا'}</div>
            </div>
            {property.propertyable.furnished && (
              <>
                <div className="bg-teal-50 p-2 rounded">
                  <div className="font-semibold text-teal-700">مؤثث</div>
                  <div>نعم</div>
                </div>
                <div className="bg-orange-50 p-2 rounded">
                  <div className="font-semibold text-orange-700">نوع التأثيث</div>
                  <div>{getFurnishingTypeText(property.propertyable.furnished_type)}</div>
                </div>
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const filteredAds = Array.isArray(ads) ? ads.filter(ad => {
    if (!ad || !ad.property) return false;
    
    const matchesSearch = 
      (ad.property?.name?.toLowerCase() || '').includes(debouncedSearchTerm.toLowerCase()) ||
      (String(ad.id).includes(searchTerm)|| '');
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && ad.is_active) ||
                         (filterStatus === 'inactive' && !ad.is_active);
    
    return matchesSearch && matchesFilter;
  }) : [];

  const getStatusBadge = (isActive) => {
    const status = isActive ? 'active' : 'paused';
    const statusConfig = {
      active: { text: 'نشط', icon: 'fas fa-play' },
      paused: { text: 'متوقف', icon: 'fas fa-pause' },
    };
    const config = statusConfig[status];
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center ${getStatusBadgeClasses(status)}`}>
        <i className={`${config.icon} ml-1`}></i>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    try {
      return new Date(dateString).toLocaleDateString('ar-EG');
    } catch {
      return 'غير محدد';
    }
  };

  const formatNumber = (number) => {
    return number?.toLocaleString('ar-EG') || '0';
  };

  const formatPrice = (price) => {
    return `${price?.toLocaleString('ar-EG') || '0'} $`;
  };

  const renderAdImage = (ad) => {
    const firstImage = ad.property?.images?.[0]?.image_url;
    
    return (
      <div className="relative h-48 bg-gray-100 overflow-hidden rounded-t-lg cursor-pointer" onClick={() => viewPropertyDetails(ad)}>
        {firstImage ? (
          <img 
            src={firstImage} 
            alt={ad.property?.name || 'إعلان'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="w-full h-full flex items-center justify-center text-gray-400" style={firstImage ? { display: 'none' } : {}}>
          <i className="fas fa-ad text-4xl"></i>
        </div>
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          <i className="fas fa-ad ml-1"></i>
          إعلان
        </div>
      </div>
    );
  };

  const renderAdPerformance = (ad) => {
    return (
      //<div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{formatNumber(ad.views || 0)}</div>
          <div className="text-xs text-gray-500">مشاهدة</div>
        </div>
      //</div>
    );
  };


  const renderPagination = () => {
    if (pagination.last_page <= 1) return null;

    const pages = [];
    const startPage = Math.max(1, pagination.current_page - 2);
    const endPage = Math.min(pagination.last_page, pagination.current_page + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => loadPage(i)}
          className={`px-3 py-1 rounded-lg ${
            pagination.current_page === i
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-6">
        <button
          onClick={() => loadPage(pagination.current_page - 1)}
          disabled={pagination.current_page === 1}
          className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          السابق
        </button>
        {pages}
        <button
          onClick={() => loadPage(pagination.current_page + 1)}
          disabled={pagination.current_page === pagination.last_page}
          className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          التالي
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">جاري تحميل الإعلانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-600 mb-4"></i>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchAds(1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }
  

  return (
    <div className="p-6 fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">إدارة الإعلانات والعقارات</h2>
          <p className="text-gray-600">إدارة الحملات الإعلانية والعقارات المرتبطة بها</p>
        </div>
        <button 
          onClick={() => navigate('/ads/new')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center"
        >
          <i className="fas fa-plus ml-2"></i>
          إنشاء إعلان جديد
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">إجمالي الإعلانات</p>
              <p className="text-2xl font-bold text-blue-800">{pagination.total}</p>
            </div>
            <i className="fas fa-bullhorn text-blue-600 text-2xl"></i>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">الإعلانات النشطة</p>
              <p className="text-2xl font-bold text-green-800">
                {ads.filter(ad => ad.is_active).length}
              </p>
            </div>
            <i className="fas fa-play text-green-600 text-2xl"></i>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">إجمالي المشاهدات</p>
              <p className="text-2xl font-bold text-purple-800">
                {ads.reduce((sum, ad) => sum + (ad.views || 0), 0).toLocaleString()}
              </p>
            </div>
            <i className="fas fa-eye text-purple-600 text-2xl"></i>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث في الإعلانات أو العقارات..." 
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200" 
            />
            <i className="fas fa-search absolute right-3 top-3 text-gray-400"></i>
          </div>
          
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">جميع الإعلانات</option>
            <option value="active">النشطة</option>
            <option value="inactive">غير النشطة</option>
          </select>
        </div>
      </div>

      {/* Ads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAds.map(ad => (
          <div key={ad.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition duration-200">
            {renderAdImage(ad)}
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{ad.property?.name || 'إعلان بدون عنوان'}</h3>
                  <p className="text-sm text-gray-500 mt-1">{ad.id || 'بدون عنوان'}</p>
                </div>
                {getStatusBadge(ad.is_active)}
              </div>

              <div className="mb-4">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <i className="fas fa-calendar-alt ml-1"></i>
                  <span>من: {formatDate(ad.start_date)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <i className="fas fa-calendar-check ml-1"></i>
                  <span>إلى: {formatDate(ad.end_date)}</span>
                </div>
                {renderAdPerformance(ad)}
              </div>
              
              {/* Property Preview مع معلومات المعلن */}
              {renderPropertyPreview(ad)}

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-500">نوع العقار</p>
                  <p className="font-medium text-gray-900">{getPropertyTypeText(ad.property?.type)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">السعر</p>
                  <p className="font-bold text-orange-600">{formatPrice(ad.property?.price)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                <i className="fas fa-ad ml-1"></i>
                الإعلان #{ad.id}
              </div>
              <div className="flex space-x-2 space-x-reverse">
                <button 
                  onClick={() => toggleAdStatus(ad.id)}
                  className="text-blue-600 hover:text-blue-900 transition duration-200 p-1"
                  title={ad.is_active ? 'إيقاف' : 'تشغيل'}
                >
                  <i className={ad.is_active ? 'fas fa-pause' : 'fas fa-play'}></i>
                </button>
                <button 
                  onClick={() => navigate(`/ads/edit/${ad.id}`)}
                  className="text-green-600 hover:text-green-900 transition duration-200 p-1"
                  title="تعديل"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button 
                  onClick={() => viewPropertyDetails(ad)}
                  className="text-purple-600 hover:text-purple-900 transition duration-200 p-1"
                  title="عرض العقار"
                >
                  <i className="fas fa-eye"></i>
                </button>
                <button 
                  onClick={() => handleDeleteAd(ad.id)}
                  className="text-red-600 hover:text-red-900 transition duration-200 p-1"
                  title="حذف"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAds.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <i className="fas fa-bullhorn text-gray-400 text-5xl mb-4"></i>
          <p className="text-gray-500 text-lg">لا توجد إعلانات مطابقة للبحث</p>
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}

      {/* Property Modal */}
      {showPropertyModal && selectedAd && selectedAd.property && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">تفاصيل العقار</h3>
                <button 
                  onClick={closePropertyModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="relative h-64 bg-gray-100 rounded-lg mb-6">
                {selectedAd.property.images?.[0]?.image_url ? (
                  <img 
                    src={selectedAd.property.images[0].image_url} 
                    alt={selectedAd.property.name || 'عقار'}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <i className={`${getPropertyTypeIcon(selectedAd.property.type)} text-4xl`}></i>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">{selectedAd.property.name || 'بدون عنوان'}</h4>
                  <p className="text-gray-600 mb-4">{selectedAd.id || 'بدون عنوان'}</p>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <i className={`${getPropertyTypeIcon(selectedAd.property.type)} ml-2`}></i>
                    <span>{getPropertyTypeText(selectedAd.property.type)}</span>
                  </div>
                  
                  <div className="text-2xl font-bold text-orange-600 mb-4">
                    {formatPrice(selectedAd.property.price)}
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-blue-800">المساحة:</span>
                      <span className="text-blue-600">{selectedAd.property.area || '0'} م²</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-semibold text-gray-800 mb-3">الخصائص</h5>
                  {renderPropertySpecificDetails(selectedAd.property)}
                </div>
              </div>
              
              {selectedAd.property.description && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-semibold text-gray-800 mb-2">وصف العقار</h5>
                  <p className="text-sm text-gray-600">{selectedAd.property.description}</p>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <h5 className="font-semibold text-gray-800 mb-2">معلومات الإعلان</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">الفترة: </span>
                    <span>من {formatDate(selectedAd.start_date)} إلى {formatDate(selectedAd.end_date)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">المشاهدات: </span>
                    <span>{selectedAd.views || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">الحالة: </span>
                    <span className={selectedAd.is_active ? 'text-green-600' : 'text-red-600'}>
                      {selectedAd.is_active ? 'نشط' : 'متوقف'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 space-x-reverse">
              <button 
                onClick={closePropertyModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                إغلاق
              </button>
              <button 
              onClick={() => handleOpenWhatsApp(selectedAd.property.user.phone_number)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                التواصل مع المالك
              </button>
              <button 
              onClick={() => handleCall(selectedAd.property.user.phone_number)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                اتصال مباشر
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdsManagement;