import mongoose, { Schema, Document } from 'mongoose';

export interface IBookingRequest {
  tenantId: mongoose.Types.ObjectId;
  tenantName: string;
  tenantEmail: string;
  tenantPhone?: string;
  status: 'pending' | 'accepted' | 'rejected';
  requestedAt: Date;
  respondedAt?: Date;
}

export interface IPost extends Document {
  title: string;
  description: string;
  location: string;
  rent: number;
  contactNumber?: string;
  deposit?: number;
  roomType: 'room' | '1BHK' | '2BHK' | '3BHK' | 'shared' | 'Studio';
  bhkSize?: string;
  availableFrom: Date;
  images: string[];
  amenities: string[];
  tenantType?: 'Anyone' | 'Girls' | 'Boys';
  smokerAllowed?: boolean;
  drinkerAllowed?: boolean;
  owner: mongoose.Types.ObjectId;
  status: 'available' | 'booked' | 'inactive';
  interestedUsers?: mongoose.Types.ObjectId[];
  bookingRequests?: IBookingRequest[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
      index: true,
    },
    rent: {
      type: Number,
      required: true,
      min: 0,
    },
    contactNumber: {
      type: String,
      default: '',
      trim: true,
    },
    deposit: {
      type: Number,
      default: 0,
      min: 0,
    },
    roomType: {
      type: String,
      enum: ['room', '1BHK', '2BHK', '3BHK', 'shared', 'Studio'],
      required: true,
    },
    bhkSize: {
      type: String,
      default: null,
    },
    availableFrom: {
      type: Date,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    tenantType: {
      type: String,
      enum: ['Anyone', 'Girls', 'Boys'],
      default: 'Anyone',
    },
    smokerAllowed: {
      type: Boolean,
      default: false,
    },
    drinkerAllowed: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['available', 'booked', 'inactive'],
      default: 'available',
      index: true,
    },
    interestedUsers: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    bookingRequests: [
      {
        tenantId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
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
          default: null,
        },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending',
        },
        requestedAt: {
          type: Date,
          default: Date.now,
        },
        respondedAt: {
          type: Date,
          default: null,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IPost>('Post', postSchema);
