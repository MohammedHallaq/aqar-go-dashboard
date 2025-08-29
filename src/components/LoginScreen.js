import React, { useContext, useState } from 'react';
import axios from "axios";
import { User } from "../Contexts/Context";
import { useNavigate } from "react-router-dom";
import { URL } from '../utils/constants';
const LoginScreen = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [unauthorized, setUnauthorized] = useState(false);
  const navigate = useNavigate();
  const userNow = useContext(User);

  async function Submit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      let res = await axios.post(URL+'api/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      if (res.status === 200) {
        userNow.setAuth(res.data.data);
        navigate("/dashboard");
      }
    } catch (err) {
      setUnauthorized(true)
        setError( err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md fade-in">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-building text-white text-2xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">عقار جو</h1>
          <p className="text-gray-600">لوحة التحكم الإدارية</p>
        </div>
        
        <form onSubmit={Submit} className="space-y-6">
          {unauthorized && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <i className="fas fa-exclamation-circle mr-2"></i>
              <p>{error.response?.data?.data?.email || error.response?.data?.data?.password || "Unauthorized" }</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">البريد الألكتروني</label>
            <input 
              type="text" 
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200" 
              placeholder="أدخل البريد الألكتروني" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
            <input 
              type="password" 
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200" 
              placeholder="أدخل كلمة المرور" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition duration-300 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                جاري تسجيل الدخول...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt mr-2"></i>
                تسجيل الدخول
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
