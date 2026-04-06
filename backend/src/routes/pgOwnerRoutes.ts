import express from 'express';
import {
  registerPGOwner,
  loginPGOwner,
  getPGOwnerProfile,
  updatePGOwnerProfile,
} from '../controllers/pgOwnerController.js';
import { pgOwnerAuth } from '../middleware/pgAuth.js';

const router = express.Router();

// Public routes
router.post('/register', registerPGOwner);
router.post('/login', loginPGOwner);

// Protected routes
router.get('/profile', pgOwnerAuth, getPGOwnerProfile);
router.put('/profile', pgOwnerAuth, updatePGOwnerProfile);

export default router;
