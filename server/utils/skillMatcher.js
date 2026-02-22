// Common technical skills and keywords for matching
const TECH_SKILLS = [
  // Programming Languages
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'golang',
  'rust', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'bash', 'shell',
  
  // Frontend
  'react', 'reactjs', 'react.js', 'angular', 'angularjs', 'vue', 'vuejs', 'vue.js',
  'svelte', 'nextjs', 'next.js', 'nuxt', 'gatsby', 'html', 'html5', 'css', 'css3',
  'sass', 'scss', 'less', 'tailwind', 'tailwindcss', 'bootstrap', 'material-ui',
  'chakra', 'styled-components', 'webpack', 'vite', 'rollup', 'parcel',
  
  // Backend
  'node', 'nodejs', 'node.js', 'express', 'expressjs', 'fastify', 'nestjs', 'koa',
  'django', 'flask', 'fastapi', 'spring', 'springboot', 'rails', 'laravel', 'asp.net',
  
  // Databases
  'mongodb', 'mysql', 'postgresql', 'postgres', 'sqlite', 'redis', 'elasticsearch',
  'dynamodb', 'cassandra', 'oracle', 'sql server', 'mariadb', 'firebase', 'firestore',
  'neo4j', 'graphql', 'prisma', 'sequelize', 'mongoose',
  
  // Cloud & DevOps
  'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'heroku', 'vercel',
  'netlify', 'digitalocean', 'docker', 'kubernetes', 'k8s', 'jenkins', 'gitlab ci',
  'github actions', 'circleci', 'terraform', 'ansible', 'puppet', 'chef',
  'nginx', 'apache', 'linux', 'ubuntu', 'centos',
  
  // Tools & Technologies
  'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack', 'trello',
  'figma', 'sketch', 'adobe xd', 'postman', 'swagger', 'rest', 'restful', 'api',
  'graphql', 'websocket', 'microservices', 'serverless', 'lambda',
  
  // Data & AI/ML
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras', 'scikit-learn',
  'pandas', 'numpy', 'opencv', 'nlp', 'computer vision', 'data science', 'data analysis',
  'big data', 'spark', 'hadoop', 'tableau', 'power bi', 'looker',
  
  // Testing
  'jest', 'mocha', 'chai', 'cypress', 'selenium', 'puppeteer', 'playwright',
  'junit', 'pytest', 'rspec', 'tdd', 'bdd', 'unit testing', 'integration testing',
  
  // Mobile
  'react native', 'flutter', 'ionic', 'android', 'ios', 'xamarin', 'cordova',
  
  // Soft Skills (sometimes in job descriptions)
  'agile', 'scrum', 'kanban', 'leadership', 'communication', 'teamwork',
  'problem solving', 'analytical', 'project management'
];

// Stop words to ignore during extraction
const STOP_WORDS = new Set([
  'and', 'or', 'the', 'with', 'for', 'are',
  'you', 'your', 'from', 'have', 'has',
  'was', 'were', 'this', 'that', 'will',
  'can', 'may', 'of', 'to', 'in', 'ba', 'ma'
]);

// Optional whitelist for short but valid skills
const VALID_SHORT_SKILLS = new Set(['r', 'c++', 'c#']);

