
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './store';

// Components & Pages (will create these next)
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import ActivityCenter from './pages/ActivityCenter';
import TasksPage from './pages/TasksPage';
import WalletPage from './pages/WalletPage';
import UpgradePage from './pages/UpgradePage';

const ProtectedRoute: React.FC<{ children: React.ReactNode, adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { currentUser, isAdmin } = useApp();
  if (!currentUser) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/tasks" element={
        <ProtectedRoute><TasksPage /></ProtectedRoute>
      } />
      <Route path="/activities/:type" element={
        <ProtectedRoute><ActivityCenter /></ProtectedRoute>
      } />
      <Route path="/wallet" element={
        <ProtectedRoute><WalletPage /></ProtectedRoute>
      } />
      <Route path="/upgrade" element={
        <ProtectedRoute><UpgradePage /></ProtectedRoute>
      } />
      
      <Route path="/admin/*" element={
        <ProtectedRoute adminOnly={true}><AdminPanel /></ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <div className="min-h-screen gradient-bg">
          <AppRoutes />
        </div>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
