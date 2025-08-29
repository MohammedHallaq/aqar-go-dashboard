import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User } from '../../Contexts/Context';
import { URL } from '../../utils/constants';
const BlocksManagement = () => {
  const navigate = useNavigate();
  const context = useContext(User);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
// أضف هذه الحالات إلى مكونك
const [showBlockModal, setShowBlockModal] = useState(false);
const [userToBlock, setUserToBlock] = useState({
  email: '',
  reason: '',
  days: ''
});

// دالة لفتح مودال الحظر مع بيانات المستخدم
const openBlockModal = (userEmail) => {
  setUserToBlock({
    email: userEmail,
    reason: '',
    days: ''
  });
  setShowBlockModal(true);
};

// دالة لحظر المستخدم
const handleBlockUser = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(URL+'api/block/create', userToBlock, {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + context.auth.token,
      },
    });

    if (response.data.code === 200) {
      setShowBlockModal(false);
      setUserToBlock({ email: '', reason: '', days: '' });
      // يمكنك إضافة أي تحديثات إضافية هنا إذا لزم الأمر
    }
  } catch (error) {
    console.error('Error blocking user:', error);
    alert('حدث خطأ أثناء الحظر');
  }
};

  // جلب قائمة المحظورين
  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(URL+'api/block/index', {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + context.auth.token,
        },
      });

      if (response.data.status === 1) {
        setBlocks(response.data.data.data);
      }
    } catch (error) {
      console.error('Error fetching blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  // تصفية المحظورين حسب البحث
  const filteredBlocks = blocks.filter(block =>
    block.blocked.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    block.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBlocks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBlocks.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);


  // فك حظر مستخدم
  const handleUnblockUser = async (blockId) => {
    if (window.confirm('هل أنت متأكد من فك حظر هذا المستخدم؟')) {
      try {
        const response = await axios.delete(`http://116.203.254.150:8001/api/block/unblock/${blockId}`, {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + context.auth.token,
          },
        });

        if (response.data.status === 1) {
          fetchBlocks();
        }
      } catch (error) {
        console.error('Error unblocking user:', error);
        alert('حدث خطأ أثناء فك الحظر');
      }
    }
  };

  // الانتقال إلى صفحة التعديل
  const handleEditBlock = (blockId) => {
    navigate(`/blocks/edit/${blockId}`);
  };

  // حساب تاريخ الانتهاء بناءً على مدة الحظر
  const calculateEndDate = (startDate, days) => {
    if (!days) return null;
    const start = new Date(startDate);
    start.setDate(start.getDate() + parseInt(days));
    return start;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">جاري تحميل ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">إدارة المحظورين</h1>
              <p className="text-gray-600 mt-1">إدارة حسابات المستخدمين المحظورة في النظام</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <div className="relative">
                <input
                  type="text"
                  className="w-full md:w-64 px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="ابحث في المحظورين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المحظورين</p>
                <p className="text-2xl font-bold text-gray-800">{blocks.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الحظر الدائم</p>
                <p className="text-2xl font-bold text-gray-800">
                  {blocks.filter(block => block.days).length}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الحظر المؤقت</p>
                <p className="text-2xl font-bold text-gray-800">
                  {blocks.filter(block => !block.days).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الصفحة الحالية</p>
                <p className="text-2xl font-bold text-gray-800">{currentPage}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحاظر</th>
                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المحظور</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">سبب الحظر</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">مدة الحظر</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الحظر</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الإنتهاء</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map(block => {
                    // حساب مدة الحظر بالأيام
                    const days = block.days || Math.ceil((new Date(block.end_date) - new Date(block.start_date)) / (1000 * 60 * 60 * 24));
                    const endDate = block.end_date ? new Date(block.end_date) : null;
                    
                    return (
                      <tr key={block.id} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {block.blocker?.profile?.image_url ? (
                                <img 
                                    src={block.blocker.profile.image_url?.replace("http://116.203.254.150:8001", "https://aqargo.duckdns.org")} 
                                    alt={block.blocker.first_name} 
                                    className="w-12 h-12 rounded-full object-cover ml-3"
                                />
                                ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center ml-3">
                                    <i className="fas fa-user text-gray-400"></i>
                                </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{block.blocker.first_name}{block.blocker.last_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {block.blocked?.profile?.image_url ? (
                                <img 
                                    src={block.blocked.profile.image_url?.replace("http://116.203.254.150:8001", "https://aqargo.duckdns.org")} 
                                    alt={block.blocked.first_name} 
                                    className="w-12 h-12 rounded-full object-cover ml-3"
                                />
                                ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center ml-3">
                                    <i className="fas fa-user text-gray-400"></i>
                                </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{block.blocked.first_name}{block.blocked.last_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {block.reason || 'بدون سبب محدد'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            endDate ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {endDate ? `${days} يوم` : 'دائم'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(block.start_date).toLocaleDateString('ar-SA')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {endDate ? endDate.toLocaleDateString('ar-SA') : 'دائم'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2 space-x-reverse justify-end">
                            {/* <button
                              onClick={() => handleEditBlock(block.id)}
                              className="text-yellow-600 hover:text-yellow-900 transition duration-200 p-1"
                              title="تعديل الحظر"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button> */}
                            <button
                              onClick={() => handleUnblockUser(block.id)}
                              className="text-green-600 hover:text-green-900 transition duration-200 p-1"
                              title="فك الحظر"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">لا توجد حسابات محظورة</h3>
                        <p className="mt-2 text-gray-500">لم يتم العثور على أي حسابات محظورة تطابق معايير البحث الخاصة بك</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  عرض <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> إلى{' '}
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredBlocks.length)}</span> من{' '}
                  <span className="font-medium">{filteredBlocks.length}</span> نتائج
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition duration-200"
                  >
                    السابق
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => paginate(index + 1)}
                      className={`px-3 py-1 rounded-lg ${
                        currentPage === index + 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      } transition duration-200`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition duration-200"
                  >
                    التالي
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Block User Modal */}
      {showBlockModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-md w-full">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">حظر مستخدم</h3>
          <button
            onClick={() => setShowBlockModal(false)}
            className="text-gray-400 hover:text-gray-600 transition duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <form onSubmit={handleBlockUser}>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              id="email"
              value={userToBlock.email}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>
          
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              سبب الحظر (اختياري)
            </label>
            <textarea
              id="reason"
              rows="3"
              value={userToBlock.reason}
              onChange={(e) => setUserToBlock({...userToBlock, reason: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              placeholder="أدخل سبب الحظر..."
            />
          </div>
          
          <div>
            <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-1">
              مدة الحظر (أيام)
            </label>
            <input
              type="number"
              id="days"
              value={userToBlock.days}
              onChange={(e) => setUserToBlock({...userToBlock, days: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              placeholder="اتركه فارغاً للحظر الدائم"
              min="1"
            />
            <p className="mt-1 text-sm text-gray-500">اترك الحقل فارغاً للحظر الدائم</p>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 space-x-reverse">
          <button
            type="button"
            onClick={() => setShowBlockModal(false)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 flex items-center"
          >
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            حظر المستخدم
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
};

export default BlocksManagement;