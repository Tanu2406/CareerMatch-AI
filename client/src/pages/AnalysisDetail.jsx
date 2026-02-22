import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineLightBulb,
  HiOutlineClock
} from 'react-icons/hi';
import ScoreChart from '../components/ScoreChart';
import SkillTag from '../components/SkillTag';
import api from '../utils/api';
import { toast } from 'react-toastify';

const AnalysisDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchAnalysisDetail();
  }, [id]);

  const fetchAnalysisDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/resume/${id}`);
      setAnalysis(response.data.data);
    } catch (err) {
      console.error('Error fetching analysis detail:', err);
      setError(err.response?.data?.message || 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await api.get(`/resume/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analysis-report-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary-light rounded-lg transition-colors duration-200"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
          Back to Profile
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-error-light border border-error rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-error rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlineExclamationCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-error mb-2">Analysis Not Found</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <button
            onClick={() => navigate('/profile')}
            className="btn-primary"
          >
            Go Back to Profile
          </button>
        </motion.div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-text-secondary">No analysis data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary-light rounded-lg transition-colors duration-200"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
          Back to Profile
        </button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Analysis Details</h1>
        <div className="flex items-center gap-2 text-text-secondary">
          <HiOutlineClock className="w-4 h-4" />
          <span>{formatDate(analysis.createdAt)}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card lg:col-span-1 flex flex-col"
        >
          <h2 className="text-lg font-semibold mb-6">Match Score</h2>
          <div className="flex-1 flex flex-col items-center justify-center">
            <ScoreChart score={analysis.matchScore} />
          </div>
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-sm text-text-secondary text-center">
              Resume: {analysis.resumeFileName}
            </p>
          </div>
        </motion.div>

        {/* Skills Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card lg:col-span-2"
        >
          <h2 className="text-lg font-semibold mb-6">Skills Overview</h2>

          {/* Matched Skills */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineCheckCircle className="w-5 h-5 text-success" />
              <h3 className="text-sm font-medium text-text-primary">
                Matched Skills ({analysis.matchedSkills?.length || 0})
              </h3>
            </div>
            {analysis.matchedSkills && analysis.matchedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analysis.matchedSkills.map((skill, index) => (
                  <SkillTag 
                    key={skill} 
                    skill={skill} 
                    type="matched" 
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-secondary italic">No matched skills</p>
            )}
          </div>

          {/* Missing Skills */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineExclamationCircle className="w-5 h-5 text-error" />
              <h3 className="text-sm font-medium text-text-primary">
                Skills to Develop ({analysis.missingSkills?.length || 0})
              </h3>
            </div>
            {analysis.missingSkills && analysis.missingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analysis.missingSkills.map((skill, index) => (
                  <SkillTag 
                    key={skill} 
                    skill={skill} 
                    type="missing" 
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-secondary italic">All required skills matched!</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Suggestions */}
      {analysis.improvementTips && analysis.improvementTips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center gap-2 mb-6">
            <HiOutlineLightBulb className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Improvement Tips</h2>
          </div>

          <div className="space-y-3">
            {analysis.improvementTips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="flex items-start gap-3 p-4 bg-background rounded-xl"
              >
                <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                  {index + 1}
                </span>
                <span className="text-text-secondary leading-relaxed">{tip}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Keyword Suggestions */}
      {analysis.keywordSuggestions && analysis.keywordSuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h2 className="text-lg font-semibold mb-4">Keywords to Add</h2>
          <div className="flex flex-wrap gap-2">
            {analysis.keywordSuggestions.map((keyword, index) => (
              <motion.span
                key={keyword}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="px-3 py-1 bg-primary-light text-primary rounded-full text-sm font-medium"
              >
                {keyword}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex gap-4 flex-wrap"
      >
        <button
          onClick={() => navigate('/analyze')}
          className="btn-primary"
        >
          Analyze Another Resume
        </button>

        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{ padding: '10px 16px', borderRadius: 8 }}
          className={`bg-indigo-600 text-white flex items-center gap-2 transition-transform duration-150 ${downloading ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105 hover:shadow-lg'}`}
        >
          {downloading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : null}
          <span>{downloading ? 'Generating...' : 'Download Report'}</span>
        </button>

        <button
          onClick={() => navigate('/profile')}
          className="btn-secondary"
        >
          Back to Profile
        </button>
      </motion.div>

      {/* Footer Spacing */}
      <div className="pb-8"></div>
    </div>
  );
};

export default AnalysisDetail;
