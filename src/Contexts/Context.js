import { createContext, useState, useEffect } from "react";

// إنشاء الـ Context
export const User = createContext({});

export default function UserProvider({ children }) {
  const [auth, setAuth] = useState(null);

  // ✅ استرجاع بيانات المستخدم من localStorage عند بداية التطبيق
  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      setAuth(JSON.parse(storedAuth));
    }
  }, []);

  // ✅ تحديث localStorage كلما تغيرت بيانات المستخدم
  useEffect(() => {
    if (auth) {
      localStorage.setItem("auth", JSON.stringify(auth));
    } else {
      localStorage.removeItem("auth");
    }
  }, [auth]);

  // ✅ دالة تسجيل الخروج
  const logout = () => {
    setAuth(null);
    localStorage.removeItem("auth");
  };

  return (
    <User.Provider value={{ auth, setAuth, logout }}>
      {children}
    </User.Provider>
  );
}
