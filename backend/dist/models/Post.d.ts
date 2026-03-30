import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IPost, {}, {}, {}, mongoose.Document<unknown, {}, IPost> & IPost & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=Post.d.ts.map