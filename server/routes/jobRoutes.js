import express from 'express';
import { searchJobs, getRecommendations, getProviderStatus } from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/search', searchJobs);
router.get('/recommendations', getRecommendations);
router.get('/provider-status', getProviderStatus);

export default router;
