import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, generateToken, generateApiKey } from '../utils/auth.js';
import Joi from 'joi';

const prisma = new PrismaClient();

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(2).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const register = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password, name } = value;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        credits: true,
        createdAt: true
      }
    });

    const apiKey = await prisma.apiKey.create({
      data: {
        key: generateApiKey(),
        name: 'Default',
        userId: user.id
      }
    });

    const token = generateToken({ userId: user.id, email: user.email });

    res.status(201).json({
      message: 'User created successfully',
      user,
      token,
      apiKey: apiKey.key
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ userId: user.id, email: user.email });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        credits: user.credits
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        apiKeys: {
          select: {
            id: true,
            name: true,
            key: true,
            isActive: true,
            lastUsed: true,
            createdAt: true
          }
        }
      }
    });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createApiKey = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }

    const apiKey = await prisma.apiKey.create({
      data: {
        key: generateApiKey(),
        name: name.trim(),
        userId: req.user.id
      }
    });

    res.status(201).json({
      message: 'API key created successfully',
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        key: apiKey.key,
        createdAt: apiKey.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    
    const apiKey = await prisma.apiKey.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    await prisma.apiKey.delete({
      where: { id }
    });

    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};