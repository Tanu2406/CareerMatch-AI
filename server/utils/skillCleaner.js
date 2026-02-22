// Skill Cleaner: Extract clean, job-relevant skills from resume text
// Removes: personal info, education, dates, numbers, long sentences

const PERSONAL_IDENTIFIERS = [
  'email', 'phone', 'mobile', 'contact', 'address', 'linkedin',
  'github', 'portfolio', 'website', 'http://', 'https://', '@', '(', ')'
];

const EDUCATION_KEYWORDS = new Set([
  'bachelor', 'master', 'phd', 'doctorate', 'degree', 'btech', 'bsc', 'msc', 'ma', 'mba',
  'university', 'college', 'school', 'institute', 'cgpa', 'gpa', 'graduation',
  'pursued', 'studying', 'enrolled', 'finished', 'completed'
]);

const NOISE_KEYWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'from', 'by', 'as', 'is',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'like', 'such', 'etc', 'etc.', 'e.g', 'i.e', 'for', 'with', 'that', 'this',
  'about', 'during', 'worked', 'work', 'working', 'experience', 'job', 'role', 'position',
  'responsibilities', 'duties', 'skills', 'knowledge', 'expertise', 'project', 'projects',
  'assigned', 'developed', 'implemented', 'designed', 'created', 'built', 'managed',
  'led', 'maintained', 'improved', 'enhanced', 'optimized', 'reduced', 'increased'
]);

const JOB_TITLE_PATTERNS = [
  'developer', 'engineer', 'architect', 'manager', 'lead', 'senior', 'junior',
  'analyst', 'consultant', 'specialist', 'coordinator', 'designer', 'administrator',
  'engineer', 'programmer', 'operator', 'technician'
];

/**
 * Remove personal identifiers
 */
const removePersonalInfo = (text) => {
  let cleaned = text;
  for (const identifier of PERSONAL_IDENTIFIERS) {
    cleaned = cleaned.replace(new RegExp(identifier, 'gi'), '');
  }
  // Remove email patterns
  cleaned = cleaned.replace(/[\w\.-]+@[\w\.-]+\.\w+/g, '');
  // Remove phone patterns (various formats)
  cleaned = cleaned.replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '');
  // Remove URLs
  cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, '');
  cleaned = cleaned.replace(/www\.[^\s]+/g, '');
  return cleaned;
};

/**
 * Remove education sections and related details
 */
const removeEducationDetails = (text) => {
  const lines = text.split(/\n/);
  const filtered = lines.filter(line => {
    const lower = line.toLowerCase();
    // Skip lines that are heavily education-focused
    if (/education|academic|qualifications|degree|university|college/i.test(line)) return false;
    // Skip lines with CGPA/GPA patterns
    if (/cgpa|gpa|\d\.\d{1,2}\/[4]|grade|marks|percentage/i.test(line)) return false;
    // Skip lines mentioning graduation
    if (/graduation|graduated|pursuing|enrolled/i.test(line)) return false;
    return true;
  });
  return filtered.join('\n');
};

/**
 * Remove dates and year references
 */
const removeDatesAndNumbers = (text) => {
  // Remove year patterns (2020-2025, '20-'21, etc)
  let cleaned = text.replace(/\b(19|20)\d{2}[-–]?(19|20)?\d{2}\b/g, '');
  cleaned = cleaned.replace(/\b(19|20)\d{2}\b/g, '');
  // Remove month names
  cleaned = cleaned.replace(/\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/gi, '');
  // Remove standalone numbers and percentage patterns
  cleaned = cleaned.replace(/\b\d+\s*(years?|months?|days?|hours?|%|percent|thousand|million|k|m)\b/gi, '');
  // Remove version numbers like v1.0, 2.3.4
  cleaned = cleaned.replace(/v?\d+\.\d+(\.\d+)?/g, '');
  return cleaned;
};

/**
 * Extract tokens (potential skills)
 */
const extractTokens = (text) => {
  // Split by common delimiters but preserve multi-word skills
  const tokens = text
    .split(/[\s,;:\n|+•-]+/)
    .map(t => t.trim())
    .filter(t => t && t.length > 1 && t.length <= 30);

  return tokens;
};

/**
 * Filter out purely numeric/date tokens and noise
 */
const filterNoiseTokens = (tokens) => {
  return tokens.filter(token => {
    const lower = token.toLowerCase();

    // Skip noise keywords
    if (NOISE_KEYWORDS.has(lower)) return false;

    // Skip purely numeric
    if (/^\d+$/.test(token)) return false;

    // Skip mostly numbers (e.g., "2020", "v1.2")
    if (/^\d/.test(token) && !/[a-z]/i.test(token)) return false;

    // Skip very short single letters (except known like R, C, Go, etc.)
    if (token.length === 1 && !/^[rcjg]$/i.test(token)) return false;

    // Skip education keywords
    if (EDUCATION_KEYWORDS.has(lower)) return false;

    // Skip common filler words
    if (/^(also|may|sure|please|thanks|regards|sincerely)$/i.test(token)) return false;

    return true;
  });
};

/**
 * Extract job titles from text
 */
const extractJobTitles = (text) => {
  const titles = [];
  const titlePattern = new RegExp(
    `(\\b(?:${JOB_TITLE_PATTERNS.join('|')})\\s+(?:\\w+\\s+)*(?:developer|engineer|manager|lead|architect|analyst|consultant|specialist|designer|administrator|programmer))\\b`,
    'gi'
  );

  const matches = text.match(titlePattern) || [];
  return [...new Set(matches.map(m => m.toLowerCase().trim()))].slice(0, 5);
};

/**
 * Deduplicate and normalize skills
 */
const normalizeSkills = (skills) => {
  const normalized = [...new Set(skills.map(s => s.toLowerCase().trim()))];
  // Sort by length (longer/more specific first)
  return normalized.sort((a, b) => b.length - a.length);
};

/**
 * Main extraction function: returns { skills, jobTitles, keywords }
 */
export const extractCleanSkills = (resumeText = '') => {
  if (!resumeText || typeof resumeText !== 'string') {
    return { skills: [], jobTitles: [], keywords: [] };
  }

  // Step 1: Remove personal info
  let text = removePersonalInfo(resumeText);

  // Step 2: Remove education details
  text = removeEducationDetails(text);

  // Step 3: Remove dates and numbers
  text = removeDatesAndNumbers(text);

  // Step 4: Extract tokens
  const tokens = extractTokens(text);

  // Step 5: Filter noise and keep only meaningful tokens
  const cleanTokens = filterNoiseTokens(tokens);

  // Step 6: Extract job titles
  const jobTitles = extractJobTitles(resumeText);

  // Step 7: Normalize
  const skills = normalizeSkills(cleanTokens);

  // Keywords are skills that are particularly relevant for job search
  const keywords = skills.slice(0, 15);

  return {
    skills: skills.slice(0, 30),
    jobTitles,
    keywords
  };
};

export default {
  extractCleanSkills
};
