import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { HiOutlineLockClosed } from 'react-icons/hi';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('resetEmail');
    if (!stored) {
      // no email, redirect back to forgot
      navigate('/forgot-password');
    } else {
      setEmail(stored);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      toast.success(response.data?.message || 'OTP verified');
      // persist otp for reset step
      localStorage.setItem('resetOtp', otp);
      navigate('/reset-password');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP';
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
          <h1 className="text-3xl font-bold gradient-text">Verify OTP</h1>
          <p className="text-text-secondary mt-2">Enter the code sent to your email.</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">One-Time Code</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input pl-12"
                  placeholder="Enter 6-digit code"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOtp;
