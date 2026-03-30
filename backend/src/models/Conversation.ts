import mongoose, { Document, Schema } from 'mongoose';

export interface IConversationMessage {
  _id?: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
  readBy: mongoose.Types.ObjectId[];
}

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  post: mongoose.Types.ObjectId;
  messages: IConversationMessage[];
  lastMessageText?: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const conversationMessageSchema = new Schema<IConversationMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    readBy: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  { _id: true }
);

const conversationSchema = new Schema<IConversation>(
  {
    participants: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      required: true,
      validate: {
        validator: (participants: mongoose.Types.ObjectId[]) => participants.length === 2,
        message: 'A conversation must have exactly two participants',
      },
      index: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    messages: {
      type: [conversationMessageSchema],
      default: [],
    },
    lastMessageText: {
      type: String,
      default: '',
      trim: true,
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

conversationSchema.index({ post: 1, participants: 1 });

export default mongoose.model<IConversation>('Conversation', conversationSchema);
