import jobProviderFactory from './jobProviders/index.js';

/**
 * Job Search Service
 * Provides a unified interface for job searching with automatic fallback
 */
class JobService {
  constructor() {
    this.providerName = process.env.JOB_PROVIDER || 'jsearch';
  }

  /**
   * Get the active job provider
   * @returns {BaseJobProvider}
   */
  getProvider() {
    return jobProviderFactory.getProvider(this.providerName);
  }

  /**
   * Search for jobs matching the given criteria
   * @param {Object} params - Search parameters
   * @param {string} params.keywords - Search keywords (skills)
   * @param {string} params.location - Job location
   * @param {number} params.limit - Maximum results
   * @returns {Promise<Array>} - Array of job objects
   */
  async searchJobs({ keywords, location = '', country = '', remote = false, limit = 10 }) {
    const provider = this.getProvider();
    
    console.log(`Searching jobs with provider: ${provider.name}`);
    console.log(`Keywords: ${keywords}`);
    
    try {
      const jobs = await provider.search({ keywords, location, country, remote, limit });
      return jobs;
    } catch (error) {
      console.error('Job search error:', error);
      
      // Try fallback to mock if primary fails
      if (provider.name !== 'mock') {
        console.log('Falling back to mock provider');
        const mockProvider = jobProviderFactory.getProvider('mock');
        return mockProvider.search({ keywords, location, limit });
      }
      
      return [];
    }
  }

  /**
   * Calculate match score for jobs based on user skills
   * @param {Array} jobs - Array of job objects
   * @param {Array} userSkills - User's skills from resume
   * @returns {Array} - Jobs with matchScore field added
   */
  calculateMatchScores(jobs, userSkills) {
    if (!userSkills || userSkills.length === 0) {
      return jobs.map(job => ({ ...job, matchScore: 0 }));
    }

    const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());

    return jobs.map(job => {
      const jobSkills = job.skills || [];
      const normalizedJobSkills = jobSkills.map(s => s.toLowerCase().trim());

      // Also check job title and description for skills
      const jobText = `${job.title} ${job.description || ''}`.toLowerCase();

      let matchCount = 0;
      for (const userSkill of normalizedUserSkills) {
        // Check if skill is in job's skills array
        const inSkills = normalizedJobSkills.some(
          js => js.includes(userSkill) || userSkill.includes(js)
        );
        
        // Check if skill is mentioned in job text
        const inText = jobText.includes(userSkill);
        
        if (inSkills || inText) {
          matchCount++;
        }
      }

      const matchScore = Math.round((matchCount / normalizedUserSkills.length) * 100);

      return {
        ...job,
        matchScore: Math.min(matchScore, 100)
      };
    });
  }

  /**
   * Search and score jobs based on user's resume analysis
   * @param {Array} userSkills - Skills extracted from user's resume
   * @param {string} location - Optional location filter
   * @param {number} limit - Maximum results
   * @returns {Promise<Array>} - Scored and sorted jobs
   */
  async searchAndScoreJobs(userSkills, location = '', limit = 10, country = '', remote = false) {
    // Build search keywords from user skills
    const keywords = userSkills.slice(0, 5).join(' ');
    
    // Search for jobs
    const jobs = await this.searchJobs({ keywords, location, country, remote, limit: limit + 5 });
    
    // Calculate match scores
    const scoredJobs = this.calculateMatchScores(jobs, userSkills);
    
    // Sort by match score (highest first)
    scoredJobs.sort((a, b) => b.matchScore - a.matchScore);
    
    // Return requested limit
    return scoredJobs.slice(0, limit);
  }

  /**
   * Get information about the current provider
   * @returns {Object}
   */
  getProviderInfo() {
    const provider = this.getProvider();
    return {
      name: provider.name,
      configured: provider.isConfigured(),
      available: jobProviderFactory.getAvailableProviders()
    };
  }
}

// Export singleton instance
const jobService = new JobService();

export { JobService };
export default jobService;