const VALID_SKILL_REGEX = /^[a-zA-Z0-9\s.+#]+$/;

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalize = (s) => (s || '').toLowerCase().trim();

const isMeaningfulSkill = (skill) => {
  if (!skill || typeof skill !== 'string') return false;
  const norm = normalize(skill);

  if (STOP_WORDS.has(norm)) return false;

  // allow whitelist for short skills like 'r' or 'c++'
  if (norm.length < 3 && !VALID_SHORT_SKILLS.has(norm)) return false;

  if (!VALID_SKILL_REGEX.test(norm)) return false;

  return true;
};

/**
 * Extract skills from text
 */
export const extractSkills = (text) => {
  const normalizedText = normalize(text);
  const foundSkills = [];

  for (const skill of TECH_SKILLS) {
    const normSkill = normalize(skill);
    if (!isMeaningfulSkill(normSkill)) continue;

    // Create regex pattern for whole-word matching (allow multi-word skills)
    const pattern = new RegExp(`\\b${escapeRegex(normSkill)}\\b`, 'i');
    if (pattern.test(normalizedText)) {
      foundSkills.push(normSkill);
    }
  }

  // Normalize, remove duplicates
  return [...new Set(foundSkills)];
};

/**
 * Extract keywords from job description
 */
export const extractJobKeywords = (jobDescription) => {
  const normalizedText = normalize(jobDescription);
  const keywords = [];

  // Extract tech skills (already normalized and filtered)
  const skills = extractSkills(normalizedText);
  keywords.push(...skills);

  // Extract years of experience patterns
  const expPattern = /(\d+)\+?\s*years?\s*(of)?\s*(experience)?/gi;
  const expMatches = normalizedText.match(expPattern);
  if (expMatches) {
    keywords.push(...expMatches.map(m => m.toLowerCase()));
  }

  // Extract degree requirements (avoid short ambiguous tokens)
  const degreePatterns = ['bachelor', 'master', 'phd', 'doctorate', 'bs', 'ms'];
  for (const degree of degreePatterns) {
    if (normalizedText.includes(degree)) {
      keywords.push(degree);
    }
  }

  // Final filtering: remove stop words, invalid tokens, short tokens
  const final = [];
  for (const k of keywords) {
    const norm = normalize(k);
    if (!isMeaningfulSkill(norm)) continue;
    final.push(norm);
  }

  return [...new Set(final)];
};

/**
 * Calculate match score between resume and job description
 */
export const calculateMatchScore = (resumeText, jobDescription) => {
  // Extract normalized skill sets from resume and job description
  const resumeSkills = extractSkills(resumeText || '');
  const jobTechSkills = extractSkills(jobDescription || '');

  // Define soft skills list (separate from technical skills)
  const SOFT_SKILLS = new Set([
    'agile', 'scrum', 'kanban', 'leadership', 'communication', 'teamwork',
    'problem solving', 'analytical', 'project management', 'collaboration', 'adaptability'
  ]);

  // Split job required skills into technical and soft
  const requiredTechnical = [];
  const requiredSoft = [];
  for (const s of jobTechSkills) {
    if (SOFT_SKILLS.has(s)) requiredSoft.push(s);
    else requiredTechnical.push(s);
  }

  // Extract numeric experience requirement from jobDescription (first occurrence)
  let requiredExperience = 0;
  try {
    const expPattern = /(\d+)\+?\s*years?/i;
    const m = (jobDescription || '').match(expPattern);
    if (m && m[1]) requiredExperience = parseInt(m[1], 10);
  } catch (e) { requiredExperience = 0; }

  // Extract candidate experience from resumeText (first occurrence)
  let candidateExperience = 0;
  try {
    const m2 = (resumeText || '').match(/(\d+)\+?\s*years?/i);
    if (m2 && m2[1]) candidateExperience = parseInt(m2[1], 10);
  } catch (e) { candidateExperience = 0; }

  // Bonus: detect education/certifications in resumeText
  const resumeLower = normalize(resumeText || '');
  const degreePatterns = ['bachelor', 'master', 'phd', 'doctorate', 'bs', 'ms'];
  const certPatterns = ['certificate', 'certified', 'certification', 'aws certified', 'google certified'];
  let bonusFound = false;
  for (const d of degreePatterns) {
    if (resumeLower.includes(d)) { bonusFound = true; break; }
  }
  if (!bonusFound) {
    for (const c of certPatterns) {
      if (resumeLower.includes(c)) { bonusFound = true; break; }
    }
  }

  // Helper for tolerant matching (partial / variant matching)
  const tolerantMatch = (requiredSkill, candidateSkills) => {
    if (!requiredSkill) return false;
    // exact match
    if (candidateSkills.includes(requiredSkill)) return true;
    // partial includes (word boundary aware)
    for (const cs of candidateSkills) {
      if (!cs) continue;
      if (cs === requiredSkill) return true;
      if (cs.includes(requiredSkill) || requiredSkill.includes(cs)) return true;
      try {
        const r = new RegExp(`\\b${escapeRegex(requiredSkill)}\\b`, 'i');
        if (r.test(cs)) return true;
      } catch (e) {
        // ignore
      }
    }
    return false;
  };

  // Technical score (50%)
  const techTotal = requiredTechnical.length;
  let techMatches = [];
  if (techTotal > 0) {
    techMatches = requiredTechnical.filter(req => tolerantMatch(req, resumeSkills));
  }
  const technicalScore = techTotal === 0 ? 0 : (techMatches.length / techTotal) * 50;

  // Soft score (20%)
  const softTotal = requiredSoft.length;
  let softMatches = [];
  if (softTotal > 0) {
    softMatches = requiredSoft.filter(req => tolerantMatch(req, resumeSkills));
  }
  const softScore = softTotal === 0 ? 0 : (softMatches.length / softTotal) * 20;

  // Experience score (25%)
  let experienceScore = 0;
  if (requiredExperience <= 0) {
    experienceScore = 0;
  } else if (candidateExperience >= requiredExperience) {
    experienceScore = 25;
  } else {
    experienceScore = (candidateExperience / requiredExperience) * 25;
  }
  if (experienceScore > 25) experienceScore = 25;

  // Bonus score (5%)
  const bonusScore = bonusFound ? 5 : 0;

  // Compose final score and breakdown
  let finalScore = technicalScore + softScore + experienceScore + bonusScore;
  if (finalScore > 100) finalScore = 100;
  const overall = Math.round(finalScore);

  // Matched and missing skills lists (combine tech + soft requirements)
  const matchedSkills = [...new Set([...(techMatches || []), ...(softMatches || [])])];
  const requiredAll = [...new Set([...(requiredTechnical || []), ...(requiredSoft || [])])];
  const missingSkills = requiredAll.filter(r => !matchedSkills.includes(r));

  return {
    matchScore: overall,
    overallScore: overall,
    breakdown: {
      technical: Math.round(technicalScore * 100) / 100,
      soft: Math.round(softScore * 100) / 100,
      experience: Math.round(experienceScore * 100) / 100,
      bonus: Math.round(bonusScore * 100) / 100
    },
    matchedSkills: [...new Set(matchedSkills)],
    missingSkills: [...new Set(missingSkills)],
    totalKeywords: requiredAll.length,
    resumeSkillsCount: resumeSkills.length,
    requiredExperience,
    candidateExperience
  };
};

/**
 * Generate basic keyword suggestions
 */
export const generateKeywordSuggestions = (missingSkills) => {
  return missingSkills.slice(0, 10).map(skill => {
    return `Add "${skill}" to your resume if you have experience with it`;
  });
};

/**
 * Generate basic improvement tips
 */
export const generateBasicTips = (matchScore, missingSkills) => {
  const tips = [];
  
  if (matchScore < 50) {
    tips.push('Your resume needs significant improvements to match this job');
    tips.push('Consider gaining experience in the missing technical skills');
  } else if (matchScore < 70) {
    tips.push('Your resume is a moderate match - add more relevant keywords');
    tips.push('Highlight your experience with the matched skills more prominently');
  } else {
    tips.push('Great match! Fine-tune your resume with specific achievements');
    tips.push('Quantify your accomplishments with metrics where possible');
  }
  
  if (missingSkills.length > 0) {
    tips.push(`Focus on learning: ${missingSkills.slice(0, 3).join(', ')}`);
  }
  
  tips.push('Use action verbs to describe your experience');
  tips.push('Keep your resume concise and well-formatted for ATS systems');
  
  return tips;
};

export default {
  extractSkills,
  extractJobKeywords,
  calculateMatchScore,
  generateKeywordSuggestions,
  generateBasicTips
};
