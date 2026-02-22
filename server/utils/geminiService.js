import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

/**
 * Initialize Gemini AI client
 */
const initGemini = () => {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

/**
 * Analyze resume against job description using Gemini AI
 */
export const analyzeWithGemini = async (resumeText, jobDescription) => {
  try {
    const ai = initGemini();
    
    if (!ai) {
      console.log('Gemini API key not configured, using fallback analysis');
      return null;
    }

    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const prompt = `You are an expert resume analyzer and career coach. Analyze this resume against the job description and provide detailed feedback.

RESUME:
${resumeText.substring(0, 4000)}

JOB DESCRIPTION:
${jobDescription.substring(0, 2000)}

Analyze the resume and return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "missingSkills": ["skill1", "skill2", "skill3"],
  "keywordSuggestions": ["keyword or phrase to add 1", "keyword or phrase to add 2"],
  "improvementTips": ["specific actionable tip 1", "specific actionable tip 2", "specific actionable tip 3"],
  "atsScore": 75,
  "summary": "Brief 1-2 sentence summary of the match"
}

Requirements:
- missingSkills: List 5-10 important technical skills from the job description that are missing from the resume
- keywordSuggestions: List 5-8 specific keywords or phrases to add to improve ATS matching
- improvementTips: List 4-6 specific, actionable tips to improve the resume for this role
- atsScore: Estimated ATS compatibility score from 0-100
- summary: Brief assessment of the overall match

Return ONLY the JSON object, nothing else.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        missingSkills: parsed.missingSkills || [],
        keywordSuggestions: parsed.keywordSuggestions || [],
        improvementTips: parsed.improvementTips || [],
        atsScore: parsed.atsScore || 0,
        summary: parsed.summary || ''
      };
    }
    
    return null;
  } catch (error) {
    console.error('Gemini API error:', error);
    return null;
  }
};

/**
 * Get AI-powered job recommendations
 */
export const getJobRecommendations = async (skills) => {
  try {
    const ai = initGemini();
    
    if (!ai) {
      return null;
    }

    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const prompt = `Based on these skills: ${skills.join(', ')}

Suggest 5 job titles that would be a good match. Return ONLY a JSON array of strings:
["Job Title 1", "Job Title 2", "Job Title 3", "Job Title 4", "Job Title 5"]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return null;
  } catch (error) {
    console.error('Gemini job recommendations error:', error);
    return null;
  }
};

export default { analyzeWithGemini, getJobRecommendations };
