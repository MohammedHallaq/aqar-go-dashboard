import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import Components
import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

// Import Pages
import Dashboard from './pages/Dashboard';
import UsersManagement from './pages/users/UsersManagement';
import UserEdit from './pages/users/UserEdit';
import PropertiesManagement from './pages/properties/PropertiesManagement';
import PropertyEdit from './pages/properties/PropertyEdit';
import AdsManagement from './pages/ads/AdsManagement';
import AdEdit from './pages/ads/AdEdit';
import SubscriptionsManagement from './pages/subscriptions/SubscriptionsManagement';
import SubscriptionEdit from './pages/subscriptions/SubscriptionEdit';
import PlanForm from './pages/subscriptions/PlansForm';
import ReportManagement from './pages/reports/ReportsManagement';
import BlocksManagement from './pages/blocks/BlocksManagement';
import BlockEdit from './pages/blocks/BlockEdit';
// Import Context
import { User } from './Contexts/Context';

// ✅ ProtectedRoute Component
const ProtectedRoute = ({ children }) => {
  const userNow = useContext(User);

  if (!userNow?.auth) {
    // لو مافي بيانات مستخدم → روح على صفحة تسجيل الدخول
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <div className="App">
      <Routes>
        {/* صفحة تسجيل الدخول */}
        <Route path="/login" element={<LoginScreen />} />

        {/* المسارات المحمية */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div>
                <Header />
                <div className="flex">
                  <Sidebar />
                  <main className="flex-1 bg-gray-50">
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" />} />
                      <Route path="/dashboard" element={<Dashboard />} />

                      {/* Users Routes */}
                      <Route path="/users" element={<UsersManagement />} />
                      <Route path="/users/new" element={<UserEdit />} />
                      <Route path="/users/edit/:id" element={<UserEdit />} />

                      {/* Properties Routes */}
                      <Route path="/properties" element={<PropertiesManagement />} />
                      <Route path="/properties/new" element={<PropertyEdit />} />
                      <Route path="/properties/edit/:id" element={<PropertyEdit />} />

                      {/* Ads Routes */}
                      <Route path="/ads" element={<AdsManagement />} />
                      <Route path="/ads/new" element={<AdEdit />} />
                      <Route path="/ads/edit/:id" element={<AdEdit />} />

                      {/* Subscriptions Routes */}
                      <Route path="/plans/new" element={<PlanForm />} />
                      <Route path="/plans/edit/:id" element={<PlanForm />} />
                      <Route path="/subscriptions" element={<SubscriptionsManagement />} />
                      <Route path="/subscriptions/new" element={<SubscriptionEdit />} />
                      <Route path="/subscriptions/edit/:id" element={<SubscriptionEdit />} />
                      {/* Reports Routes */}
                      <Route path="/reports" element={<ReportManagement />} />
                      {/* Blocks Routes */}
                      <Route path="/blocks" element={<BlocksManagement />} />
                      <Route path="/blocks/new/:blocked_id" element={<BlockEdit />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;