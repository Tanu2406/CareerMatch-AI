import Analysis from '../models/Analysis.js';
import jobService from '../utils/jobService.js';

// @desc    Search for matching jobs
// @route   GET /api/jobs/search
// @access  Private
export const searchJobs = async (req, res) => {
  try {
    const { location, limit = 10, analysisId, country = '', remote = 'false' } = req.query;

    // Determine which analysis to use: specific ID or latest
    let analysis;
    if (analysisId) {
      analysis = await Analysis.findOne({ _id: analysisId, userId: req.user.id });
      if (!analysis) {
        return res.status(404).json({ success: false, message: 'Analysis not found' });
      }
    } else {
      analysis = await Analysis.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    }

    if (!analysis) {
      return res.status(400).json({
        success: false,
        message: 'Please analyze your resume first before searching for jobs'
      });
    }

    // Build user skills: prefer stored resumeSkills if available
    const userSkills = [
      ...(analysis.resumeSkills || []),
      ...(analysis.matchedSkills || []),
      // include more missing skills to improve job search and suggestions (top 15)
      ...(analysis.missingSkills || []).slice(0, 15)
    ].filter(Boolean);

    if (userSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No skills found in the selected analysis. Please analyze resume first.'
      });
    }

    // Search and score jobs using resume-derived skills
    const jobs = await jobService.searchAndScoreJobs(
      userSkills,
      location || '',
      parseInt(limit),
      country || '',
      remote === 'true' || remote === true
    );

    // Get provider info for transparency
    const providerInfo = jobService.getProviderInfo();

    res.json({
      success: true,
      data: {
        jobs,
        totalJobs: jobs.length,
        searchedSkills: userSkills,
        provider: providerInfo.name
      }
    });
  } catch (error) {
    console.error('Job search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching for jobs',
      error: error.message
    });
  }
};

// @desc    Get job recommendations based on skills
// @route   GET /api/jobs/recommendations
// @access  Private
export const getRecommendations = async (req, res) => {
  try {
    const latestAnalysis = await Analysis.findOne({ userId: req.user.id })
      .sort({ createdAt: -1 });

    if (!latestAnalysis) {
      return res.status(400).json({
        success: false,
        message: 'Please analyze your resume first'
      });
    }

    const topSkills = latestAnalysis.matchedSkills?.slice(0, 5) || [];

    // Generate role recommendations based on skills
    const recommendedRoles = generateRoleRecommendations(topSkills);

    res.json({
      success: true,
      data: {
        skills: topSkills,
        recommendedRoles
      }
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting recommendations',
      error: error.message
    });
  }
};

// @desc    Get job provider status
// @route   GET /api/jobs/provider-status
// @access  Private
export const getProviderStatus = async (req, res) => {
  try {
    const providerInfo = jobService.getProviderInfo();

    res.json({
      success: true,
      data: providerInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting provider status',
      error: error.message
    });
  }
};

/**
 * Generate job role recommendations based on skills
 */
function generateRoleRecommendations(skills) {
  const skillsLower = skills.map(s => s.toLowerCase());
  const roles = [];

  // Frontend skills
  if (skillsLower.some(s => ['react', 'vue', 'angular', 'javascript', 'typescript'].includes(s))) {
    roles.push('Frontend Developer', 'UI Engineer');
  }

  // Backend skills
  if (skillsLower.some(s => ['node', 'nodejs', 'python', 'java', 'express', 'django'].includes(s))) {
    roles.push('Backend Developer', 'API Developer');
  }

  // Full stack
  if (roles.includes('Frontend Developer') && roles.includes('Backend Developer')) {
    roles.unshift('Full Stack Developer');
  }

  // DevOps skills
  if (skillsLower.some(s => ['docker', 'kubernetes', 'aws', 'azure', 'terraform'].includes(s))) {
    roles.push('DevOps Engineer', 'Platform Engineer');
  }

  // Data skills
  if (skillsLower.some(s => ['python', 'sql', 'spark', 'tensorflow', 'pytorch'].includes(s))) {
    roles.push('Data Engineer', 'ML Engineer');
  }

  // Mobile skills
  if (skillsLower.some(s => ['react native', 'flutter', 'ios', 'android'].includes(s))) {
    roles.push('Mobile Developer');
  }

  // Default if no matches
  if (roles.length === 0) {
    roles.push('Software Developer', 'Software Engineer');
  }

  return [...new Set(roles)].slice(0, 5);
}
