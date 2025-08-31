import express from 'express';
import { takeScreenshot, takeScreenshotGet, generatePDF, getHistory, getUsage } from '../controllers/screenshotController.js';
import { requireApiKey } from '../middleware/auth.js';
import { screenshotLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/', screenshotLimiter, requireApiKey, takeScreenshot);
router.get('/', screenshotLimiter, requireApiKey, takeScreenshotGet);
router.post('/pdf', screenshotLimiter, requireApiKey, generatePDF);
router.get('/history', requireApiKey, getHistory);
router.get('/usage', requireApiKey, getUsage);

export default router;