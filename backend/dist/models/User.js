import mongoose, { Schema } from 'mongoose';
const userSchema = new Schema({
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
    avatar: {
        type: String,
        default: null,
    },
    bio: {
        type: String,
        default: null,
    },
    location: {
        type: String,
        default: null,
    },
}, { timestamps: true });
export default mongoose.model('User', userSchema);
//# sourceMappingURL=User.js.map