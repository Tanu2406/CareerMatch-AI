import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';
import Analysis from '../models/Analysis.js';
import PDFDocument from 'pdfkit';
import { extractTextFromFile } from '../utils/pdfParser.js';
import { calculateMatchScore, generateKeywordSuggestions, generateBasicTips, extractSkills } from '../utils/skillMatcher.js';
import { analyzeWithGemini } from '../utils/geminiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'), false);
  }
};

// Multer upload configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Store uploaded resume text temporarily in memory (for the session)
const userResumeCache = new Map();

// @desc    Upload resume
// @route   POST /api/resume/upload
// @access  Private
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const filePath = req.file.path;
    
    // Extract text from the uploaded file
    const resumeText = await extractTextFromFile(filePath);
    
    // Store in cache for later use
    userResumeCache.set(req.user.id.toString(), {
      text: resumeText,
      fileName: req.file.originalname,
      filePath: filePath
    });

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        textLength: resumeText.length
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading resume',
      error: error.message
    });
  }
};

// @desc    Analyze resume against job description
// @route   POST /api/resume/analyze
// @access  Private
export const analyzeResume = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    const userId = req.user.id.toString();

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a job description'
      });
    }

    // Get cached resume
    const cachedResume = userResumeCache.get(userId);
    
    if (!cachedResume) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume first'
      });
    }

    const { text: resumeText, fileName: resumeFileName } = cachedResume;

    // Calculate match score using local algorithm
    const matchResult = calculateMatchScore(resumeText, jobDescription);

    // Try to get AI-powered analysis
    let aiAnalysis = await analyzeWithGemini(resumeText, jobDescription);

    // Combine local and AI analysis
    let finalResult;
    
    if (aiAnalysis) {
      finalResult = {
        matchScore: matchResult.matchScore,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: aiAnalysis.missingSkills.length > 0 
          ? aiAnalysis.missingSkills 
          : matchResult.missingSkills,
        keywordSuggestions: aiAnalysis.keywordSuggestions.length > 0 
          ? aiAnalysis.keywordSuggestions 
          : generateKeywordSuggestions(matchResult.missingSkills),
        improvementTips: aiAnalysis.improvementTips.length > 0 
          ? aiAnalysis.improvementTips 
          : generateBasicTips(matchResult.matchScore, matchResult.missingSkills),
        atsScore: aiAnalysis.atsScore || matchResult.matchScore,
        summary: aiAnalysis.summary || ''
      };
    } else {
      finalResult = {
        matchScore: matchResult.matchScore,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills,
        keywordSuggestions: generateKeywordSuggestions(matchResult.missingSkills),
        improvementTips: generateBasicTips(matchResult.matchScore, matchResult.missingSkills),
        atsScore: matchResult.matchScore,
        summary: `Your resume matches ${matchResult.matchScore}% of the job requirements.`
      };
    }

    // Save analysis to database (include resumeSkills and breakdown when available)
    const resumeSkills = extractSkills(resumeText);
    const analysis = await Analysis.create({
      userId: req.user.id,
      resumeText: resumeText.substring(0, 10000),
      resumeFileName,
      jobDescription: jobDescription.substring(0, 5000),
      matchScore: finalResult.matchScore,
      matchedSkills: finalResult.matchedSkills,
      missingSkills: finalResult.missingSkills,
      resumeSkills,
      breakdown: finalResult.breakdown || null,
      overallScore: finalResult.overallScore || finalResult.matchScore,
      keywordSuggestions: finalResult.keywordSuggestions,
      improvementTips: finalResult.improvementTips
    });

    res.json({
      success: true,
      message: 'Analysis complete',
      data: {
        analysisId: analysis._id,
        ...finalResult
      }
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing resume',
      error: error.message
    });
  }
};

