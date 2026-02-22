import express from 'express';
import { 
  uploadResume, 
  analyzeResume,
  extractCleanSkillsEndpoint,
  getHistory, 
  getStats,
  getLatestAnalysis,
  getAnalysisById,
  downloadAnalysisPdf,
  upload 
} from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/upload', upload.single('resume'), uploadResume);
router.post('/analyze', analyzeResume);
router.get('/extract-skills', extractCleanSkillsEndpoint);
router.get('/history', getHistory);
router.get('/stats', getStats);
router.get('/latest', getLatestAnalysis);
router.get('/report/:id', downloadAnalysisPdf);
router.get('/:id/download', downloadAnalysisPdf);
router.get('/:id', getAnalysisById);

export default router;
