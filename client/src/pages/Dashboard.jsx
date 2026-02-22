import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HiOutlineChartBar, 
  HiOutlineDocumentText, 
  HiOutlineTrendingUp,
  HiOutlineLightBulb,
  HiOutlineArrowRight,
  HiOutlineBriefcase
} from 'react-icons/hi';
import StatsCard from '../components/StatsCard';
import ScoreChart from '../components/ScoreChart';
import SkillTag from '../components/SkillTag';
import api from '../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    lastScore: 0,
    avgMatchRate: 0,
    totalSuggestions: 0
  });
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, latestRes] = await Promise.all([
        api.get('/resume/stats'),
        api.get('/resume/latest').catch(() => null)
      ]);

      setStats(statsRes.data.data);
      if (latestRes?.data?.data) {
        setLatestAnalysis(latestRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary">Welcome back! Here's your resume analysis overview.</p>
        </div>
        <Link to="/analyze" className="btn-primary flex items-center gap-2 w-fit">
          New Analysis
          <HiOutlineArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Last Score"
          value={stats.lastScore}
          suffix="%"
          icon={HiOutlineChartBar}
          color="primary"
        />
        <StatsCard
          title="Total Analyses"
          value={stats.totalAnalyses}
          icon={HiOutlineDocumentText}
          color="success"
        />
        <StatsCard
          title="Avg Match Rate"
          value={stats.avgMatchRate}
          suffix="%"
          icon={HiOutlineTrendingUp}
          color="warning"
        />
        <StatsCard
          title="Suggestions"
          value={stats.totalSuggestions}
          icon={HiOutlineLightBulb}
          color="error"
        />
      </div>

      {/* Main Content */}
      {latestAnalysis ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card lg:col-span-1 flex flex-col"
          >
            <h2 className="text-lg font-semibold mb-6">Latest Match Score</h2>
            <div className="flex-1 flex flex-col items-center justify-center">
              <ScoreChart score={latestAnalysis.matchScore} />
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-sm text-text-secondary text-center mb-4">
                Analyzed: {new Date(latestAnalysis.createdAt).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <Link 
                  to={`/jobs?analysisId=${latestAnalysis._id}`} 
                  className="btn-primary flex-1 flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-lg transition-all duration-200"
                >
                  <HiOutlineBriefcase className="w-5 h-5" />
                  Find Matching Jobs
                </Link>
                <button
                  onClick={async () => {
                    try {
                      const res = await api.get(`/resume/${latestAnalysis._id}/download`, { responseType: 'blob' });
                      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', `CareerMatch_Report_${new Date().toISOString().slice(0,10)}.pdf`);
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                      window.URL.revokeObjectURL(url);
                    } catch (err) {
                      console.error('Failed to download report', err);
                    }
                  }}
                  className="btn-secondary flex items-center gap-2"
                >
                  Download Report
                </button>
              </div>
            </div>
          </motion.div>

          {/* Skills Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card lg:col-span-2"
          >
            <h2 className="text-lg font-semibold mb-4">Skills Overview</h2>
            
            {/* Matched Skills */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-text-secondary mb-3">
                Matched Skills ({latestAnalysis.matchedSkills?.length || 0})
              </h3>
              <div className="flex flex-wrap gap-2">
                {latestAnalysis.matchedSkills?.slice(0, 8).map((skill, index) => (
                  <SkillTag key={skill} skill={skill} type="matched" index={index} />
                ))}
                {latestAnalysis.matchedSkills?.length > 8 && (
                  <span className="text-sm text-text-secondary self-center">
                    +{latestAnalysis.matchedSkills.length - 8} more
                  </span>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-text-secondary mb-3">
                Skills to Develop ({latestAnalysis.missingSkills?.length || 0})
              </h3>
              <div className="flex flex-wrap gap-2">
                {latestAnalysis.missingSkills?.slice(0, 6).map((skill, index) => (
                  <SkillTag key={skill} skill={skill} type="missing" index={index} />
                ))}
                {latestAnalysis.missingSkills?.length > 6 && (
                  <span className="text-sm text-text-secondary self-center">
                    +{latestAnalysis.missingSkills.length - 6} more
                  </span>
                )}
              </div>
            </div>

            {/* Quick Tips */}
            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-3">Quick Tips</h3>
              <ul className="space-y-2">
                {latestAnalysis.improvementTips?.slice(0, 3).map((tip, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-start gap-2 text-sm text-text-secondary"
                  >
                    <span className="w-5 h-5 bg-primary-light text-primary rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                      {index + 1}
                    </span>
                    {tip}
                  </motion.li>
                ))}
              </ul>
            </div>

            <Link 
              to="/analyze" 
              className="inline-flex items-center gap-2 text-primary font-medium mt-6 hover:underline"
            >
              View Full Analysis
              <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center py-12"
        >
          <div className="w-20 h-20 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HiOutlineDocumentText className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            No Analysis Yet
          </h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Upload your resume and paste a job description to get AI-powered insights and job matches.
          </p>
          <Link to="/analyze" className="btn-primary inline-flex items-center gap-2">
            Start Your First Analysis
            <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
