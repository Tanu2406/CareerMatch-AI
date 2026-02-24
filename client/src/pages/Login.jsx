import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineMail, 
  HiOutlineLockClosed, 
  HiOutlineEye, 
  HiOutlineEyeOff,
  HiOutlineExclamationCircle,
  HiOutlineX
} from 'react-icons/hi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUserNotFoundModal, setShowUserNotFoundModal] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      const status = error.response?.status;
      const code = error.response?.data?.code;
      
      if (status === 404 || code === 'USER_NOT_FOUND') {
        setShowUserNotFoundModal(true);
      } else if (status === 401 || code === 'INVALID_PASSWORD') {
        toast.error('Invalid password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoToSignUp = () => {
    setShowUserNotFoundModal(false);
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <h1 className="text-3xl font-bold gradient-text">CareerMatch AI</h1>
          <p className="text-text-secondary mt-2">Welcome back! Please sign in to continue.</p>
        </div>

        {/* Login Card */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
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

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-12 pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  {showPassword ? (
                    <HiOutlineEyeOff className="w-5 h-5" />
                  ) : (
                    <HiOutlineEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Register Link & Forgot */}
          <p className="text-center mt-6 text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
          <p className="text-center mt-2 text-text-secondary">
            <Link to="/forgot-password" className="text-primary font-medium hover:underline">
              Forgot password?
            </Link>
          </p>
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-primary-light rounded-xl text-center"
        >
          <p className="text-sm text-text-secondary">
            New to CareerMatch AI? Create an account to get started with AI-powered resume analysis.
          </p>
        </motion.div>
      </motion.div>

      {/* User Not Found Modal */}
      <AnimatePresence>
        {showUserNotFoundModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUserNotFoundModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowUserNotFoundModal(false)}
                className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="w-16 h-16 bg-error-light rounded-full flex items-center justify-center mx-auto mb-4">
                <HiOutlineExclamationCircle className="w-8 h-8 text-error" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-text-primary text-center mb-2">
                User Not Found
              </h3>
              <p className="text-text-secondary text-center mb-6">
                This email is not registered. Please sign up first to create an account.
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleGoToSignUp}
                  className="btn-primary w-full"
                >
                  Go to Sign Up
                </button>
                <button
                  onClick={() => setShowUserNotFoundModal(false)}
                  className="btn-secondary w-full"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
