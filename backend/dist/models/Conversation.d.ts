import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IConversation, {}, {}, {}, mongoose.Document<unknown, {}, IConversation> & IConversation & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=Conversation.d.ts.map