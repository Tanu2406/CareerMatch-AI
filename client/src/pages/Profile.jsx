import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HiOutlineUser, 
  HiOutlineMail, 
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlineClock
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/resume/history');
      setHistory(response.data.data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-success bg-success-light';
    if (score >= 40) return 'text-warning bg-warning-light';
    return 'text-error bg-error-light';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Profile</h1>
        <p className="text-text-secondary">Manage your account and view analysis history.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card lg:col-span-1"
        >
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-text-primary">{user?.name}</h2>
            <p className="text-text-secondary">{user?.email}</p>
          </div>

          <div className="mt-6 pt-6 border-t border-border space-y-4">
            <div className="flex items-center gap-3 text-text-secondary">
              <HiOutlineUser className="w-5 h-5" />
              <span>{user?.name}</span>
            </div>
            <div className="flex items-center gap-3 text-text-secondary">
              <HiOutlineMail className="w-5 h-5" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-text-secondary">
              <HiOutlineCalendar className="w-5 h-5" />
              <span>Joined {user?.createdAt ? formatDate(user.createdAt).split(',')[0] : 'N/A'}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-background rounded-xl">
                <p className="text-2xl font-bold text-primary">{history.length}</p>
                <p className="text-sm text-text-secondary">Analyses</p>
              </div>
              <div className="p-3 bg-background rounded-xl">
                <p className="text-2xl font-bold text-success">
                  {history.length > 0 
                    ? Math.round(history.reduce((sum, h) => sum + h.matchScore, 0) / history.length)
                    : 0}%
                </p>
                <p className="text-sm text-text-secondary">Avg Score</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Analysis History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card lg:col-span-2"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <HiOutlineDocumentText className="w-5 h-5 text-primary" />
            Analysis History
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-background rounded-xl">
                  <div className="w-12 h-12 bg-border rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-border rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-border rounded w-1/4"></div>
                  </div>
                  <div className="h-8 w-16 bg-border rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HiOutlineChartBar className="w-8 h-8 text-text-secondary" />
              </div>
              <p className="text-text-secondary">No analysis history yet</p>
              <p className="text-sm text-text-secondary mt-1">
                Your resume analyses will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {history.map((analysis, index) => (
                <motion.div
                  key={analysis._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-background rounded-xl hover:bg-border/50 hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.01] transform"
                >
                  <div onClick={() => navigate(`/analysis/${analysis._id}`)} className={`w-12 h-12 rounded-xl flex items-center justify-center ${getScoreColor(analysis.matchScore)}`}>
                    <span className="font-bold">{analysis.matchScore}%</span>
                  </div>
                  <div className="flex-1 min-w-0" onClick={() => navigate(`/analysis/${analysis._id}`)}>
                    <p className="font-medium text-text-primary truncate">
                      {analysis.resumeFileName}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <HiOutlineClock className="w-4 h-4" />
                      <span>{formatDate(analysis.createdAt)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text-secondary">
                      {analysis.matchedSkills?.length || 0} matched
                    </p>
                    <p className="text-sm text-text-secondary">
                      {analysis.missingSkills?.length || 0} missing
                    </p>
                    <div className="mt-2 flex gap-2 justify-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/jobs?analysisId=${analysis._id}`); }}
                        className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:shadow-md"
                      >
                        Find Jobs
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
