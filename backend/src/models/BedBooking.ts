import mongoose, { Schema, Document } from 'mongoose';

export interface IBedBooking extends Document {
  property: mongoose.Types.ObjectId;
  bedNumber: number;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  bookedBy?: mongoose.Types.ObjectId; // User ID
  isBooked: boolean;
  status: 'pending' | 'confirmed' | 'rejected';
  bookedAt?: Date;
  checkInDate?: Date;
  checkOutDate?: Date;
  notes?: string;
}

const bedBookingSchema = new Schema<IBedBooking>(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PGProperty',
      required: true,
    },
    bedNumber: {
      type: Number,
      required: true,
    },
    tenantName: {
      type: String,
      required: true,
    },
    tenantEmail: {
      type: String,
      required: true,
    },
    tenantPhone: {
      type: String,
      required: true,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected'],
      default: 'pending',
    },
    bookedAt: {
      type: Date,
      default: null,
    },
    checkInDate: {
      type: Date,
      default: null,
    },
    checkOutDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const BedBooking = mongoose.model<IBedBooking>('BedBooking', bedBookingSchema);

export default BedBooking;
