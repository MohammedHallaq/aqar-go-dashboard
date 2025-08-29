import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { User } from '../../Contexts/Context';
import { URL } from '../../utils/constants';

const BlockCreate = () => {
  const navigate = useNavigate();
  const context = useContext(User);
  const [saving, setSaving] = useState(false);
  const { blocked_id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [block, setBlock] = useState({
    blocked_id: blocked_id,
    reason: '',
    days: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get(URL + `api/user/show/${blocked_id}`, {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + context.auth.token,
          },
        });
        
        if (response.data.status === 1) {
          setUser(response.data.data);
        } else {
          setError('لم يتم العثور على المستخدم');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('حدث خطأ أثناء جلب بيانات المستخدم');
      } finally {
        setLoading(false);
      }
    };

    if (blocked_id) {
      fetchUser();
    }
  }, [blocked_id, context.auth.token]);

  // إنشاء حظر جديد
  const handleCreateBlock = async (e) => {
    e.preventDefault();
    
    if (!block.blocked_id) {
      setError('معرف المستخدم غير موجود');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const requestData = {
        blocked_id: block.blocked_id,
        reason: block.reason || null,
        days: block.days ? parseInt(block.days) : null
      };

      const response = await axios.post(URL + 'api/block/create', requestData, {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + context.auth.token,
        },
      });

      if (response.data.status === 1) {
        alert('تم حظر المستخدم بنجاح');
        navigate('/blocks');
      }
    } catch (error) {
      console.error('Error creating block:', error);
      if (error.response?.data?.message) {
        if (error.response.data.message.includes('Validation Error') || 
            error.response.data.message.includes('unique')) {
          setError('هذا المستخدم محظور مسبقاً في النظام');
        } else {
          setError(error.response.data.message);
        }
      } else {
        setError('حدث خطأ أثناء إنشاء الحظر');
      }
    } finally {
      setSaving(false);
    }
  };

  // العودة إلى القائمة
  const handleBack = () => {
    navigate('/blocks');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">جاري تحميل بيانات المستخدم...</span>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">خطأ</h3>
              <p className="mt-2 text-gray-500">{error}</p>
              <button
                onClick={handleBack}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                العودة إلى القائمة
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">حظر مستخدم جديد</h1>
              <p className="text-gray-600 mt-1">إضافة مستخدم جديد إلى قائمة المحظورين في النظام</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <button 
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition duration-200 flex items-center justify-center"
                onClick={handleBack}
              >
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                العودة إلى القائمة
              </button>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">معلومات الحظر</h2>
            <p className="text-sm text-gray-600">املأ البيانات التالية لحظر مستخدم جديد</p>
          </div>
          
          <form onSubmit={handleCreateBlock} className="p-6">
            {/* عرض رسالة الخطأ إذا كانت موجودة */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">خطأ</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 h-12 w-12">
                  {user?.profile?.image_url ? (
                    <img 
                      className="h-12 w-12 rounded-full object-cover" 
                      src={user.profile.image_url.replace("http://116.203.254.150:8001", "https://aqargo.duckdns.org")} 
                      alt={`${user.first_name} ${user.last_name}`} 
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <i className="fas fa-user text-gray-400 text-xl"></i>
                    </div>
                  )}
                </div>
                <div className="mr-4">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.first_name} {user?.last_name}
                  </div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                  <div className="text-xs text-gray-400 mt-1">ID: {user?.id}</div>
                </div>
              </div>
              
              <div>
                <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-2">
                  مدة الحظر (أيام)
                </label>
                <input
                  type="number"
                  id="days"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  value={block.days}
                  onChange={(e) => setBlock({...block, days: e.target.value})}
                  placeholder="اتركه فارغاً للحظر الدائم"
                  min="1"
                />
                <p className="mt-1 text-sm text-gray-500">اترك الحقل فارغاً للحظر الدائم</p>
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                سبب الحظر (اختياري)
              </label>
              <textarea
                id="reason"
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                value={block.reason}
                onChange={(e) => setBlock({...block, reason: e.target.value})}
                placeholder="أدخل سبب الحظر..."
              ></textarea>
            </div>

            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">معلومات مهمة</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>• بعد إنشاء الحظر، سيتم منع المستخدم من الوصول إلى النظام حسب المدة المحددة.</p>
                    <p>• يمكنك ترك حقل المدة فارغاً للحظر الدائم.</p>
                    <p>• يرجى التأكد من صحة البريد الإلكتروني قبل الحظر.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3 space-x-reverse">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                disabled={saving}
              >
                إلغاء
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 flex items-center"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    حظر المستخدم
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlockCreate;