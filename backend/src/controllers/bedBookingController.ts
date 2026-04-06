import { Request, Response } from 'express';
import BedBooking from '../models/BedBooking.js';
import PGProperty from '../models/PGProperty.js';

// Book a bed
export const bookBed = async (req: Request, res: Response) => {
  try {
    const { propertyId, bedNumber, tenantName, tenantEmail, tenantPhone } = req.body;

    if (!propertyId || !bedNumber || !tenantName || !tenantEmail || !tenantPhone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (bedNumber < 1 || bedNumber > 100) {
      return res.status(400).json({ error: 'Invalid bed number' });
    }

    // Check if property exists
    const property = await PGProperty.findById(propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Check if bed is already booked
    const existingBooking = await BedBooking.findOne({
      property: propertyId,
      bedNumber: bedNumber,
      isBooked: true,
    });

    if (existingBooking) {
      return res.status(409).json({ error: 'This bed is already booked' });
    }

    // Create booking
    const booking = new BedBooking({
      property: propertyId,
      bedNumber,
      tenantName,
      tenantEmail,
      tenantPhone,
      isBooked: false, // Pending owner confirmation
      status: 'pending',
    });

    await booking.save();

    res.status(201).json({
      message: 'Booking request submitted successfully',
      booking: {
        id: booking._id,
        propertyId: property._id,
        propertyName: property.name,
        bedNumber: booking.bedNumber,
        tenantName: booking.tenantName,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error('Error booking bed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get bookings for a property owner
export const getOwnerBookings = async (req: Request, res: Response) => {
  try {
    const pgOwnerId = (req as any).pgOwnerId;
    console.log('getOwnerBookings called for pgOwnerId:', pgOwnerId);

    if (!pgOwnerId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get all properties for this owner
    const properties = await PGProperty.find({ owner: pgOwnerId });
    console.log('Found properties count for owner:', properties.length);
    const propertyIds = properties.map(p => p._id);

    // Get all bookings for these properties
    const bookings = await BedBooking.find({
      property: { $in: propertyIds },
    }).populate({
      path: 'property',
      select: 'name city',
    }).sort({ createdAt: -1 });

    const formattedBookings = bookings.map((booking: any) => {
      const prop = booking.property as any;
      return {
        _id: booking._id,
        propertyId: prop?._id || booking.property,
        propertyName: prop?.name || 'Unknown',
        city: prop?.city || 'Unknown',
        tenantName: booking.tenantName,
        tenantEmail: booking.tenantEmail,
        tenantPhone: booking.tenantPhone,
        bedNumber: booking.bedNumber,
        status: booking.status,
        createdAt: (booking as any).createdAt,
        updatedAt: (booking as any).updatedAt,
      };
    });

    console.log('Formatted bookings sent to owner:', JSON.stringify(formattedBookings, null, 2));

    res.json({
      bookings: formattedBookings,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) });
  }
};

// Confirm a booking
export const confirmBooking = async (req: Request, res: Response) => {
  try {
    const pgOwnerId = (req as any).pgOwnerId;
    const { bookingId } = req.params;

    if (!pgOwnerId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const booking = await BedBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify ownership
    const property = await PGProperty.findById(booking.property);
    if (!property || property.owner.toString() !== pgOwnerId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if bed is still available
    const conflictingBooking = await BedBooking.findOne({
      property: booking.property,
      bedNumber: booking.bedNumber,
      status: 'confirmed',
      _id: { $ne: bookingId },
    });

    if (conflictingBooking) {
      return res.status(409).json({ error: 'Bed is already booked by another user' });
    }

    // Confirm booking
    booking.status = 'confirmed';
    booking.isBooked = true;
    await booking.save();

    // Update property available beds
    await PGProperty.findByIdAndUpdate(
      booking.property,
      { $inc: { availableBeds: -1 } }
    );

    // Log property available beds after update for debugging
    const updatedProp = await PGProperty.findById(booking.property);
    console.log('Booking confirmed:', booking._id.toString(), 'Property availableBeds now:', updatedProp?.availableBeds);

    res.json({
      message: 'Booking confirmed',
      booking: {
        id: booking._id,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Reject a booking
export const rejectBooking = async (req: Request, res: Response) => {
  try {
    const pgOwnerId = (req as any).pgOwnerId;
    const { bookingId } = req.params;

    if (!pgOwnerId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const booking = await BedBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify ownership
    const property = await PGProperty.findById(booking.property);
    if (!property || property.owner.toString() !== pgOwnerId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete booking
    await BedBooking.deleteOne({ _id: bookingId });

    res.json({
      message: 'Booking rejected',
    });
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Unbook a confirmed booking (owner can free up a bed)
export const unbookBooking = async (req: Request, res: Response) => {
  try {
    const pgOwnerId = (req as any).pgOwnerId;
    const { bookingId } = req.params;

    if (!pgOwnerId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const booking = await BedBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify ownership
    const property = await PGProperty.findById(booking.property);
    if (!property || property.owner.toString() !== pgOwnerId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // If booking was confirmed, free up the bed count
    if (booking.status === 'confirmed' || booking.isBooked) {
      await PGProperty.findByIdAndUpdate(booking.property, { $inc: { availableBeds: 1 } });
    }

    // Mark booking as rejected/unbooked
    booking.status = 'rejected';
    booking.isBooked = false;
    await booking.save();

    res.json({ message: 'Booking unbooked and bed freed', bookingId: booking._id });
  } catch (error) {
    console.error('Error unbooking booking:', error);
    if (error instanceof Error) console.error(error.stack);
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) });
  }
};
