import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 50, // Very high limit for development
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000, // 15 minutes
  max: process.env.NODE_ENV === 'development' 
    ? 10000 // Very high limit for development
    : parseInt(process.env.RATE_LIMIT_MAX) || 500,
  message: {
    error: 'Too many API requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const screenshotLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'development' ? 1000 : 30, // Very high limit for development
  message: {
    error: 'Too many screenshot requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});