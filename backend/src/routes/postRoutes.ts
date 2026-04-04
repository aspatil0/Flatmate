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
  requestContactNumber,
  getNumberRequests,
  respondToNumberRequest,
  checkNumberAccess,
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

// Number request endpoints
// Request contact number from owner (requires auth)
router.post('/:postId/request-number', authMiddleware, requestContactNumber);

// Get all pending number requests for owner (requires auth)
router.get('/owner/number-requests', authMiddleware, getNumberRequests);

// Respond to number request (approve or reject) (requires auth, owner only)
router.put('/number-request/:requestId/respond', authMiddleware, respondToNumberRequest);

// Check if user has access to contact number (requires auth)
router.get('/:postId/check-number-access', authMiddleware, checkNumberAccess);

export default router;
