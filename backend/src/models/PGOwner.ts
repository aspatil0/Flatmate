import mongoose, { Schema, Document } from 'mongoose';

export interface IPGOwner extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  companyName: string;
  location: string;
  description?: string;
  avatar?: string;
  properties?: string[]; // Array of property IDs
  createdAt: Date;
  updatedAt: Date;
}

const pgOwnerSchema = new Schema<IPGOwner>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /.+\@.+\..+/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      default: null,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    properties: [
      {
        type: Schema.Types.ObjectId,
        ref: 'PGProperty',
      },
    ],
  },
  { timestamps: true }
);

const PGOwner = mongoose.model<IPGOwner>('PGOwner', pgOwnerSchema);

export default PGOwner;
