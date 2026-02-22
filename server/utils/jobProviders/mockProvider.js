import BaseJobProvider from './baseProvider.js';

/**
 * Mock Job Provider
 * Returns realistic mock data for development and testing
 * Always available as a fallback
 */
class MockProvider extends BaseJobProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'mock';
  }

  isConfigured() {
    return true;
  }

  async search({ keywords, location = '', country = '', remote = false, limit = 10 }) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockJobs = this.generateMockJobs(keywords, limit);
    return mockJobs.map(job => this.normalizeJob(job));
  }

  generateMockJobs(keywords, limit) {
    const keywordLower = keywords.toLowerCase();
    const jobTemplates = [
      {
        title: 'Senior Frontend Developer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA (Remote)',
        salary: '$120,000 - $150,000',
        skills: ['react', 'typescript', 'javascript', 'css', 'html', 'testing', 'git']
      },
      {
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        location: 'New York, NY',
        salary: '$100,000 - $130,000',
        skills: ['nodejs', 'react', 'mongodb', 'aws', 'javascript', 'express']
      },
      {
        title: 'Backend Engineer',
        company: 'DataFlow Systems',
        location: 'Austin, TX (Hybrid)',
        salary: '$110,000 - $140,000',
        skills: ['python', 'django', 'postgresql', 'redis', 'docker', 'linux']
      },
      {
        title: 'React Native Developer',
        company: 'MobileFirst App Co.',
        location: 'Remote',
        salary: '$95,000 - $125,000',
        skills: ['react native', 'javascript', 'ios', 'android', 'typescript', 'mobile']
      },
      {
        title: 'DevOps Engineer',
        company: 'CloudScale Inc.',
        location: 'Seattle, WA',
        salary: '$130,000 - $160,000',
        skills: ['aws', 'kubernetes', 'docker', 'terraform', 'jenkins', 'linux', 'python']
      },
      {
        title: 'Junior Web Developer',
        company: 'WebAgency Pro',
        location: 'Chicago, IL',
        salary: '$60,000 - $80,000',
        skills: ['html', 'css', 'javascript', 'react', 'git']
      },
      {
        title: 'Data Engineer',
        company: 'Analytics Corp',
        location: 'Boston, MA (Remote)',
        salary: '$115,000 - $145,000',
        skills: ['python', 'spark', 'sql', 'aws', 'data pipeline', 'etl']
      },
      {
        title: 'Machine Learning Engineer',
        company: 'AI Solutions Ltd.',
        location: 'San Jose, CA',
        salary: '$140,000 - $180,000',
        skills: ['python', 'tensorflow', 'pytorch', 'machine learning', 'deep learning', 'aws']
      },
      {
        title: 'Software Engineer',
        company: 'Enterprise Software Inc.',
        location: 'Denver, CO',
        salary: '$90,000 - $120,000',
        skills: ['java', 'spring', 'microservices', 'sql', 'docker', 'kubernetes']
      },
      {
        title: 'Frontend Developer',
        company: 'Creative Digital Agency',
        location: 'Los Angeles, CA',
        salary: '$85,000 - $110,000',
        skills: ['vue', 'javascript', 'css', 'html', 'animation', 'responsive design']
      },
      {
        title: 'Platform Engineer',
        company: 'ScaleUp Technologies',
        location: 'Remote',
        salary: '$125,000 - $155,000',
        skills: ['kubernetes', 'golang', 'aws', 'terraform', 'ci/cd', 'monitoring']
      },
      {
        title: 'API Developer',
        company: 'IntegrationHub',
        location: 'Miami, FL',
        salary: '$95,000 - $120,000',
        skills: ['nodejs', 'rest', 'graphql', 'mongodb', 'docker', 'typescript']
      }
    ];

    // Filter jobs that have some relevance to keywords
    const searchTerms = keywordLower.split(/\s+/);
    const filteredJobs = jobTemplates.filter(job => {
      const jobText = `${job.title} ${job.skills.join(' ')}`.toLowerCase();
      return searchTerms.some(term => jobText.includes(term));
    });

    // If no matches, return all jobs
    const results = filteredJobs.length > 0 ? filteredJobs : jobTemplates;

    return results.slice(0, limit);
  }

  normalizeJob(rawJob) {
    return {
      id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: rawJob.title,
      company: rawJob.company,
      location: rawJob.location,
      salary: rawJob.salary,
      description: `We are looking for a talented ${rawJob.title} to join our team at ${rawJob.company}. Required skills include ${rawJob.skills.join(', ')}.`,
      applyLink: 'https://example.com/apply',
      postedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      employmentType: 'Full-time',
      isRemote: rawJob.location.includes('Remote'),
      companyLogo: null,
      skills: rawJob.skills,
      source: 'mock'
    };
  }
}

export default MockProvider;
