import axios from 'axios';
import BaseJobProvider from './baseProvider.js';

/**
 * JSearch Provider (RapidAPI)
 * Uses the JSearch API from RapidAPI for job listings
 * Free tier: 100 requests/month
 */
class JSearchProvider extends BaseJobProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'jsearch';
    this.apiKey = config.apiKey || process.env.RAPIDAPI_KEY;
    this.apiHost = 'jsearch.p.rapidapi.com';
    this.baseUrl = 'https://jsearch.p.rapidapi.com';
  }

  isConfigured() {
    return !!this.apiKey;
  }

  async search({ keywords, location = '', limit = 10, page = 1 }) {
    if (!this.isConfigured()) {
      console.log('JSearch API key not configured');
      return [];
    }

    try {
      // Build query with location if provided
      const query = location ? `${keywords} in ${location}` : keywords;

      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          query,
          page: page.toString(),
          num_pages: '1',
          date_posted: 'month'
        },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.apiHost
        }
      });

      if (response.data && response.data.data) {
        return response.data.data
          .slice(0, limit)
          .map(job => this.normalizeJob(job));
      }

      return [];
    } catch (error) {
      console.error('JSearch API error:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      return [];
    }
  }

  normalizeJob(rawJob) {
    return {
      id: rawJob.job_id || `jsearch-${Date.now()}-${Math.random()}`,
      title: rawJob.job_title || 'Unknown Title',
      company: rawJob.employer_name || 'Unknown Company',
      location: this.formatLocation(rawJob),
      salary: this.formatSalary(rawJob),
      description: rawJob.job_description || '',
      applyLink: rawJob.job_apply_link || rawJob.job_google_link || '#',
      postedDate: rawJob.job_posted_at_datetime_utc || null,
      employmentType: rawJob.job_employment_type || 'Full-time',
      isRemote: rawJob.job_is_remote || false,
      companyLogo: rawJob.employer_logo || null,
      skills: this.extractSkills(rawJob),
      source: 'jsearch'
    };
  }

  formatLocation(job) {
    const parts = [];
    if (job.job_city) parts.push(job.job_city);
    if (job.job_state) parts.push(job.job_state);
    if (job.job_country) parts.push(job.job_country);
    
    if (parts.length === 0) {
      return job.job_is_remote ? 'Remote' : 'Location not specified';
    }
    
    let location = parts.join(', ');
    if (job.job_is_remote) {
      location += ' (Remote)';
    }
    return location;
  }

  formatSalary(job) {
    const min = job.job_min_salary;
    const max = job.job_max_salary;
    const period = job.job_salary_period;
    const currency = job.job_salary_currency || 'USD';

    if (!min && !max) {
      return 'Not specified';
    }

    const formatNum = (num) => {
      if (num >= 1000) {
        return `${(num / 1000).toFixed(0)}K`;
      }
      return num.toLocaleString();
    };

    let salary = '';
    if (min && max) {
      salary = `$${formatNum(min)} - $${formatNum(max)}`;
    } else if (min) {
      salary = `From $${formatNum(min)}`;
    } else if (max) {
      salary = `Up to $${formatNum(max)}`;
    }

    if (period) {
      salary += `/${period.toLowerCase()}`;
    }

    return salary;
  }

  extractSkills(job) {
    const skills = [];
    
    // Extract from highlights if available
    if (job.job_highlights) {
      if (job.job_highlights.Qualifications) {
        skills.push(...this.parseSkillsFromText(job.job_highlights.Qualifications.join(' ')));
      }
      if (job.job_highlights.Responsibilities) {
        skills.push(...this.parseSkillsFromText(job.job_highlights.Responsibilities.join(' ')));
      }
    }

    // Also extract from description
    if (job.job_description) {
      skills.push(...this.parseSkillsFromText(job.job_description));
    }

    // Also check required skills field
    if (job.job_required_skills) {
      skills.push(...job.job_required_skills);
    }

    return [...new Set(skills.map(s => s.toLowerCase()))];
  }

  parseSkillsFromText(text) {
    const techSkills = [
      'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'php',
      'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring',
      'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes',
      'git', 'agile', 'scrum', 'rest', 'graphql', 'api'
    ];

    const foundSkills = [];
    const lowerText = text.toLowerCase();

    for (const skill of techSkills) {
      if (lowerText.includes(skill)) {
        foundSkills.push(skill);
      }
    }

    return foundSkills;
  }
}

export default JSearchProvider;
