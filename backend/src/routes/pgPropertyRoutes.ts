import express from 'express';
import {
  createProperty,
  getOwnerProperties,
  getAllProperties,
  getPropertyDetails,
  updateProperty,
  deleteProperty,
} from '../controllers/pgPropertyController.js';
import {
  bookBed,
  getOwnerBookings,
  confirmBooking,
  rejectBooking,
  unbookBooking,
} from '../controllers/bedBookingController.js';
import { pgOwnerAuth } from '../middleware/pgAuth.js';
import PGProperty from '../models/PGProperty.js';
import PGOwner from '../models/PGOwner.js';

const router = express.Router();

// Debug endpoints - to help troubleshoot data flow
router.get('/debug/count', async (req, res) => {
  try {
    const totalCount = await PGProperty.countDocuments();
    const properties = await PGProperty.find().limit(5);
    const owners = await PGOwner.countDocuments();
    
    res.json({
      totalPropertiesCount: totalCount,
      totalOwnersCount: owners,
      sampleProperties: properties.map(p => ({
        id: p._id,
        name: p.name,
        city: p.city,
        owner: p.owner,
        verified: p.verified,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Debug failed', details: error instanceof Error ? error.message : String(error) });
  }
});

// Debug endpoint - test basic query
router.get('/debug/raw-all', async (req, res) => {
  try {
    const properties = await PGProperty.find({});
    res.json({
      count: properties.length,
      properties: properties.map(p => ({
        id: p._id,
        name: p.name,
        city: p.city,
        owner: p.owner,
        verified: p.verified,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Query failed', details: error instanceof Error ? error.message : String(error) });
  }
});

// Public routes - list and actions
router.get('/all', getAllProperties);

// Booking routes (must be before dynamic /:propertyId to avoid conflicts)
router.post('/book-bed', bookBed); // Public - users can book
router.get('/bookings', pgOwnerAuth, getOwnerBookings); // Protected - owner only
router.post('/bookings/:bookingId/confirm', pgOwnerAuth, confirmBooking); // Protected - owner only
router.post('/bookings/:bookingId/reject', pgOwnerAuth, rejectBooking); // Protected - owner only
router.post('/bookings/:bookingId/unbook', pgOwnerAuth, unbookBooking); // Protected - owner only - owner frees a booked bed

// Protected routes (PG Owner)
router.post('/create', pgOwnerAuth, createProperty);
router.get('/owner/properties', pgOwnerAuth, getOwnerProperties);
router.put('/:propertyId', pgOwnerAuth, updateProperty);
router.delete('/:propertyId', pgOwnerAuth, deleteProperty);

// Dynamic property detail (must come last)
router.get('/:propertyId', getPropertyDetails);

export default router;
