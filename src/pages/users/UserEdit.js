import React, { useContext,useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { USER_ROLES } from '../../utils/constants';
import { isValidEmail, isValidSaudiPhone } from '../../utils/helpers';
import { User } from '../../Contexts/Context';
import axios from 'axios';
const UserEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const context = useContext(User);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    password_confirmation: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      axios(`https://aqargo.duckdns.org/api/user/show/${id}`,{
                headers:{
                    Accept:"application/json",
                    Authorization:"Bearer" + context.auth.token,
                },
            })
            .then((user) => {
                const userData = {
        id:id,
        first_name: user.data.data.first_name,
        last_name: user.data.data.last_name,
        email: user.data.data.email,
        phone_number:user.data.data.phone_number,
      };
      setFormData(userData);
      });
    }
  }, [isEditing]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'الاسم الأول مطلوب';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'الاسم الثاني مطلوب';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'رقم الهاتف مطلوب';
    } else if (!isValidSaudiPhone(formData.phone_number)) {
      newErrors.phone_number = 'رقم الهاتف غير صحيح';
    }

      if (!formData.password) {
        newErrors.password = 'كلمة المرور مطلوبة';
      } else if (formData.password.length < 8) {
        newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      }

      if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = 'كلمة المرور غير متطابقة';
      }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const url = isEditing 
  ? `https://aqargo.duckdns.org/api/user/update/${id}` 
  : `https://aqargo.duckdns.org/api/user/create`;
  async function Submit(e) {
        e.preventDefault();
        if (!validateForm()) {
      return;
    }
    setIsLoading(true);
        try{
            let res = await axios
            .post(url,formData,{
                headers:{
                    Accept:"application/json",
                    Authorization:"Bearer" + context.auth.token,
                },
            });
            setIsLoading(false);
            navigate('/users');
            console.log(res);
        } catch(err){
            }
    }
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="p-6 fade-in">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => navigate('/users')}
            className="text-gray-600 hover:text-gray-800 ml-4"
          >
            <i className="fas fa-arrow-right text-xl"></i>
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
          </h2>
        </div>
        <p className="text-gray-600">
          {isEditing ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد إلى النظام'}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={Submit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/*  First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم الأول
              </label>
              <input
                type="text"
                name='first_name'
                value={formData.first_name || ""}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                  errors.first_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="أدخل الاسم الأول"
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
              )}
            </div>
            {/*  Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الثاني
              </label>
              <input
                type="text"
                name='last_name'
                value={formData.last_name || ""}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                  errors.last_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="أدخل الاسم الثاني"
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
              )}
            </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني 
              </label>
              <input
                type="email"
                name='email'
                value={formData.email || ""}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="أدخل البريد الإلكتروني"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف 
              </label>
              <input
                type="tel"
                name='phone_number'
                value={formData.phone_number || ""}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                  errors.phone_number ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="أدخل رقم الهاتف"
              />
              {errors.phone_number && (
                <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الدور
              </label>
              <select
                name="role"
                value={formData.role || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
              >
                <option value={USER_ROLES.USER}>مستخدم</option>
                <option value={USER_ROLES.MODERATOR}>مشرف</option>
                <option value={USER_ROLES.ADMIN}>مدير</option>
              </select>
            </div>

            {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    كلمة المرور 
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password || ""}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="أدخل كلمة المرور"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تأكيد كلمة المرور 
                  </label>
                  <input
                    type="password"
                    name="password_confirmation"
                    value={formData.password_confirmation || ""}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                      errors.password_confirmation ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="أعد إدخال كلمة المرور"
                  />
                  {errors.password_confirmation && (
                    <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                  )}
                </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 space-x-reverse mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/users')}
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
              {isEditing ? 'تحديث المستخدم' : 'إضافة المستخدم'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEdit;