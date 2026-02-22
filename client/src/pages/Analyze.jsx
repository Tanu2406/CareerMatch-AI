import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  HiOutlineDocumentSearch, 
  HiOutlineSparkles,
  HiOutlineBriefcase,
  HiOutlineRefresh
} from 'react-icons/hi';
import FileUpload from '../components/FileUpload';
import ScoreChart from '../components/ScoreChart';
import SkillTag from '../components/SkillTag';
import api from '../utils/api';

const Analyze = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const navigate = useNavigate();

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    setFileUploaded(false);
    setAnalysisResult(null);

    if (selectedFile) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('resume', selectedFile);

        await api.post('/resume/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        setFileUploaded(true);
        toast.success('Resume uploaded successfully!');
      } catch (error) {
        setFile(null);
        toast.error('Failed to upload resume');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!fileUploaded) {
      toast.error('Please upload a resume first');
      return;
    }

    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await api.post('/resume/analyze', { jobDescription });
      setAnalysisResult(response.data.data);
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze resume');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setJobDescription('');
    setFileUploaded(false);
    setAnalysisResult(null);
  };

  const handleFindJobs = () => {
    navigate('/jobs');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Analyze Resume</h1>
        <p className="text-text-secondary">Upload your resume and paste a job description to get AI-powered insights.</p>
      </div>

      <AnimatePresence mode="wait">
        {!analysisResult ? (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid lg:grid-cols-2 gap-6"
          >
            {/* Upload Resume */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                  <HiOutlineDocumentSearch className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-text-primary">Upload Resume</h2>
                  <p className="text-sm text-text-secondary">PDF or DOCX format</p>
                </div>
              </div>
              <FileUpload 
                onFileSelect={handleFileSelect} 
                currentFile={file}
                loading={uploading}
              />
              {fileUploaded && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-sm text-success flex items-center gap-2"
                >
                  <span className="w-2 h-2 bg-success rounded-full"></span>
                  Resume uploaded and ready for analysis
                </motion.p>
              )}
            </motion.div>

            {/* Job Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-success-light rounded-xl flex items-center justify-center">
                  <HiOutlineBriefcase className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h2 className="font-semibold text-text-primary">Job Description</h2>
                  <p className="text-sm text-text-secondary">Paste the job requirements</p>
                </div>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="input min-h-[250px] resize-none"
                placeholder="Paste the full job description here including requirements, responsibilities, and qualifications..."
              />
              <p className="mt-2 text-xs text-text-secondary">
                {jobDescription.length} characters
              </p>
            </motion.div>

            {/* Analyze Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <button
                onClick={handleAnalyze}
                disabled={!fileUploaded || !jobDescription.trim() || analyzing}
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3"
              >
                {analyzing ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing with AI...</span>
                  </>
                ) : (
                  <>
                    <HiOutlineSparkles className="w-6 h-6" />
                    <span>Analyze Resume</span>
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button 
                onClick={handleReset} 
                className="btn-secondary flex items-center justify-center gap-2 flex-1 sm:flex-initial"
              >
                <HiOutlineRefresh className="w-5 h-5" />
                New Analysis
              </button>
              <button 
                onClick={handleFindJobs} 
                className="btn-primary flex items-center justify-center gap-2 flex-1 sm:flex-initial hover:scale-[1.02] hover:shadow-lg transition-all duration-200"
              >
                <HiOutlineBriefcase className="w-5 h-5" />
                Find Matching Jobs
              </button>
            </div>

            {/* Results Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Score */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card lg:row-span-2 flex flex-col items-center justify-center"
              >
                <h2 className="text-lg font-semibold mb-6">Match Score</h2>
                <ScoreChart score={analysisResult.matchScore} size={220} />
                {analysisResult.summary && (
                  <p className="mt-6 text-center text-text-secondary text-sm">
                    {analysisResult.summary}
                  </p>
                )}
              </motion.div>

              {/* Matched Skills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-success rounded-full"></span>
                  Matched Skills ({analysisResult.matchedSkills?.length || 0})
                </h2>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.matchedSkills?.map((skill, index) => (
                    <SkillTag key={skill} skill={skill} type="matched" index={index} />
                  ))}
                  {(!analysisResult.matchedSkills || analysisResult.matchedSkills.length === 0) && (
                    <p className="text-text-secondary text-sm">No matched skills found</p>
                  )}
                </div>
              </motion.div>

              {/* Missing Skills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-error rounded-full"></span>
                  Missing Skills ({analysisResult.missingSkills?.length || 0})
                </h2>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.missingSkills?.map((skill, index) => (
                    <SkillTag key={skill} skill={skill} type="missing" index={index} />
                  ))}
                  {(!analysisResult.missingSkills || analysisResult.missingSkills.length === 0) && (
                    <p className="text-text-secondary text-sm">Great! No critical skills missing</p>
                  )}
                </div>
              </motion.div>

              {/* Keyword Suggestions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-primary rounded-full"></span>
                  Keyword Suggestions
                </h2>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.keywordSuggestions?.map((keyword, index) => (
                    <SkillTag key={keyword} skill={keyword} type="suggestion" index={index} />
                  ))}
                  {(!analysisResult.keywordSuggestions || analysisResult.keywordSuggestions.length === 0) && (
                    <p className="text-text-secondary text-sm">No additional keywords suggested</p>
                  )}
                </div>
              </motion.div>

              {/* Improvement Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card lg:col-span-2"
              >
                <h2 className="text-lg font-semibold mb-4">Improvement Tips</h2>
                <ul className="space-y-3">
                  {analysisResult.improvementTips?.map((tip, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-background rounded-xl"
                    >
                      <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium">
                        {index + 1}
                      </span>
                      <p className="text-text-secondary">{tip}</p>
                    </motion.li>
                  ))}
                  {(!analysisResult.improvementTips || analysisResult.improvementTips.length === 0) && (
                    <p className="text-text-secondary text-sm">No improvement tips available</p>
                  )}
                </ul>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Analyze;
