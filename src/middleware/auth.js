import { verifyToken } from '../utils/auth.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, plan: true, credits: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true }
    });

    if (!keyRecord || !keyRecord.isActive) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    if (keyRecord.user.credits <= 0) {
      return res.status(402).json({ error: 'Insufficient credits' });
    }

    await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsed: new Date() }
    });

    req.user = keyRecord.user;
    req.apiKey = keyRecord;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};