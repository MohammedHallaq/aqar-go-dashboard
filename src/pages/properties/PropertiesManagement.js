import React, {useContext, useEffect ,useState } from 'react';
import { data, useNavigate } from 'react-router-dom';
import { getStatusBadgeClasses } from '../../utils/helpers';
import axios from 'axios';
import { User } from '../../Contexts/Context';
const PropertiesManagement = () => {
  const navigate = useNavigate();
  const context = useContext(User);
  const runProperty =useState(0);
  const [properties, setProperties] = useState([
    { 
      id: 1, 
      title: 'شقة فاخرة في الرياض', 
      type: 'شقة', 
      price: 500000, 
      owner: 'سارة أحمد', 
      status: 'active',
      location: 'الرياض - حي النرجس',
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      date: '2024-01-15',
      hasParking: true,
      hasFurniture: true,
      floor: 2,
      meetings: 1,
      images: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg'
      ]
    },
    { 
      id: 2, 
      title: 'محل تجاري في جدة', 
      type: 'محل', 
      price: 1200000, 
      owner: 'محمد علي', 
      status: 'inactive',
      location: 'جدة - حي الروضة',
      bedrooms: 0,
      bathrooms: 1,
      area: 80,
      date: '2024-01-10',
      shopType: 'تجاري',
      hasWarehouse: true,
      hasElectricity: true,
      floor: 1,
      images: [
        'https://example.com/image3.jpg'
      ]
    },
    { 
      id: 3, 
      title: 'قطعة أرض سكنية', 
      type: 'قطعة أرض', 
      price: 180000, 
      owner: 'أحمد محمد', 
      status: 'sold',
      location: 'الدمام - الكورنيش',
      bedrooms: 0,
      bathrooms: 0,
      area: 500,
      date: '2024-01-08',
      landType: 'سكني',
      isServiced: false,
      inMasterPlan: false,
      slope: 'مسطحة',
      images: []
    }
  ]);
  
  
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleStatusChange = (id, newStatus) => {
    setProperties(properties.map(prop => 
      prop.id === id ? { ...prop, status: newStatus } : prop
    ));
  };

  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العقار؟')) {
      setProperties(properties.filter(prop => prop.id !== id));
    }
  };

  const filteredProperties = properties.filter(prop => {
    const matchesSearch = prop.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prop.owner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prop.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || prop.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { text: 'نشط', icon: 'fas fa-check-circle' },
      inactive: { text: 'غير نشط', icon: 'fas fa-pause-circle' },
      sold: { text: 'تم البيع', icon: 'fas fa-tag' },
      rented: { text: 'تم التأجير', icon: 'fas fa-key' }
    };
    const config = statusConfig[status] || { text: status, icon: 'fas fa-circle' };
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center ${getStatusBadgeClasses(status)}`}>
        <i className={`${config.icon} ml-1`}></i>
        {config.text}
      </span>
    );
  };

  const getPropertyTypeIcon = (type) => {
    const icons = {
      'شقة': 'fas fa-building',
      'محل': 'fas fa-store',
      'مكتب': 'fas fa-briefcase',
      'قطعة أرض': 'fas fa-map-marked-alt',
      'فيلا': 'fas fa-home',
      'استوديو': 'fas fa-door-open'
    };
    return icons[type] || 'fas fa-home';
  };

  const formatPrice = (price) => {
    return `${price.toLocaleString()} $`;
  };

  const renderPropertyDetails = (property) => {
    switch(property.type) {
      case 'شقة':
        return (
          <>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <i className="fas fa-layer-group ml-1"></i>
              <span>الطابق: {property.floor}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <i className="fas fa-bed ml-1"></i>
              <span>الغرف: {property.bedrooms}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <i className="fas fa-bath ml-1"></i>
              <span>الحمامات: {property.bathrooms}</span>
            </div>
            {property.hasParking && (
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <i className="fas fa-car ml-1"></i>
                <span>موقف سيارات: نعم</span>
              </div>
            )}
            {property.hasFurniture && (
              <div className="flex items-center text-sm text-gray-600">
                <i className="fas fa-couch ml-1"></i>
                <span>مؤثثة: نعم</span>
              </div>
            )}
          </>
        );
      case 'محل':
        return (
          <>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <i className="fas fa-tag ml-1"></i>
              <span>النوع: {property.shopType}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <i className="fas fa-layer-group ml-1"></i>
              <span>الطابق: {property.floor}</span>
            </div>
            {property.hasWarehouse && (
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <i className="fas fa-warehouse ml-1"></i>
                <span>يحتوي على مستودع</span>
              </div>
            )}
            {property.hasElectricity && (
              <div className="flex items-center text-sm text-gray-600">
                <i className="fas fa-bolt ml-1"></i>
                <span>يوجد مصدر كهرباء</span>
              </div>
            )}
          </>
        );
      case 'قطعة أرض':
        return (
          <>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <i className="fas fa-tag ml-1"></i>
              <span>النوع: {property.landType}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <i className="fas fa-sliders-h ml-1"></i>
              <span>الميل: {property.slope}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <i className="fas fa-tools ml-1"></i>
              <span>خدمات: {property.isServiced ? 'نعم' : 'لا'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <i className="fas fa-map-marked ml-1"></i>
              <span>ضمن المخطط: {property.inMasterPlan ? 'نعم' : 'لا'}</span>
            </div>
          </>
        );
      default:
        return (
          <>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <i className="fas fa-bed ml-1"></i>
              <span>الغرف: {property.bedrooms}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <i className="fas fa-bath ml-1"></i>
              <span>الحمامات: {property.bathrooms}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <i className="fas fa-ruler-combined ml-1"></i>
              <span>المساحة: {property.area} م²</span>
            </div>
          </>
        );
    }
  };

  const renderImageGallery = (images) => {
    if (images.length === 0) {
      return (
        <div className="bg-gray-100 h-48 flex items-center justify-center text-gray-400">
          <i className="fas fa-image text-4xl"></i>
          <span className="mr-2">لا توجد صور</span>
        </div>
      );
    }

    return (
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img 
          src={images[0]} 
          alt="Property" 
          className="w-full h-full object-cover"
        />
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            <i className="fas fa-images ml-1"></i>
            {images.length} صورة
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">إدارة العقارات</h2>
          <p className="text-gray-600">عرض وتعديل العقارات المنشورة</p>
        </div>
        
        <div className="flex space-x-2 space-x-reverse">
          <button 
            onClick={() => navigate('/properties/new')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center"
          >
            <i className="fas fa-plus ml-2"></i>
            إضافة عقار جديد
          </button>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">جميع العقارات</option>
            <option value="active">نشطة</option>
            <option value="inactive">غير نشطة</option>
            <option value="sold">تم البيع</option>
            <option value="rented">تم التأجير</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative">
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث في العقارات..." 
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200" 
          />
          <i className="fas fa-search absolute right-3 top-3 text-gray-400"></i>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map(property => (
          <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition duration-200">
            {renderImageGallery(property.images)}
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center">
                    <i className={`${getPropertyTypeIcon(property.type)} text-blue-600 text-xl ml-2`}></i>
                    <h3 className="text-lg font-semibold text-gray-800">{property.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{property.location}</p>
                </div>
                {getStatusBadge(property.status)}
              </div>

              <div className="mb-4">
                {renderPropertyDetails(property)}
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-500">المالك</p>
                  <p className="font-medium">{property.owner}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">السعر</p>
                  <p className="font-bold text-blue-600">{formatPrice(property.price)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                <i className="far fa-calendar-alt ml-1"></i>
                {new Date(property.date).toLocaleDateString('ar-EG')}
              </div>
              <div className="flex space-x-2 space-x-reverse">
                <select
                  value={property.status}
                  onChange={(e) => handleStatusChange(property.id, e.target.value)}
                  className="text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="sold">تم البيع</option>
                  <option value="rented">تم التأجير</option>
                </select>
                
                <button 
                  onClick={() => navigate(`/properties/edit/${property.id}`)}
                  className="text-blue-600 hover:text-blue-900 transition duration-200 p-1"
                  title="تعديل"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button 
                  className="text-purple-600 hover:text-purple-900 transition duration-200 p-1"
                  title="عرض التفاصيل"
                >
                  <i className="fas fa-eye"></i>
                </button>
                <button 
                  onClick={() => handleDelete(property.id)}
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

      {filteredProperties.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <i className="fas fa-home text-gray-400 text-5xl mb-4"></i>
          <p className="text-gray-500 text-lg">لا توجد عقارات مطابقة للبحث</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">إجمالي العقارات</p>
              <p className="text-2xl font-bold text-blue-800">{properties.length}</p>
            </div>
            <i className="fas fa-home text-blue-600 text-2xl"></i>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">عقارات نشطة</p>
              <p className="text-2xl font-bold text-green-800">
                {properties.filter(p => p.status === 'active').length}
              </p>
            </div>
            <i className="fas fa-check-circle text-green-600 text-2xl"></i>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">تم البيع</p>
              <p className="text-2xl font-bold text-yellow-800">
                {properties.filter(p => p.status === 'sold').length}
              </p>
            </div>
            <i className="fas fa-tag text-yellow-600 text-2xl"></i>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">تم التأجير</p>
              <p className="text-2xl font-bold text-purple-800">
                {properties.filter(p => p.status === 'rented').length}
              </p>
            </div>
            <i className="fas fa-key text-purple-600 text-2xl"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesManagement;