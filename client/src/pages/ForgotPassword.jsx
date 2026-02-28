import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { HiOutlineMail } from 'react-icons/hi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      const msg = response.data?.message || 'OTP sent';
      toast.success(msg);
      // store email for next steps
      localStorage.setItem('resetEmail', email);
      // navigate to otp verify page
      window.location.href = '/verify-otp';
    } catch (err) {
      const msg = err.response?.data?.message || 'Error sending OTP';
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
          <h1 className="text-3xl font-bold gradient-text">Forgot Password</h1>
          <p className="text-text-secondary mt-2">Enter your email to receive a one‑time code.</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-12"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
          <p className="text-center mt-6 text-text-secondary">
            Remembered your password?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
