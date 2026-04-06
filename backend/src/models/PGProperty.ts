import mongoose, { Schema, Document } from 'mongoose';

export interface IPGProperty extends Document {
  owner: mongoose.Types.ObjectId; // PGOwner ID
  name: string;
  description: string;
  address: string;
  city: string;
  location: string;
  totalBeds: number;
  availableBeds: number;
  pricePerBed: number;
  amenities: string[];
  images: string[];
  rules?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pgPropertySchema = new Schema<IPGProperty>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PGOwner',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    totalBeds: {
      type: Number,
      required: true,
      min: 1,
    },
    availableBeds: {
      type: Number,
      required: true,
      min: 0,
    },
    pricePerBed: {
      type: Number,
      required: true,
      min: 0,
    },
    amenities: [
      {
        type: String,
      },
    ],
    images: [
      {
        type: String,
      },
    ],
    rules: {
      type: String,
      default: null,
    },
    verified: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const PGProperty = mongoose.model<IPGProperty>('PGProperty', pgPropertySchema);

export default PGProperty;
