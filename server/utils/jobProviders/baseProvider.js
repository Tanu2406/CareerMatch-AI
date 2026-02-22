/**
 * Base Job Provider Interface
 * All job providers should implement these methods
 */
class BaseJobProvider {
  constructor(config = {}) {
    this.config = config;
    this.name = 'base';
  }

  /**
   * Search for jobs based on keywords and location
  * @param {Object} params - Search parameters
  * @param {string} params.keywords - Search keywords
  * @param {string} params.location - Job location (city or region)
  * @param {string} params.country - Country code (e.g., 'US', 'IN') or country name
  * @param {boolean} params.remote - Whether to search remote jobs only
  * @param {number} params.limit - Maximum results
  * @returns {Promise<Array>} - Array of normalized job objects
   */
  async search(params) {
    throw new Error('search() must be implemented by provider');
  }

  /**
   * Normalize job data to a standard format
   * @param {Object} rawJob - Raw job data from API
   * @returns {Object} - Normalized job object
   */
  normalizeJob(rawJob) {
    throw new Error('normalizeJob() must be implemented by provider');
  }

  /**
   * Check if the provider is properly configured
   * @returns {boolean}
   */
  isConfigured() {
    return false;
  }
}

export default BaseJobProvider;
