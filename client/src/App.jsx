import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOtp from './pages/VerifyOtp';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Analyze from './pages/Analyze';
import JobMatches from './pages/JobMatches';
import Profile from './pages/Profile';
import Guide from './pages/Guide';
import AnalysisDetail from './pages/AnalysisDetail';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
      <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
      <Route path="/verify-otp" element={!isAuthenticated ? <VerifyOtp /> : <Navigate to="/dashboard" />} />
      <Route path="/reset-password" element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/dashboard" />} />
      
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/jobs" element={<JobMatches />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/analysis/:id" element={<AnalysisDetail />} />
      </Route>
      
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
