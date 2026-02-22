import { motion } from 'framer-motion';

const SkillTag = ({ skill, type = 'matched', index = 0 }) => {
  const styles = {
    matched: 'bg-success-light text-success border-success/20',
    missing: 'bg-error-light text-error border-error/20',
    suggestion: 'bg-primary-light text-primary border-primary/20'
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`
        inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium
        border ${styles[type]}
      `}
    >
      {skill}
    </motion.span>
  );
};

export default SkillTag;
