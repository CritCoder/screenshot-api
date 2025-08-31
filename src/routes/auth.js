import express from 'express';
import { register, login, getProfile, createApiKey, deleteApiKey } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', requireAuth, getProfile);
router.post('/api-keys', requireAuth, createApiKey);
router.delete('/api-keys/:id', requireAuth, deleteApiKey);

export default router;