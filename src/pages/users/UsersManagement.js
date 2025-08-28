import React, { useEffect,useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStatusBadgeClasses } from '../../utils/helpers';
import { User } from '../../Contexts/Context';
import axios from 'axios';
const UsersManagement = () => {
  const navigate = useNavigate();
  const context = useContext(User);
  const [users, setUsers] = useState([]);
  const [runUser,setRun] = useState(0);
  useEffect(() => {
        axios.get('https://aqargo.duckdns.org/api/user/getUsers',
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
            let res = await axios.delete(`https://aqargo.duckdns.org/api/user/delete/${id}`,{
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.last_name.toLowerCase().includes(searchTerm.toLocaleLowerCase())||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
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
              <option value="active">المستخدمون النشطون</option>
              <option value="inactive">المستخدمون غير النشطين</option>
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ التسجيل</th>
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
                           src={user.profile?.image_url ?? "/default-avatar.png"} 
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.created_at}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => navigate(`/users/edit/${user.id}`)}
                      className="text-green-600 hover:text-green-900 ml-3 transition duration-200"
                    >
                      تعديل
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
    </div>
  );
};

export default UsersManagement;