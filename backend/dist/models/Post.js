import mongoose, { Schema } from 'mongoose';
const postSchema = new Schema({
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
}, { timestamps: true });
export default mongoose.model('Post', postSchema);
//# sourceMappingURL=Post.js.map