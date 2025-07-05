import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import UploadCustomers from './pages/UploadCustomers';
import CallHistory from './pages/CallHistory';
import Settings from './pages/Settings';
import CustomerList from './pages/CustomerList';
import ReportCall from './pages/ReportCall';
import Login from './pages/Login';
import MicroSipStatus from './components/MicroSipStatus';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-gray-800 shadow-md py-4 px-6 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Rdesk App</h1>
          <MicroSipStatus />
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><UploadCustomers /></ProtectedRoute>} />
            <Route path="/customers/:handel" element={<ProtectedRoute><CustomerList /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><CallHistory /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportCall /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Routes>
        </main>
        <footer className="bg-gray-800 text-center py-4 text-sm text-gray-400">
          © {new Date().getFullYear()} rdeskapp.web.id | Developed by RulimenaProject
        </footer>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <ToastContainer position="bottom-right" theme="dark" />
      </AuthProvider>
    </Router>
  );
}

export default App;