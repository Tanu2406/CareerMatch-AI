import { motion } from 'framer-motion';
import { HiOutlineLocationMarker, HiOutlineCurrencyDollar, HiOutlineExternalLink } from 'react-icons/hi';

const JobCard = ({ job, index = 0 }) => {
  const { title, company, location, salary, matchScore, applyLink } = job;

  const getScoreColor = (score) => {
    if (score >= 70) return 'bg-success text-white';
    if (score >= 40) return 'bg-warning text-white';
    return 'bg-error text-white';
  };

  const getScoreBgColor = (score) => {
    if (score >= 70) return 'bg-success-light border-success/20';
    if (score >= 40) return 'bg-warning-light border-warning/20';
    return 'bg-error-light border-error/20';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="card hover:shadow-card-hover transition-all duration-200"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
          <p className="text-text-secondary">{company}</p>
        </div>
        <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${getScoreColor(matchScore)}`}>
          {matchScore}% Match
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-text-secondary text-sm">
          <HiOutlineLocationMarker className="w-4 h-4" />
          <span>{location}</span>
        </div>
        {salary && salary !== 'Not specified' && (
          <div className="flex items-center gap-1.5 text-text-secondary text-sm">
            <HiOutlineCurrencyDollar className="w-4 h-4" />
            <span>{salary}</span>
          </div>
        )}
      </div>

      <div className={`p-3 rounded-xl mb-4 border ${getScoreBgColor(matchScore)}`}>
        <p className="text-sm">
          {matchScore >= 70 && 'Great match! Your skills align well with this position.'}
          {matchScore >= 40 && matchScore < 70 && 'Good potential match. Consider highlighting relevant experience.'}
          {matchScore < 40 && 'This role may require additional skills. Review the requirements carefully.'}
        </p>
      </div>

      <a
        href={applyLink}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        Apply Now
        <HiOutlineExternalLink className="w-4 h-4" />
      </a>
    </motion.div>
  );
};

export default JobCard;
