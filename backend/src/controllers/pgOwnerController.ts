import { Request, Response } from 'express';
import PGOwner from '../models/PGOwner.js';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { validatePasswordStrength } from '../utils/passwordValidator.js';

// Register PG Owner
export const registerPGOwner = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, companyName, location } = req.body;

    // Validate input
    if (!name || !email || !password || !companyName || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: 'Password does not meet security requirements',
        details: passwordValidation.errors 
      });
    }

    // Check if PG owner already exists
    const existingOwner = await PGOwner.findOne({ email });
    if (existingOwner) {
      return res.status(400).json({ error: 'PG Owner with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create PG owner
    const pgOwner = new PGOwner({
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      companyName,
      location,
    });

    await pgOwner.save();

    // Generate JWT token
    const token = jwt.sign(
      { pgOwnerId: pgOwner._id, type: 'pgowner' },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: process.env.JWT_EXPIRATION || '7d' } as SignOptions
    );

    res.status(201).json({
      message: 'PG Owner registered successfully',
      token,
      pgOwner: { 
        id: pgOwner._id, 
        name: pgOwner.name, 
        email: pgOwner.email,
        companyName: pgOwner.companyName,
        location: pgOwner.location,
      },
    });
  } catch (error) {
    console.error('Error registering PG Owner:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login PG Owner
export const loginPGOwner = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find PG owner
    const pgOwner = await PGOwner.findOne({ email });
    if (!pgOwner) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, pgOwner.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { pgOwnerId: pgOwner._id, type: 'pgowner' },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: process.env.JWT_EXPIRATION || '7d' } as SignOptions
    );

    res.json({
      message: 'Login successful',
      token,
      pgOwner: { 
        id: pgOwner._id, 
        name: pgOwner.name, 
        email: pgOwner.email,
        companyName: pgOwner.companyName,
        location: pgOwner.location,
      },
    });
  } catch (error) {
    console.error('Error logging in PG Owner:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get PG Owner profile
export const getPGOwnerProfile = async (req: Request, res: Response) => {
  try {
    const pgOwnerId = (req as any).pgOwnerId;

    if (!pgOwnerId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const pgOwner = await PGOwner.findById(pgOwnerId).populate('properties');
    if (!pgOwner) {
      return res.status(404).json({ error: 'PG Owner not found' });
    }

    res.json({
      pgOwner: {
        id: pgOwner._id,
        name: pgOwner.name,
        email: pgOwner.email,
        phone: pgOwner.phone,
        companyName: pgOwner.companyName,
        location: pgOwner.location,
        description: pgOwner.description,
        avatar: pgOwner.avatar,
        properties: pgOwner.properties,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update PG Owner profile
export const updatePGOwnerProfile = async (req: Request, res: Response) => {
  try {
    const pgOwnerId = (req as any).pgOwnerId;
    const { name, phone, companyName, location, description, avatar } = req.body;

    if (!pgOwnerId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const pgOwner = await PGOwner.findByIdAndUpdate(
      pgOwnerId,
      {
        $set: {
          ...(name && { name }),
          ...(phone && { phone }),
          ...(companyName && { companyName }),
          ...(location && { location }),
          ...(description && { description }),
          ...(avatar && { avatar }),
        },
      },
      { new: true }
    );

    if (!pgOwner) {
      return res.status(404).json({ error: 'PG Owner not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      pgOwner: {
        id: pgOwner._id,
        name: pgOwner.name,
        email: pgOwner.email,
        phone: pgOwner.phone,
        companyName: pgOwner.companyName,
        location: pgOwner.location,
        description: pgOwner.description,
        avatar: pgOwner.avatar,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
