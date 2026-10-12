import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard'; 
import Orders from './pages/Orders'; 
import Customers from './pages/Customers';
import Products from './pages/Products'; 
import Reports from './pages/Reports'; 
import Settings from './pages/Settings'; 
import Login from './pages/Login';

// 30 minute timeout check karne
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const SESSION_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

  useEffect(() => {
    const token = localStorage.getItem('token');
    const loginTime = localStorage.getItem('login_time');

    if (!token || !loginTime) {
      navigate('/', { replace: true });
      return;
    }

    const isExpired = Date.now() - Number(loginTime) > SESSION_TIME;
    if (isExpired) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('login_time');
      alert('तुमचे 30 मिनिटांचे सेशन संपले आहे. कृपया पुन्हा लॉगिन करा.');
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  const token = localStorage.getItem('token');
  const loginTime = localStorage.getItem('login_time');

  if (!token || !loginTime || Date.now() - Number(loginTime) > SESSION_TIME) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><AdminLayout><Orders /></AdminLayout></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><AdminLayout><Customers /></AdminLayout></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><AdminLayout><Products /></AdminLayout></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><AdminLayout><Products /></AdminLayout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><AdminLayout><Reports /></AdminLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><AdminLayout><Settings /></AdminLayout></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;