// @desc    Get analysis history
// @route   GET /api/resume/history
// @access  Private
export const getHistory = async (req, res) => {
  try {
    // Verify user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const analyses = await Analysis.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-resumeText -jobDescription');

    console.log(`[History] Fetched ${analyses.length} analyses for user ${req.user.id}`);

    res.json({
      success: true,
      data: analyses,
      count: analyses.length
    });
  } catch (error) {
    console.error('[History] Error fetching history:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/resume/stats
// @access  Private
export const getStats = async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user.id });

    const totalAnalyses = analyses.length;
    const lastScore = analyses.length > 0 ? analyses[0].matchScore : 0;
    const avgMatchRate = totalAnalyses > 0 
      ? Math.round(analyses.reduce((sum, a) => sum + a.matchScore, 0) / totalAnalyses)
      : 0;
    const totalSuggestions = analyses.reduce((sum, a) => 
      sum + (a.improvementTips?.length || 0) + (a.keywordSuggestions?.length || 0), 0
    );

    res.json({
      success: true,
      data: {
        totalAnalyses,
        lastScore,
        avgMatchRate,
        totalSuggestions
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// @desc    Get latest analysis
// @route   GET /api/resume/latest
// @access  Private
export const getLatestAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ userId: req.user.id })
      .sort({ createdAt: -1 });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'No analysis found'
      });
    }

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Get latest analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching latest analysis',
      error: error.message
    });
  }
};

// @desc    Get single analysis by ID
// @route   GET /api/resume/:id
// @access  Private
export const getAnalysisById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find analysis and ensure it belongs to the logged-in user
    const analysis = await Analysis.findOne({ 
      _id: id, 
      userId: req.user.id 
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Get analysis by ID error:', error);
    
    // Handle invalid MongoDB ID format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invalid analysis ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching analysis',
      error: error.message
    });
  }
};

// @desc    Download analysis report as PDF
// @route   GET /api/resume/:id/download
// @access  Private
export const downloadAnalysisPdf = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const analysis = await Analysis.findOne({ _id: id, userId: req.user.id });

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=analysis-report-${analysis._id}.pdf`);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Stream PDF to response
    doc.pipe(res);

    // Title
    doc.font('Helvetica-Bold').fontSize(20).text('CAREERMATCH AI REPORT', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.options.margin, doc.y).stroke();
    doc.moveDown(1);

    // Resume name
    doc.font('Helvetica').fontSize(12).text(`Resume Name: ${analysis.resumeFileName || 'N/A'}`);
    doc.moveDown(0.5);

    // Match Score (large, bold)
    doc.font('Helvetica-Bold').fontSize(28).fillColor('#111827').text(`${analysis.matchScore}%`, { align: 'center' });
    doc.moveDown(0.5);

    doc.fillColor('#000000');
    doc.moveDown(0.5);
    doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.options.margin, doc.y).stroke();
    doc.moveDown(1);

    // Matched Skills
    doc.font('Helvetica-Bold').fontSize(14).text('Matched Skills', { underline: false });
    doc.moveDown(0.3);
    if (analysis.matchedSkills && analysis.matchedSkills.length > 0) {
      analysis.matchedSkills.forEach((skill) => {
        doc.font('Helvetica').fontSize(12).text(`- ${skill}`);
      });
    } else {
      doc.font('Helvetica').fontSize(12).text('- None');
    }

    doc.moveDown(1);

    // Missing Skills
    doc.font('Helvetica-Bold').fontSize(14).text('Missing Skills');
    doc.moveDown(0.3);
    if (analysis.missingSkills && analysis.missingSkills.length > 0) {
      analysis.missingSkills.forEach((skill) => {
        doc.font('Helvetica').fontSize(12).text(`- ${skill}`);
      });
    } else {
      doc.font('Helvetica').fontSize(12).text('- None');
    }

    doc.moveDown(1);

    // Improvement Suggestions
    doc.font('Helvetica-Bold').fontSize(14).text('Improvement Suggestions');
    doc.moveDown(0.3);
    if (analysis.improvementTips && analysis.improvementTips.length > 0) {
      analysis.improvementTips.forEach((tip, idx) => {
        doc.font('Helvetica').fontSize(12).text(`${idx + 1}. ${tip}`);
        doc.moveDown(0.2);
      });
    } else {
      doc.font('Helvetica').fontSize(12).text('- No suggestions available');
    }

    doc.moveDown(1);

    // Generated On
    const genDate = new Date(analysis.createdAt || Date.now()).toLocaleString();
    doc.font('Helvetica-Bold').fontSize(12).text('Generated On:');
    doc.font('Helvetica').fontSize(12).text(genDate);

    // Finalize PDF and end stream
    doc.end();
  } catch (error) {
    console.error('[PDF] Error generating PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Failed to generate PDF' });
    } else {
      try { res.end(); } catch (e) { }
    }
  }
};
