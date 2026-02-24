import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineBriefcase, 
  HiOutlineRefresh, 
  HiOutlineDocumentSearch,
  HiOutlineSearch
} from 'react-icons/hi';
import JobCard from '../components/JobCard';
import api from '../utils/api';

const JobMatches = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchedSkills, setSearchedSkills] = useState([]);
  const [cleanSkills, setCleanSkills] = useState([]);
  const [remoteOnly, setRemoteOnly] = useState(false);

  useEffect(() => {
    // If an analysisId query param is present, pass it to the API
    const params = new URLSearchParams(window.location.search);
    const analysisId = params.get('analysisId');
    fetchJobs(analysisId);
  }, []);

  const fetchJobs = async (analysisId = null) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (analysisId) params.set('analysisId', analysisId);
      if (remoteOnly) params.set('remote', 'true');
      const url = `/jobs/search?${params.toString()}`;
      const response = await api.get(url);
      const jobsData = response.data.data.jobs || [];
      const skillsData = response.data.data.searchedSkills || [];
      setJobs(jobsData);
      setSearchedSkills(skillsData);
      // compute a cleaned list of skills that actually appear in returned jobs
      setCleanSkills(computeGlobalMatchedSkills(skillsData, jobsData));
    } catch (err) {
      if (err.response?.status === 400) {
        setError('analyze');
      } else {
        setError('fetch');
      }
    } finally {
      setLoading(false);
    }
  };


  // helper functions --------------------------------------------------------
  const GENERIC_SKILL_WORDS = [
    'project', 'projects', 'worked', 'work', 'experience', 'summary',
    'education', 'skill', 'skills', 'year', 'years', 'date', 'month',
    'microsoft', 'apple', 'google'
  ];
  const FILTER_VERBS = [
    'understanding', 'working', 'developed', 'collaborated',
    'experience', 'knowledge', 'ability'
  ];

  const cleanSkillsList = (skills) => {
    if (!Array.isArray(skills)) return [];
    const seen = new Set();
    const clean = [];
    for (let raw of skills) {
      if (!raw || typeof raw !== 'string') continue;
      let item = raw.trim();
      if (!item) continue;
      const words = item.split(/\s+/);
      if (words.length > 3) continue;
      if ((item.match(/\s/g) || []).length > 2) continue;
      const low = item.toLowerCase();
      if (FILTER_VERBS.some(v => low.includes(v))) continue;
      if (item.length > 30) continue;
      if (item === item.toLowerCase() && words.length > 1) continue;
      // only keep capitalized or clearly known tech skill
      const norm = low;
      const known = [
        'javascript','typescript','python','java','c++','c#','ruby','go','rust','php',
        'react','react.js','vue','angular','node','express','django','flask',
        'mongodb','postgresql','mysql','redis','aws','azure','gcp','docker','kubernetes',
        'git','api','graphql','rest'
      ];
      if (!(item[0] === item[0].toUpperCase() || known.includes(norm))) continue;
      if (seen.has(norm)) continue;
      seen.add(norm);
      clean.push(item);
      if (clean.length >= 12) break;
    }
    return clean;
  };

  const computeMatchedSkillsForJob = (userSkills, job) => {
    if (!userSkills || userSkills.length === 0 || !job) return [];
    const cleanedUser = cleanSkillsList(userSkills).map(s => s.toLowerCase());
    const jobSkills = cleanSkillsList(job.skills || []).map(s => s.toLowerCase());
    const matched = cleanedUser.filter(us => jobSkills.includes(us));
    return matched.slice(0, 12);
  };

  const computeGlobalMatchedSkills = (userSkills, jobs) => {
    if (!userSkills || userSkills.length === 0 || !jobs || jobs.length === 0) {
      return [];
    }
    const cleanedUser = cleanSkillsList(userSkills).map(s => s.toLowerCase());
    const allJobSkills = jobs.reduce((arr, job) => {
      if (job.skills && job.skills.length) {
        arr.push(...cleanSkillsList(job.skills).map(s => s.toLowerCase()));
      }
      return arr;
    }, []);
    const uniqueJobSkills = [...new Set(allJobSkills)];
    const matched = cleanedUser.filter(us => uniqueJobSkills.includes(us));
    return matched.slice(0, 12);
  };

  const SkeletonCard = () => (
    <div className="card animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-6 bg-border rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-border rounded w-1/2"></div>
        </div>
        <div className="h-8 w-20 bg-border rounded-lg"></div>
      </div>
      <div className="flex gap-4 mb-4">
        <div className="h-4 bg-border rounded w-24"></div>
        <div className="h-4 bg-border rounded w-28"></div>
      </div>
      <div className="h-16 bg-border rounded-xl mb-4"></div>
      <div className="h-12 bg-border rounded-xl"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Job Matches</h1>
          <p className="text-text-secondary">Jobs matched to your resume skills and experience.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchJobs()}
            disabled={loading}
            className="btn-secondary flex items-center gap-2 w-fit"
          >
            <HiOutlineRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search Skills */}
      {searchedSkills.length > 0 && !loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center gap-2 mb-3">
            <HiOutlineSearch className="w-5 h-5 text-text-secondary" />
            <span className="text-sm font-medium text-text-secondary">Searching based on your skills:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(cleanSkills.length > 0 ? cleanSkills : searchedSkills).map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-primary-light text-primary rounded-lg text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </motion.div>
        ) : error === 'analyze' ? (
          <motion.div
            key="analyze-error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="card text-center py-12"
          >
            <div className="w-20 h-20 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HiOutlineDocumentSearch className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Analyze Your Resume First
            </h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              To find matching jobs, you need to analyze your resume with a job description first.
            </p>
            <Link to="/analyze" className="btn-primary inline-flex items-center gap-2">
              Go to Analysis
            </Link>
          </motion.div>
        ) : error === 'fetch' ? (
          <motion.div
            key="fetch-error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="card text-center py-12"
          >
            <div className="w-20 h-20 bg-error-light rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HiOutlineBriefcase className="w-10 h-10 text-error" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Unable to Load Jobs
            </h2>
            <p className="text-text-secondary mb-6">
              There was an error fetching job listings. Please try again.
            </p>
            <button onClick={fetchJobs} className="btn-primary">
              Try Again
            </button>
          </motion.div>
        ) : jobs.length === 0 ? (
          <motion.div
            key="no-jobs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="card text-center py-12"
          >
            <div className="w-20 h-20 bg-warning-light rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HiOutlineBriefcase className="w-10 h-10 text-warning" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              No Jobs Found
            </h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              We couldn't find any matching jobs at the moment. Try analyzing with a different job description.
            </p>
            <Link to="/analyze" className="btn-primary">
              New Analysis
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="jobs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Results Summary */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-text-secondary">
                Found <span className="font-semibold text-text-primary">{jobs.length}</span> matching jobs
              </p>
              <p className="text-sm text-text-secondary">Sorted by best match</p>
            </div>

            {/* Jobs Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {jobs.map((job, index) => {
                // prefer matchedSkills computed by backend; fallback to local compute if absent
                const matchedSkills = job.matchedSkills && job.matchedSkills.length > 0
                  ? job.matchedSkills
                  : computeMatchedSkillsForJob(searchedSkills, job);
                return (
                  <JobCard
                    key={`${job.title}-${job.company}-${index}`}
                    job={job}
                    index={index}
                    matchedSkills={matchedSkills}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobMatches;
