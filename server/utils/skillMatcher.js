// Improved skill matcher utilities
// - More robust skill extraction (technical, tools, soft skills)
// - Set-based matching and tolerant matching
// - Full missing skills returned (no artificial truncation)
// - Smarter keyword suggestions and improvement tips

// Curated list of common skills and keywords
const TECH_SKILLS = [
  'javascript','typescript','python','java','c++','c#','ruby','go','golang','rust','php','swift','kotlin','scala','r','matlab','perl','bash','shell',
  'react','reactjs','react.js','react native','angular','angularjs','vue','vuejs','svelte','nextjs','next.js','nuxt','gatsby','html','css','tailwind','tailwindcss','bootstrap','material-ui','chakra','styled-components','webpack','vite',
  'node','nodejs','node.js','express','fastify','nestjs','koa','django','flask','fastapi','spring','springboot','rails','laravel','asp.net',
  'mongodb','mysql','postgresql','postgres','sqlite','redis','elasticsearch','dynamodb','cassandra','oracle','mariadb','firebase','firestore','neo4j','graphql','prisma','sequelize','mongoose',
  'aws','amazon web services','azure','gcp','google cloud','heroku','vercel','netlify','digitalocean','docker','kubernetes','k8s','jenkins','gitlab ci','github actions','circleci','terraform','ansible','nginx','apache','linux','ubuntu','centos',
  'git','github','gitlab','bitbucket','jira','confluence','slack','trello','figma','postman','swagger','rest','restful','api','websocket','microservices','serverless','lambda',
  'machine learning','deep learning','tensorflow','pytorch','keras','scikit-learn','pandas','numpy','opencv','nlp','computer vision','data science','spark','hadoop','tableau',
  'jest','mocha','chai','cypress','selenium','puppeteer','playwright','junit','pytest','tdd','unit testing',
  'flutter','android','ios','react native',
  // soft skills
  'agile','scrum','kanban','leadership','communication','teamwork','problem solving','analytical','project management','collaboration','adaptability'
];

