import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import { AuthContext } from './context/AuthContext';
import './App.css'

function RedirectAfterLogin() {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  return user.admin ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<RedirectAfterLogin />} />
      </Routes>
    </Router>
  );
}
