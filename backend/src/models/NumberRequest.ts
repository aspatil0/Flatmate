import mongoose, { Schema, Document } from 'mongoose';

export interface INumberRequest extends Document {
  postId: mongoose.Types.ObjectId;
  requesterId: mongoose.Types.ObjectId;
  requesterName: string;
  requesterEmail: string;
  ownerId: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  respondedAt?: Date;
}

const numberRequestSchema = new Schema<INumberRequest>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    requesterName: {
      type: String,
      required: true,
    },
    requesterEmail: {
      type: String,
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent duplicate requests - one requester per post
numberRequestSchema.index({ postId: 1, requesterId: 1 }, { unique: true });

export default mongoose.model<INumberRequest>('NumberRequest', numberRequestSchema);
