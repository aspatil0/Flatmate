import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

const buildConversationSummary = (conversation: any, currentUserId: string) => {
  const otherParticipant = (conversation.participants || []).find(
    (participant: any) => participant._id?.toString() !== currentUserId
  );

  const unreadCount = (conversation.messages || []).filter(
    (message: any) =>
      message.sender?.toString() !== currentUserId &&
      !(message.readBy || []).some((reader: any) => reader?.toString() === currentUserId)
  ).length;

  return {
    id: conversation._id,
    postId: conversation.post?._id || conversation.post,
    postTitle: conversation.post?.title || 'Listing',
    postLocation: conversation.post?.location || '',
    otherParticipant: otherParticipant
      ? {
          id: otherParticipant._id,
          name: otherParticipant.name,
          email: otherParticipant.email,
        }
      : null,
    lastMessageText: conversation.lastMessageText || '',
    lastMessageAt: conversation.lastMessageAt,
    unreadCount,
  };
};

export const startConversation = async (req: Request, res: Response) => {
  try {
    const { postId, participantId } = req.body;
    const currentUserId = req.userId;

    if (!currentUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: 'Valid postId is required' });
    }

    const post = await Post.findById(postId).populate('owner', 'name email');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const ownerId = post.owner._id.toString();
    let otherParticipantId = ownerId;

    if (participantId) {
      if (!mongoose.Types.ObjectId.isValid(participantId)) {
        return res.status(400).json({ error: 'Invalid participantId' });
      }

      if (currentUserId !== ownerId) {
        return res.status(403).json({ error: 'Only the post owner can choose another participant' });
      }

      otherParticipantId = participantId;
    } else if (currentUserId === ownerId) {
      return res.status(400).json({ error: 'participantId is required when starting a chat as the post owner' });
    }

    if (otherParticipantId === currentUserId) {
      return res.status(400).json({ error: 'You cannot create a conversation with yourself' });
    }

    const otherParticipant = await User.findById(otherParticipantId).select('name email');

    if (!otherParticipant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    const participantIds = [currentUserId, otherParticipantId]
      .map((id) => new mongoose.Types.ObjectId(id))
      .sort((a, b) => a.toString().localeCompare(b.toString()));

    let conversation = await Conversation.findOne({
      post: post._id,
      participants: { $all: participantIds, $size: 2 },
    })
      .populate('participants', 'name email')
      .populate('post', 'title location');

    if (!conversation) {
      conversation = await Conversation.create({
        post: post._id,
        participants: participantIds,
        messages: [],
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name email')
        .populate('post', 'title location');
    }

    return res.status(201).json({
      message: 'Conversation ready',
      conversation: buildConversationSummary(conversation, currentUserId),
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getConversations = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.userId;

    if (!currentUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversations = await Conversation.find({
      participants: new mongoose.Types.ObjectId(currentUserId),
    })
      .populate('participants', 'name email')
      .populate('post', 'title location')
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    return res.json({
      conversations: conversations.map((conversation) =>
        buildConversationSummary(conversation, currentUserId)
      ),
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getConversationMessages = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.userId;
    const { id } = req.params;

    if (!currentUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    const conversation = await Conversation.findById(id)
      .populate('participants', 'name email')
      .populate('post', 'title location');

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      (participant: any) => participant._id.toString() === currentUserId
    );

    if (!isParticipant) {
      return res.status(403).json({ error: 'You are not allowed to view this conversation' });
    }

    let hasUnreadUpdates = false;

    conversation.messages.forEach((message: any) => {
      const alreadyRead = (message.readBy || []).some((reader: any) => reader.toString() === currentUserId);
      if (!alreadyRead) {
        message.readBy.push(new mongoose.Types.ObjectId(currentUserId));
        hasUnreadUpdates = true;
      }
    });

    if (hasUnreadUpdates) {
      await conversation.save();
    }

    const otherParticipant = (conversation.participants as any[]).find(
      (participant: any) => participant._id.toString() !== currentUserId
    );

    return res.json({
      conversation: buildConversationSummary(conversation, currentUserId),
      messages: conversation.messages.map((message: any) => ({
        id: message._id,
        senderId: message.sender.toString(),
        text: message.text,
        createdAt: message.createdAt,
        isMine: message.sender.toString() === currentUserId,
      })),
      otherParticipant: otherParticipant
        ? {
            id: otherParticipant._id,
            name: otherParticipant.name,
            email: otherParticipant.email,
          }
        : null,
    });
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.userId;
    const { id } = req.params;
    const { text } = req.body;

    if (!currentUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const conversation = await Conversation.findById(id)
      .populate('participants', 'name email')
      .populate('post', 'title location');

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      (participant: any) => participant._id.toString() === currentUserId
    );

    if (!isParticipant) {
      return res.status(403).json({ error: 'You are not allowed to send messages here' });
    }

    const message = {
      sender: new mongoose.Types.ObjectId(currentUserId),
      text: String(text).trim(),
      createdAt: new Date(),
      readBy: [new mongoose.Types.ObjectId(currentUserId)],
    };

    conversation.messages.push(message as any);
    conversation.lastMessageText = message.text;
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();

    return res.status(201).json({
      message: 'Message sent',
      chatMessage: {
        id: conversation.messages[conversation.messages.length - 1]._id,
        senderId: currentUserId,
        text: message.text,
        createdAt: message.createdAt,
        isMine: true,
      },
      conversation: buildConversationSummary(conversation, currentUserId),
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
