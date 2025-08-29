import React, { useEffect,useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStatusBadgeClasses } from '../../utils/helpers';
import { User } from '../../Contexts/Context';
import { URL, USER_ROLES } from '../../utils/constants';
import axios from 'axios';
const UsersManagement = () => {
  const navigate = useNavigate();
  const context = useContext(User);
  const [users, setUsers] = useState([]);
  const [runUser,setRun] = useState(0);
  const[showRoleModal,setShowRoleModal] = useState(false);
  const [assignUserRole,setAssignUserRole] = useState();
  useEffect(() => {
        axios.get(URL+'api/user/getUsers',
            {
                headers:{
                    Accept:"application/json",
                    Authorization:"Bearer" + context.auth.token,
                },
            }
        )
        .then((data) => setUsers(data.data.data)).catch((err) => console.log(err))
    },[runUser]);
    async function deleteUser(id){
        try{
            let res = await axios.delete(URL+`api/user/delete/${id}`,{
                headers:{
                    Accept:"application/json",
                    Authorization:"Bearer" + context.auth.token,
                },
            });
            if(res.status === 200){
                setRun((prev) => prev + 1);
            }
        }catch{
            console.log("none");
        }
    }
    // دالة لفتح مودال الدور مع بيانات المستخدم
const openRoleModal = (user_id) => {
  setAssignUserRole({
    user_id: user_id,
    role_id: '',
  });
  setShowRoleModal(true);
};

// دالة تعديل دور المستخدم
const handleRoleUser = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(URL+'api/user/assignUserRole', assignUserRole, {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + context.auth.token,
      },
    });

    if (response.data.status === 1) {
      setShowRoleModal(false);
      setAssignUserRole({user_id: '',role_id: ''});
      setRun((prev) => prev + 1)
      // يمكنك إضافة أي تحديثات إضافية هنا إذا لزم الأمر
    }
  } catch (error) {
    console.error('Error roleing user:', error);
    alert('حدث خطأ أثناء تعديل الدور');
  }
};
const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAssignUserRole(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.last_name?.toLowerCase().includes(searchTerm.toLocaleLowerCase())||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.role_name?.includes(filterStatus);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">إدارة المستخدمين</h2>
          <p className="text-gray-600">إدارة حسابات المستخدمين والصلاحيات</p>
        </div>
        <button 
          onClick={() => navigate('/users/new')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center"
        >
          <i className="fas fa-plus ml-2"></i>
          إضافة مستخدم
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="البحث عن مستخدم..." 
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200" 
              />
              <i className="fas fa-search absolute right-3 top-3 text-gray-400"></i>
            </div>
            
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع المستخدمين</option>
              <option value="client">العملاء</option>
              <option value="premium_client">العملاء المميزون</option>
              <option value="admin">المدراء</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase"> </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم الأول</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم الثاني</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">البريد الإلكتروني</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الهاتف</th>
                {/* <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ التسجيل</th> */}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الدور</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user , index) => (
                <tr key={index} className="hover:bg-gray-50 transition duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1 }</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                     {user.profile?.image_url && 
                        <img 
                           src={user.profile?.image_url?.replace("http://116.203.254.150:8001", "https://aqargo.duckdns.org") ?? "/default-avatar.png"} 
                          alt="Profile" 
                          className="w-12 h-12 rounded-full object-cover ml-3"
                        /> 
                        ||
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center ml-3">
                        <i className="fas fa-user text-gray-600 text-sm"></i>
                        </div>}
                        <span className="text-sm font-medium text-gray-500">{user.first_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8   flex items-center justify-center ml-3">
                      </div>
                      <span className="text-sm font-medium text-gray-500">{user.last_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone_number}</td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.created_at}</td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => openRoleModal(user.id)}
                      className="text-green-600 hover:text-green-900 ml-3 transition duration-200"
                    >
                       تعديل الدور
                    </button>
                    <button 
                      onClick={() => deleteUser(user.id)}
                      className="text-red-600 hover:text-red-900 transition duration-200"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <i className="fas fa-users text-gray-400 text-4xl mb-4"></i>
            <p className="text-gray-500">لا توجد نتائج مطابقة للبحث</p>
          </div>
        )}
      </div>
      {/* Role User Modal */}
      {showRoleModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-md w-full">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">حظر مستخدم</h3>
          <button
            onClick={() => setShowRoleModal(false)}
            className="text-gray-400 hover:text-gray-600 transition duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <form onSubmit={handleRoleUser}>
        <div className="p-6 space-y-4">
            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الدور
              </label>
              <select
                name="role_id"
                value={assignUserRole.role_id}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
              >
                <option value={''}></option>
                <option value={USER_ROLES.CLIENT}>عميل</option>
                <option value={USER_ROLES.PREMIUM_CLIENT}>عميل مميز</option>
                <option value={USER_ROLES.ADMIN}>مدير</option>
              </select>
            </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 space-x-reverse">
          <button
            type="button"
            onClick={() => setShowRoleModal(false)}
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
            تعديل الدور
          </button>
        </div>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
};

export default UsersManagement;