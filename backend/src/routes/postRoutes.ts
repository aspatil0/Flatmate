import express from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getUserPosts,
  addInterestedUser,
  createBookingRequest,
  getBookingRequests,
  respondToBookingRequest,
} from '../controllers/postController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Create a new post (requires auth)
router.post('/', authMiddleware, createPost);

// Get all posts (public)
router.get('/', getPosts);

// Get a single post by ID (public)
router.get('/:id', getPostById);

// Update a post (requires auth, owner only)
router.put('/:id', authMiddleware, updatePost);

// Delete a post (requires auth, owner only)
router.delete('/:id', authMiddleware, deletePost);

// Get user's own posts (requires auth)
router.get('/user/my-posts', authMiddleware, getUserPosts);

// Add user to interested list (requires auth)
router.post('/:id/interested', authMiddleware, addInterestedUser);

// Create a booking request (requires auth)
router.post('/:id/book', authMiddleware, createBookingRequest);

// Get booking requests for owner (requires auth)
router.get('/owner/bookings', authMiddleware, getBookingRequests);

// Respond to booking request (requires auth, owner only)
router.put('/:id/booking-response', authMiddleware, respondToBookingRequest);

export default router;
