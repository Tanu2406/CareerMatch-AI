import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HiOutlineArrowLeft,
  HiOutlineLightBulb,
  HiOutlineAcademicCap,
  HiOutlineSparkles,
  HiOutlineExclamationCircle
} from 'react-icons/hi';

const Guide = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'How to Write a Strong Resume',
      icon: HiOutlineAcademicCap,
      color: 'from-blue-500 to-blue-600',
      tips: [
        'Use a clear, professional format with consistent fonts and spacing',
        'Organize your experience in reverse chronological order (most recent first)',
        'Include a brief professional summary highlighting your key qualifications',
        'Use action verbs to describe your accomplishments (managed, developed, implemented)',
        'Quantify achievements with numbers, percentages, and metrics when possible',
        'Keep your resume to 1-2 pages for most positions',
        'Use white space effectively to make it easy to scan',
        'Include relevant URLs (portfolio, LinkedIn, GitHub) if applicable'
      ]
    },
    {
      title: 'Important Technical Skills',
      icon: HiOutlineLightBulb,
      color: 'from-purple-500 to-purple-600',
      tips: [
        'List programming languages you\'re proficient in (Python, JavaScript, Java, C++, etc.)',
        'Include frameworks and libraries (React, Node.js, Django, Spring, etc.)',
        'Mention databases and data tools (SQL, MongoDB, Tableau, Power BI)',
        'Add cloud platforms if relevant (AWS, Azure, Google Cloud)',
        'Include tools and technologies (Git, Docker, Kubernetes, Linux)',
        'Highlight soft skills (communication, problem-solving, leadership)',
        'Be honest about your proficiency level - employers appreciate it',
        'Keep skills current and relevant to your target positions'
      ]
    },
    {
      title: 'ATS Optimization Tips',
      icon: HiOutlineSparkles,
      color: 'from-green-500 to-green-600',
      tips: [
        'Use a standard fonts (Arial, Calibri, Times New Roman) that ATS can read',
        'Avoid graphics, images, charts, and text boxes that confuse ATS',
        'Use simple headers and bullet points instead of complex formatting',
        'Include relevant keywords from the job description naturally',
        'Use standard section headers (Experience, Education, Skills, etc.)',
        'Save your resume as PDF or .docx format (check job posting for requirements)',
        'Don\'t use columns, tables, or headers/footers',
        'Keep file size reasonable and avoid uncommon fonts or symbols'
      ]
    },
    {
      title: 'Common Resume Mistakes to Avoid',
      icon: HiOutlineExclamationCircle,
      color: 'from-red-500 to-red-600',
      tips: [
        'Don\'t use a generic resume - tailor it for each job application',
        'Avoid spelling and grammatical errors (proofread carefully)',
        'Don\'t include irrelevant information or outdated skills',
        'Avoid using "I", "we", or personal pronouns',
        'Don\'t use unprofessional email addresses or phone numbers',
        'Avoid unexplained gaps in your employment history',
        'Don\'t exaggerate or lie about your skills or experience',
        'Avoid using creative fonts, colors, or unconventional layouts for traditional fields',
        'Don\'t forget to include the job-specific keywords mentioned in the listing',
        'Avoid using a resume that\'s longer than 2 pages (1 page for entry-level)'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary-light rounded-lg transition-colors duration-200"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Resume Writing Guide</h1>
        <p className="text-text-secondary text-lg">
          Comprehensive tips to help you create a strong, ATS-optimized resume that gets noticed by employers.
        </p>
      </div>

      {/* Sections Grid */}
      <div className="grid lg:grid-cols-2 gap-6 my-8">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${section.color} p-6 text-white`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <ul className="space-y-3">
                  {section.tips.map((tip, tipIndex) => (
                    <motion.li
                      key={tipIndex}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + tipIndex * 0.05 }}
                      className="flex items-start gap-3 text-text-secondary"
                    >
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-sm leading-relaxed">{tip}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card bg-gradient-to-r from-primary to-purple-600 text-white p-8 rounded-2xl text-center"
      >
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-semibold mb-4">Ready to Improve Your Resume?</h3>
          <p className="text-white/90 mb-6 text-lg">
            Upload your resume and analyze how well it matches job descriptions to get personalized recommendations.
          </p>
          <button
            onClick={() => navigate('/analyze')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Start Analysis
            <HiOutlineSparkles className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Footer Spacing */}
      <div className="pb-8"></div>
    </div>
  );
};

export default Guide;
