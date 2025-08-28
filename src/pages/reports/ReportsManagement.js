import React, { useEffect, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User } from '../../Contexts/Context';

const ReportsManagement = () => {
  const navigate = useNavigate();
  const context = useContext(User);
  const [reports, setReports] = useState([]);
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
  const [filterReason, setFilterReason] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReport, setNewReport] = useState({
    ad_id: '',
    reason: '',
    description: ''
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // أسباب الإبلاغ
  const reportReasons = {
    sexual_content: 'محتوى جنسي',
    harassment: 'مضايقة',
    spam: 'مزعج',
    hate_speech: 'خطاب كراهية',
    violence: 'عنف',
    scam: 'احتيال',
    fake_information: 'معلومات مزيفة',
    other: 'أخرى'
  };

  // Debounce effect للبحث
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // إخفاء رسالة النجاح تلقائياً بعد 3 ثوان
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  // دالة جلب البيانات مع useCallback
  const fetchReports = useCallback(async (page = 1, filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: page,
        ...filters
      };

      const response = await axios.post('https://aqargo.duckdns.org/api/report/index', params, {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + context.auth.token,
        },
      });

      

      if (response.data && response.data.reports) {
        const reportsData = response.data.reports.data;
        const paginationData = response.data.reports;
        
        setReports(reportsData || []);
        setPagination({
          current_page: paginationData.current_page || 1,
          last_page: paginationData.last_page || 1,
          per_page: paginationData.per_page || 10,
          total: paginationData.total || 0
        });
      } else if (response.data && response.data.data) {
        // هيكل بديل للبيانات
        const reportsData = response.data.data.data;
        const paginationData = response.data.data;
        
        setReports(reportsData || []);
        setPagination({
          current_page: paginationData.current_page || 1,
          last_page: paginationData.last_page || 1,
          per_page: paginationData.per_page || 10,
          total: paginationData.total || 0
        });
      } else {
        setError('تنسيق البيانات غير متوقع من الخادم');
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('فشل في تحميل البلاغات: ' + (error.response?.data?.message || error.message));
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [context.auth.token]);

  // التحميل الأولي وتحديث عند تغيير الفلتر
  useEffect(() => {
    fetchReports(1);
  }, [fetchReports]);

  useEffect(() => {
    if (filterReason !== 'all') {
      const filters = { reason: [filterReason] };
      fetchReports(1, filters);
    } else {
      fetchReports(1);
    }
  }, [filterReason, fetchReports]);

  const handleDeleteReport = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا البلاغ؟')) {
      try {
        await axios.delete(`https://aqargo.duckdns.org/api/report/delete/${id}`, {
          headers: {
            Authorization: "Bearer " + context.auth.token,
          },
        });
        
        // إعادة تحميل البيانات بعد الحذف
        fetchReports(pagination.current_page);
        
      } catch (error) {
        console.error('Error deleting report:', error);
        alert('فشل في حذف البلاغ: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleCreateReport = async () => {
    try {
      const response = await axios.post('https://aqargo.duckdns.org/api/report/create', newReport, {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + context.auth.token,
        },
      });

      if (response.data && response.data.report) {
        // إعادة تحميل البيانات بعد الإضافة
        fetchReports(1);
        
        // إغلاق النموذج وإعادة التعيين
        
        setNewReport({
          ad_id: '',
          reason: '',
          description: ''
        });
        
        // إظهار رسالة النجاح
        setShowSuccessMessage(true);
        
      }
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating report:', error);
      alert('فشل في إنشاء البلاغ: ' + (error.response?.data?.message || error.message));
    }
  };

  const viewReportDetails = (report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setSelectedReport(null);
  };

  // دالة للانتقال إلى صفحة الإعلان
  const navigateToAd = (adId) => {
    if (adId) {
      navigate(`/ads/${adId}`);
    } else {
      alert('لا يمكن العثور على الإعلان');
    }
  };

  const loadPage = (page) => {
    const filters = {};
    
    if (filterReason !== 'all') {
      filters.reason = [filterReason];
    }
    
    fetchReports(page, filters);
  };

  const applyFilters = () => {
    const filters = {};
    
    if (filterReason !== 'all') {
      filters.reason = [filterReason];
    }
    
    if (debouncedSearchTerm) {
      // يمكن إضافة البحث هنا إذا كان المدعوم من الخادم
    }
    
    fetchReports(1, filters);
  };

  const getReasonBadge = (reason) => {
    const reasonClasses = {
      sexual_content: 'bg-pink-100 text-pink-800',
      harassment: 'bg-red-100 text-red-800',
      spam: 'bg-yellow-100 text-yellow-800',
      hate_speech: 'bg-purple-100 text-purple-800',
      violence: 'bg-orange-100 text-orange-800',
      scam: 'bg-cyan-100 text-cyan-800',
      fake_information: 'bg-blue-100 text-blue-800',
      other: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${reasonClasses[reason] || 'bg-gray-100 text-gray-800'}`}>
        {reportReasons[reason] || reason}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    try {
      return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'غير محدد';
    }
  };

  // البحث على جانب العميل
  const filteredReports = Array.isArray(reports) ? reports.filter(report => {
    if (!report) return false;
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    const matchesSearch = 
      (report.description?.toLowerCase() || '').includes(searchLower) ||
      (report.user?.first_name?.toLowerCase() || '').includes(searchLower) ||
      (report.user?.last_name?.toLowerCase() || '').includes(searchLower) ||
      (report.ad_id?.toString() || '').includes(debouncedSearchTerm) ||
      (report.id?.toString() || '').includes(debouncedSearchTerm);
    
    const matchesFilter = filterReason === 'all' || report.reason === filterReason;
    
    return matchesSearch && matchesFilter;
  }) : [];

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
          <p className="text-gray-600">جاري تحميل البلاغات...</p>
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
            onClick={() => fetchReports(1)}
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
      {/* رسالة النجاح */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center">
          <i className="fas fa-check-circle ml-2"></i>
          <span>تم إنشاء البلاغ بنجاح</span>
          <button 
            onClick={() => setShowSuccessMessage(false)}
            className="text-green-700 hover:text-green-900 mr-2"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">إدارة البلاغات</h2>
          <p className="text-gray-600">إدارة البلاغات المقدمة على الإعلانات</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center"
        >
          <i className="fas fa-plus ml-2"></i>
          إنشاء بلاغ جديد
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">إجمالي البلاغات</p>
              <p className="text-2xl font-bold text-blue-800">{pagination.total}</p>
            </div>
            <i className="fas fa-flag text-blue-600 text-2xl"></i>
          </div>
        </div>
        
        {Object.entries(reportReasons).map(([key, value]) => (
          <div key={key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{value}</p>
                <p className="text-2xl font-bold text-gray-800">
                  {reports.filter(report => report.reason === key).length}
                </p>
              </div>
              <i className="fas fa-exclamation-circle text-gray-600 text-2xl"></i>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث في البلاغات (اسم المستخدم، وصف البلاغ، رقم الإعلان)..." 
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200" 
            />
            <i className="fas fa-search absolute right-3 top-3 text-gray-400"></i>
          </div>
          
          <div className="flex space-x-2 space-x-reverse">
            <select 
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع البلاغات</option>
              {Object.entries(reportReasons).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
            
            <button 
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              تطبيق
            </button>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المستخدم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الإعلان</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">سبب البلاغ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.length > 0 ? (
                filteredReports.map(report => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {report.user?.profile?.image_url ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={report.user.profile.image_url} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <i className="fas fa-user text-gray-400"></i>
                            </div>
                          )}
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900">
                            {report.user?.first_name} {report.user?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{report.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{report.ad_id}</div>
                      <div className="text-sm text-gray-500">{report.ad?.is_active ? 'نشط' : 'غير نشط'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getReasonBadge(report.reason)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(report.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 space-x-reverse justify-end">
                        <button 
                          onClick={() => viewReportDetails(report)}
                          className="text-blue-600 hover:text-blue-900 transition duration-200 p-1"
                          title="عرض التفاصيل"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          onClick={() => handleDeleteReport(report.id)}
                          className="text-red-600 hover:text-red-900 transition duration-200 p-1"
                          title="حذف"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    لا توجد بلاغات مطابقة للبحث
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {renderPagination()}

      {/* Report Details Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">تفاصيل البلاغ #{selectedReport.id}</h3>
                <button 
                  onClick={closeReportModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">المستخدم الذي أبلغ</h4>
                  <div className="flex items-center">
                    {selectedReport.user?.profile?.image_url ? (
                      <img 
                        src={selectedReport.user.profile.image_url} 
                        alt={selectedReport.user.first_name} 
                        className="w-12 h-12 rounded-full object-cover ml-3"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center ml-3">
                        <i className="fas fa-user text-gray-400"></i>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedReport.user?.first_name} {selectedReport.user?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{selectedReport.user?.email}</p>
                      <p className="text-sm text-gray-500">{selectedReport.user?.phone_number}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">الإعلان المبلغ عنه</h4>
                  <div>
                    <p className="font-medium text-gray-900">رقم الإعلان: #{selectedReport.ad_id}</p>
                    <p className="text-sm text-gray-500">الحالة: {selectedReport.ad?.is_active ? 'نشط' : 'غير نشط'}</p>
                    <p className="text-sm text-gray-500">المشاهدات: {selectedReport.ad?.views || 0}</p>
                    <p className="text-sm text-gray-500">
                      الفترة: من {formatDate(selectedReport.ad?.start_date)} إلى {formatDate(selectedReport.ad?.end_date)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">سبب البلاغ</h4>
                <div className="mb-4">{getReasonBadge(selectedReport.reason)}</div>
                
                {selectedReport.description && (
                  <>
                    <h4 className="font-semibold text-gray-800 mb-2">وصف البلاغ</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">{selectedReport.description}</p>
                    </div>
                  </>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">معلومات إضافية</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">رقم البلاغ: </span>
                    <span>#{selectedReport.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">تاريخ الإنشاء: </span>
                    <span>{formatDate(selectedReport.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">تاريخ التحديث: </span>
                    <span>{formatDate(selectedReport.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 space-x-reverse">
              <button 
                onClick={closeReportModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                إغلاق
              </button>
              <button 
                onClick={() => navigateToAd(selectedReport.ad_id)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <i className="fas fa-external-link-alt ml-2"></i>
                عرض الإعلان
              </button>
              <button 
                onClick={() => handleDeleteReport(selectedReport.id)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                حذف البلاغ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">إنشاء بلاغ جديد</h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الإعلان</label>
                <input 
                  type="number" 
                  value={newReport.ad_id}
                  onChange={(e) => setNewReport({...newReport, ad_id: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل رقم الإعلان"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">سبب البلاغ</label>
                <select 
                  value={newReport.reason}
                  onChange={(e) => setNewReport({...newReport, reason: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر السبب</option>
                  {Object.entries(reportReasons).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">وصف البلاغ (اختياري)</label>
                <textarea 
                  value={newReport.description}
                  onChange={(e) => setNewReport({...newReport, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="أدخل وصفًا تفصيليًا للبلاغ"
                ></textarea>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 space-x-reverse">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button 
                onClick={handleCreateReport}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={!newReport.ad_id || !newReport.reason}
              >
                إنشاء البلاغ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;