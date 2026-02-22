import { useEffect, useState } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const ScoreChart = ({ score = 0, size = 200 }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const getColor = (value) => {
    if (value >= 70) return '#10B981';
    if (value >= 40) return '#F59E0B';
    return '#EF4444';
  };

  const data = [
    {
      name: 'Score',
      value: displayScore,
      fill: getColor(displayScore)
    }
  ];

  const getScoreLabel = (value) => {
    if (value >= 80) return 'Excellent Match';
    if (value >= 70) return 'Good Match';
    if (value >= 50) return 'Moderate Match';
    if (value >= 30) return 'Needs Improvement';
    return 'Low Match';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center"
    >
      <div style={{ width: size, height: size }} className="relative">
        <ResponsiveContainer>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            barSize={12}
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              background={{ fill: '#E5E7EB' }}
              dataKey="value"
              cornerRadius={10}
              max={100}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span 
            className="text-4xl font-bold"
            style={{ color: getColor(displayScore) }}
          >
            {displayScore}%
          </span>
          <span className="text-sm text-text-secondary">Match Score</span>
        </div>
      </div>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4 text-lg font-medium"
        style={{ color: getColor(displayScore) }}
      >
        {getScoreLabel(displayScore)}
      </motion.p>
    </motion.div>
  );
};

export default ScoreChart;
