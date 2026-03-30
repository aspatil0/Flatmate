import mongoose, { Schema } from 'mongoose';
const conversationMessageSchema = new Schema({
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
}, { _id: true });
const conversationSchema = new Schema({
    participants: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        required: true,
        validate: {
            validator: (participants) => participants.length === 2,
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
}, { timestamps: true });
conversationSchema.index({ post: 1, participants: 1 });
export default mongoose.model('Conversation', conversationSchema);
//# sourceMappingURL=Conversation.js.map