const STOP_WORDS = new Set(['and','or','the','with','for','are','you','your','from','have','has','was','were','this','that','will','can','may','of','to','in']);
const VALID_SHORT_SKILLS = new Set(['r','c++','c#']);
const VALID_SKILL_REGEX = /^[a-zA-Z0-9\s.+#-]+$/;

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normalize = (s) => (s || '').toLowerCase().trim();

const isMeaningfulSkill = (skill) => {
  if (!skill || typeof skill !== 'string') return false;
  const norm = normalize(skill);
  if (STOP_WORDS.has(norm)) return false;
  if (norm.length < 2 && !VALID_SHORT_SKILLS.has(norm)) return false;
  if (!VALID_SKILL_REGEX.test(norm)) return false;
  return true;
};

// post-process skill lists applying strict rules per spec
export const cleanSkillsArray = (skills) => {
  if (!Array.isArray(skills)) return [];
  const verbs = [
    'understanding', 'working', 'developed', 'collaborated',
    'experience', 'knowledge', 'ability'
  ];
  const seen = new Set();
  const clean = [];

  for (let raw of skills) {
    if (!raw || typeof raw !== 'string') continue;
    let item = raw.trim();
    if (!item) continue;

    // word and space limits
    const words = item.split(/\s+/);
    if (words.length > 3) continue;
    if ((item.match(/\s/g) || []).length > 2) continue;

    // verbs and forbidden terms
    const low = item.toLowerCase();
    if (verbs.some(v => low.includes(v))) continue;

    if (item.length > 30) continue;

    // drop lowercase sentence fragments
    if (item === item.toLowerCase() && words.length > 1) continue;

    // allow only if capitalized or known tech skill
    const norm = normalize(item);
    const known = TECH_SKILLS.map(x => normalize(x));
    if (!(item[0] === item[0].toUpperCase() || known.includes(norm))) continue;

    if (seen.has(norm)) continue;
    seen.add(norm);
    clean.push(item);
    if (clean.length >= 12) break;
  }

  return clean;
};

// Primary extraction function
export const extractSkills = (text) => {
  const found = [];
  const raw = text || '';
  const lower = normalize(raw);

  // 1) Match curated list
  for (const s of TECH_SKILLS) {
    const norm = normalize(s);
    if (!isMeaningfulSkill(norm)) continue;
    try {
      const re = new RegExp(`\\b${escapeRegex(norm)}\\b`, 'i');
      if (re.test(raw)) found.push(norm);
    } catch (e) {
      // ignore invalid regex
    }
  }

  // 2) Heuristic: capture lines that look like skill lists
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    if (!line) continue;
    const hasKeywords = /skills?|technolog|tools|expertise|stack|proficienc|experience/i.test(line);
    const commaCount = (line.match(/,/g) || []).length;
    if (hasKeywords || commaCount >= 2) {
      const parts = line.split(/[,:;|\/\\\-–•]+/);
      for (let p of parts) {
        p = normalize(p).trim();
        if (!p) continue;
        if (p.split(/\s+/).length > 4) continue;
        if (!isMeaningfulSkill(p)) continue;
        found.push(p);
      }
    }
  }

  // 3) Fallback tokens: tech-like tokens anywhere
  const tokenPattern = /[A-Za-z0-9#+.]{2,}(?:\s+[A-Za-z0-9#+.]{2,}){0,2}/g;
  const tokens = (raw.match(tokenPattern) || []);
  for (let t of tokens) {
    const p = normalize(t);
    if (!isMeaningfulSkill(p)) continue;
    if (found.includes(p)) continue;
    if (p.includes('experience') || p.length < 2) continue;
    if (!/[a-z]/i.test(p)) continue;
    found.push(p);
  }

  // Deduplicate and return
  return [...new Set(found.map(s => normalize(s)))].filter(Boolean);
};

export const extractJobKeywords = (jobDescription) => {
  const normalizedText = normalize(jobDescription || '');
  const keywords = [];

  const skills = extractSkills(jobDescription || '');
  keywords.push(...skills);

  const expPattern = /(\d+)\+?\s*years?\s*(of)?\s*(experience)?/gi;
  const expMatches = (jobDescription || '').match(expPattern);
  if (expMatches) keywords.push(...expMatches.map(m => m.toLowerCase()));

  const degreePatterns = ['bachelor','master','phd','doctorate','bs','ms'];
  for (const d of degreePatterns) if (normalizedText.includes(d)) keywords.push(d);

  const final = [];
  for (const k of keywords) {
    const norm = normalize(k);
    if (!isMeaningfulSkill(norm)) continue;
    final.push(norm);
  }

  return [...new Set(final)];
};

export const calculateMatchScore = (resumeText, jobDescription) => {
  // extract and clean skills lists
  let resumeSkills = cleanSkillsArray(extractSkills(resumeText || ''));
  let jobSkills = cleanSkillsArray(extractSkills(jobDescription || ''));

  // normalize sets for quick lookup
  const resumeSet = new Set(resumeSkills.map(s => normalize(s)));
  const jobSet = new Set(jobSkills.map(s => normalize(s)));

  // matched and missing using simple filter logic
  let matchedSkills = resumeSkills.filter(s => jobSet.has(normalize(s)));
  let missingSkills = jobSkills.filter(s => !resumeSet.has(normalize(s)));

  // ensure order and limit to 12
  matchedSkills.sort((a, b) => {
    const idxA = TECH_SKILLS.findIndex(x => normalize(x) === normalize(a));
    const idxB = TECH_SKILLS.findIndex(x => normalize(x) === normalize(b));
    return idxA - idxB;
  });
  if (matchedSkills.length > 12) matchedSkills = matchedSkills.slice(0, 12);

  // format for display
  matchedSkills = matchedSkills.map(formatSkill);
  missingSkills = missingSkills.map(formatSkill);

  // score percentage based purely on jobSkills length
  const matchScore = jobSkills.length === 0 ? 0 : Math.round((matchedSkills.length / jobSkills.length) * 100);

  return {
    matchScore,
    overallScore: matchScore,
    breakdown: {
      technical: matchScore,
      soft: 0,
      experience: 0,
      bonus: 0
    },
    matchedSkills: [...new Set(matchedSkills)],
    missingSkills: [...new Set(missingSkills)],
    totalKeywords: jobSkills.length,
    resumeSkillsCount: resumeSkills.length,
    requiredExperience: 0,
    candidateExperience: 0
  };
};


// helper: map normalized skill to display-friendly value
const DISPLAY_MAP = {
  'javascript': 'JavaScript',
  'typescript': 'TypeScript',
  'react': 'React.js',
  'reactjs': 'React.js',
  'react.js': 'React.js',
  'node': 'Node.js',
  'nodejs': 'Node.js',
  'node.js': 'Node.js',
  'vue': 'Vue.js',
  'vuejs': 'Vue.js',
  'angular': 'Angular',
  'angularjs': 'AngularJS',
  'html': 'HTML',
  'css': 'CSS',
  'aws': 'AWS',
  'gcp': 'GCP',
  'sql': 'SQL',
  'mongodb': 'MongoDB',
  'postgresql': 'PostgreSQL',
  'mysql': 'MySQL',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes'
};

/**
 * Return formatted display name for a normalized skill string.
 */
export const formatSkill = (skill) => {
  if (!skill) return skill;
  const lower = skill.toLowerCase();
  if (DISPLAY_MAP[lower]) return DISPLAY_MAP[lower];
  // fallback: capitalize each word
  return skill
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

/**
 * Extract intersection of skills between resume and job description
 * following the rules specified by the ATS logic. Returns an object
 * with matchedSkills array limited to 12 and ordered by importance.
 */
export const getMatchedSkills = (resumeText, jobDescription) => {
  const resumeSkills = extractSkills(resumeText || '');
  const jobSkills = extractSkills(jobDescription || '');

  const jobSet = new Set(jobSkills.map(s => normalize(s)));
  // keep order from TECH_SKILLS priority
  let shared = resumeSkills
    .map(s => normalize(s))
    .filter(s => jobSet.has(s));

  shared.sort((a, b) => {
    const idxA = TECH_SKILLS.findIndex(x => normalize(x) === a);
    const idxB = TECH_SKILLS.findIndex(x => normalize(x) === b);
    return idxA - idxB;
  });

  if (shared.length > 12) shared = shared.slice(0, 12);
  shared = shared.map(formatSkill);

  return { matchedSkills: shared };
};

export const generateKeywordSuggestions = (missingSkills = []) => {
  const top = missingSkills.slice(0, 15);
  const suggestions = [];

  for (const s of top) {
    suggestions.push(`If you have experience with ${s}, add it to your Skills or Projects section and describe how you used it (e.g., used ${s} to build X feature).`);
    suggestions.push(`If you lack direct experience with ${s}, create a short project or mini-case study showing ${s} and include it as a project.`);
  }

  const uniq = [...new Set(suggestions)];
  return uniq.slice(0, 15);
};

export const generateBasicTips = (matchScore, missingSkills = []) => {
  const tips = [];

  if (matchScore < 10) {
    tips.push('Resume is highly misaligned with this job. Major overhaul required.');
    tips.push('Tailor the resume: use the job title and top required skills in your Summary.');
    tips.push('Add targeted projects demonstrating core skills and coursework if applicable.');
  } else if (matchScore < 30) {
    tips.push('Major improvement required: focus on foundational missing skills.');
    tips.push('Add a concise Summary that highlights top required skills and years of experience.');
    tips.push('Add 1-3 projects that demonstrate the most important missing skills (include bullets with metrics).');
  } else if (matchScore < 50) {
    tips.push('Significant improvements needed to be competitive for this role.');
    tips.push('Add or emphasize the top 10–15 missing skills in Skills and Projects sections.');
    tips.push('Rewrite your Summary to include role-specific keywords and measurable achievements.');
    tips.push('Convert responsibilities into achievement bullets and add metrics where possible.');
  } else if (matchScore < 70) {
    tips.push('Moderate match — refine keywords and highlight accomplishments.');
    tips.push('Reorder skills so the most relevant appear first and match job language.');
    tips.push('Quantify impact in each project (%, time saved, revenue, users).');
  } else {
    tips.push('Good match — fine-tune resume with targeted achievements and any missing certifications.');
    tips.push('Add short case studies or project links to showcase depth for top skills.');
  }

  if (missingSkills && missingSkills.length > 0) {
    const topMissing = missingSkills.slice(0, 15);
    tips.push(`Top missing skills to add or work on: ${topMissing.join(', ')}`);
  }

  tips.push('Use action verbs and concise bullets for accomplishments');
  tips.push('Format for ATS: clear headings, bullet lists, no images, include keywords from job description');
  tips.push('If possible, obtain quick certifications or build mini-projects to demonstrate missing skills');

  return tips;
};

export default {
  extractSkills,
  extractJobKeywords,
  calculateMatchScore,
  getMatchedSkills,
  generateKeywordSuggestions,
  generateBasicTips
};
