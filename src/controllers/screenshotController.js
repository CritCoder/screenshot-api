import { PrismaClient } from '@prisma/client';
import ScreenshotService from '../services/screenshotService.js';
import Joi from 'joi';

const prisma = new PrismaClient();
const screenshotService = new ScreenshotService();

// Make service globally available for cleanup
global.screenshotService = screenshotService;

const screenshotSchema = Joi.object({
  url: Joi.string().uri().required(),
  format: Joi.string().valid('png', 'jpeg', 'webp').default('png'),
  quality: Joi.number().integer().min(1).max(100).default(80),
  width: Joi.number().integer().min(100).max(3840).default(1920),
  height: Joi.number().integer().min(100).max(2160).default(1080),
  fullPage: Joi.boolean().default(false),
  waitFor: Joi.number().integer().min(0).max(30000).default(0),
  selector: Joi.string().allow(null).default(null),
  device: Joi.string().valid('iPhone 12', 'iPad Pro', 'Pixel 5', 'Desktop HD', 'Desktop 4K').allow(null).default(null),
  browser: Joi.string().valid('chromium', 'firefox', 'webkit').default('chromium'),
  scrollToBottom: Joi.boolean().default(false),
  hideElements: Joi.array().items(Joi.string()).default([]),
  timeout: Joi.number().integer().min(5000).max(60000).default(30000),
  api_key: Joi.string().optional()
}).unknown(false);

const pdfSchema = Joi.object({
  url: Joi.string().uri().required(),
  format: Joi.string().valid('A4', 'A3', 'A5', 'Letter', 'Legal', 'Tabloid').default('A4'),
  landscape: Joi.boolean().default(false),
  printBackground: Joi.boolean().default(true),
  margin: Joi.object({
    top: Joi.string().default('1cm'),
    bottom: Joi.string().default('1cm'),
    left: Joi.string().default('1cm'),
    right: Joi.string().default('1cm')
  }).default({ top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' }),
  waitFor: Joi.number().integer().min(0).max(30000).default(0),
  timeout: Joi.number().integer().min(5000).max(60000).default(30000),
  scale: Joi.number().min(0.1).max(2).default(1)
});

const deductCredit = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: { credits: { decrement: 1 } }
  });
};

const logRequest = async (userId, apiKeyId, type, options, result, error = null) => {
  const requestData = {
    userId,
    apiKeyId,
    url: options.url,
    type,
    options: JSON.stringify(options),
    status: error ? 'failed' : 'completed',
    errorMessage: error?.message || null
  };

  if (result) {
    requestData.filePath = result.filePath;
    requestData.fileSize = result.size;
  }

  return prisma.request.create({ data: requestData });
};

export const takeScreenshot = async (req, res) => {
  const startTime = Date.now();

  try {
    const { error, value } = screenshotSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await screenshotService.takeScreenshot(value);
    const processingTime = Date.now() - startTime;

    await deductCredit(req.user.id);
    await logRequest(req.user.id, req.apiKey.id, 'screenshot', value, { ...result, processingTime });

    res.json({
      success: true,
      screenshot: result,
      processingTime,
      creditsRemaining: req.user.credits - 1
    });

  } catch (err) {
    const processingTime = Date.now() - startTime;
    await logRequest(req.user.id, req.apiKey.id, 'screenshot', req.body, null, err);
    
    res.status(500).json({
      error: 'Screenshot generation failed',
      message: err.message,
      processingTime
    });
  }
};

export const takeScreenshotGet = async (req, res) => {
  const startTime = Date.now();

  try {
    // Convert query parameters to the expected format
    const queryParams = { ...req.query };
    
    // Convert boolean strings to actual booleans
    if (queryParams.fullPage !== undefined) {
      queryParams.fullPage = queryParams.fullPage === 'true';
    }
    if (queryParams.scrollToBottom !== undefined) {
      queryParams.scrollToBottom = queryParams.scrollToBottom === 'true';
    }
    
    // Convert numeric strings to numbers
    if (queryParams.quality) queryParams.quality = parseInt(queryParams.quality);
    if (queryParams.width) queryParams.width = parseInt(queryParams.width);
    if (queryParams.height) queryParams.height = parseInt(queryParams.height);
    if (queryParams.waitFor) queryParams.waitFor = parseInt(queryParams.waitFor);
    if (queryParams.timeout) queryParams.timeout = parseInt(queryParams.timeout);
    
    // Handle hideElements array (comma-separated string)
    if (queryParams.hideElements) {
      queryParams.hideElements = queryParams.hideElements.split(',').map(s => s.trim()).filter(s => s);
    }

    const { error, value } = screenshotSchema.validate(queryParams);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Remove api_key from validated data before passing to screenshot service
    const { api_key, ...screenshotOptions } = value;
    const result = await screenshotService.takeScreenshot(screenshotOptions);
    const processingTime = Date.now() - startTime;

    await deductCredit(req.user.id);
    await logRequest(req.user.id, req.apiKey.id, 'screenshot', screenshotOptions, { ...result, processingTime });

    res.json({
      success: true,
      screenshot: result,
      processingTime,
      creditsRemaining: req.user.credits - 1
    });

  } catch (err) {
    const processingTime = Date.now() - startTime;
    await logRequest(req.user.id, req.apiKey.id, 'screenshot', req.query, null, err);
    
    res.status(500).json({
      error: 'Screenshot generation failed',
      message: err.message,
      processingTime
    });
  }
};

export const generatePDF = async (req, res) => {
  const startTime = Date.now();

  try {
    const { error, value } = pdfSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await screenshotService.generatePDF(value);
    const processingTime = Date.now() - startTime;

    await deductCredit(req.user.id);
    await logRequest(req.user.id, req.apiKey.id, 'pdf', value, { ...result, processingTime });

    res.json({
      success: true,
      pdf: result,
      processingTime,
      creditsRemaining: req.user.credits - 1
    });

  } catch (err) {
    const processingTime = Date.now() - startTime;
    await logRequest(req.user.id, req.apiKey.id, 'pdf', req.body, null, err);
    
    res.status(500).json({
      error: 'PDF generation failed',
      message: err.message,
      processingTime
    });
  }
};

export const getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 50, type, status } = req.query;
    
    const where = { userId: req.user.id };
    if (type) where.type = type;
    if (status) where.status = status;

    const requests = await prisma.request.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      select: {
        id: true,
        url: true,
        type: true,
        status: true,
        filePath: true,
        fileSize: true,
        processingTime: true,
        errorMessage: true,
        createdAt: true,
        completedAt: true
      }
    });

    const total = await prisma.request.count({ where });

    res.json({
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

export const getUsage = async (req, res) => {
  try {
    const { month } = req.query;
    const currentMonth = month || new Date().toISOString().slice(0, 7); // YYYY-MM

    const usage = await prisma.usage.findUnique({
      where: {
        userId_month: {
          userId: req.user.id,
          month: currentMonth
        }
      }
    });

    const requestCount = await prisma.request.count({
      where: {
        userId: req.user.id,
        createdAt: {
          gte: new Date(`${currentMonth}-01`),
          lt: new Date(new Date(`${currentMonth}-01`).setMonth(new Date(`${currentMonth}-01`).getMonth() + 1))
        }
      }
    });

    res.json({
      month: currentMonth,
      requests: requestCount,
      credits: usage?.credits || 0,
      creditsRemaining: req.user.credits
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch usage' });
  }
};