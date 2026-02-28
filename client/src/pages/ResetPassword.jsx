import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem('resetEmail');
    const storedOtp = localStorage.getItem('resetOtp');
    if (!storedEmail || !storedOtp) {
      navigate('/forgot-password');
    } else {
      setEmail(storedEmail);
      setOtp(storedOtp);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword: password });
      toast.success('Password reset successful. Please login.');
      // clear stored values after success
      localStorage.removeItem('resetEmail');
      localStorage.removeItem('resetOtp');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error resetting password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text">Reset Password</h1>
          <p className="text-text-secondary mt-2">Enter your new password below.</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New password */}
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-12 pr-12"
                  placeholder="Create a new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {/* Confirm */}
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input pl-12"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
