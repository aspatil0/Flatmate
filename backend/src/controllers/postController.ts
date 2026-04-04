import { Request, Response } from 'express';
import Post from '../models/Post.js';
import NumberRequest from '../models/NumberRequest.js';
import mongoose from 'mongoose';

// Create a new post
export const createPost = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      location,
      rent,
      contactNumber,
      deposit,
      roomType,
      bhkSize,
      availableFrom,
      images,
      amenities,
      tenantType,
      smokerAllowed,
      drinkerAllowed,
    } = req.body;

    // Validate required fields
    if (!title || !description || !location || !rent || !roomType || !availableFrom) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const post = new Post({
      title,
      description,
      location,
      rent,
      contactNumber,
      deposit: deposit || 0,
      roomType,
      bhkSize,
      availableFrom,
      images: images || [],
      amenities: amenities || [],
      tenantType: tenantType || 'Anyone',
      smokerAllowed: Boolean(smokerAllowed),
      drinkerAllowed: Boolean(drinkerAllowed),
      owner: req.userId,
      status: 'available',
    });

    await post.save();
    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all posts with filtering and pagination
export const getPosts = async (req: Request, res: Response) => {
  try {
    const { location, minRent, maxRent, roomType, page = 1, limit = 10 } = req.query;
    const userId = req.userId ? new mongoose.Types.ObjectId(req.userId) : null;

    const filter: any = { status: 'available' };

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (minRent || maxRent) {
      filter.rent = {};
      if (minRent) filter.rent.$gte = parseInt(minRent as string);
      if (maxRent) filter.rent.$lte = parseInt(maxRent as string);
    }

    if (roomType) {
      filter.roomType = roomType;
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    let posts = await Post.find(filter)
      .populate('owner', 'name email phone avatar location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Hide contact number unless user is owner or has approved access
    if (userId) {
      const approvedRequests = await NumberRequest.find({
        requesterId: userId,
        status: 'approved',
      }).distinct('postId');

      posts = posts.map((post: any) => {
        const isOwner = post.owner._id.toString() === userId.toString();
        const hasApprovedAccess = approvedRequests.some((id) => id.toString() === post._id.toString());

        if (!isOwner && !hasApprovedAccess) {
          post.contactNumber = undefined;
        }

        return post;
      });
    } else {
      // Not authenticated - hide all contact numbers
      posts = posts.map((post: any) => {
        post.contactNumber = undefined;
        return post;
      });
    }

    const total = await Post.countDocuments(filter);

    res.json({
      posts,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a single post by ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId ? new mongoose.Types.ObjectId(req.userId) : null;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    let post = await Post.findById(id).populate('owner', 'name email phone avatar location').lean();

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Hide contact number unless user is owner or has approved access
    if (userId) {
      const isOwner = post.owner._id.toString() === userId.toString();
      const approvedRequest = await NumberRequest.findOne({
        postId: id,
        requesterId: userId,
        status: 'approved',
      });

      if (!isOwner && !approvedRequest) {
        (post as any).contactNumber = undefined;
      }
    } else {
      // Not authenticated - hide contact number
      (post as any).contactNumber = undefined;
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      location,
      rent,
      contactNumber,
      deposit,
      roomType,
      bhkSize,
      availableFrom,
      images,
      amenities,
      tenantType,
      smokerAllowed,
      drinkerAllowed,
      status,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Only owner can update the post
    if (post.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'You can only update your own posts' });
    }

    if (typeof title !== 'undefined') post.title = title;
    if (typeof description !== 'undefined') post.description = description;
    if (typeof location !== 'undefined') post.location = location;
    if (typeof rent !== 'undefined') post.rent = rent;
    if (typeof contactNumber !== 'undefined') post.contactNumber = contactNumber;
    if (typeof deposit !== 'undefined') post.deposit = deposit;
    if (typeof roomType !== 'undefined') post.roomType = roomType;
    if (typeof bhkSize !== 'undefined') post.bhkSize = bhkSize;
    if (typeof availableFrom !== 'undefined') post.availableFrom = availableFrom;
    if (typeof images !== 'undefined') post.images = images;
    if (typeof amenities !== 'undefined') post.amenities = amenities;
    if (typeof tenantType !== 'undefined') post.tenantType = tenantType;
    if (typeof smokerAllowed !== 'undefined') post.smokerAllowed = Boolean(smokerAllowed);
    if (typeof drinkerAllowed !== 'undefined') post.drinkerAllowed = Boolean(drinkerAllowed);
    if (typeof status !== 'undefined') post.status = status;

    await post.save();
    res.json({ message: 'Post updated successfully', post });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Only owner can delete the post
    if (post.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    await Post.findByIdAndDelete(id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user's own posts
export const getUserPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find({ owner: req.userId })
      .populate('owner', 'name email phone avatar location')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add user to interested list
export const addInterestedUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const userId = new mongoose.Types.ObjectId(req.userId!);

    if (post.interestedUsers?.includes(userId)) {
      return res.status(400).json({ error: 'You are already interested in this post' });
    }

    post.interestedUsers?.push(userId);
    await post.save();

    res.json({ message: 'Added to interested list', post });
  } catch (error) {
    console.error('Error adding interested user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a booking request
export const createBookingRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = new mongoose.Types.ObjectId(req.userId!);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const post = await Post.findById(id).populate('owner', 'name email phone');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if already booked or already has pending request
    const existingRequest = post.bookingRequests?.find(
      (req) => req.tenantId.toString() === userId.toString() && req.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({ error: 'You already have a pending booking request for this property' });
    }

    // Get tenant info from auth context
    const tenant = await import('../models/User.js').then(m => m.default.findById(userId));

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const bookingRequest = {
      tenantId: userId,
      tenantName: tenant.name,
      tenantEmail: tenant.email,
      tenantPhone: tenant.phone,
      status: 'pending',
      requestedAt: new Date(),
    };

    post.bookingRequests?.push(bookingRequest as any);
    await post.save();

    res.status(201).json({ 
      message: 'Booking request sent successfully', 
      bookingRequest 
    });
  } catch (error) {
    console.error('Error creating booking request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get booking requests for owner's posts
export const getBookingRequests = async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId!);

    const posts = await Post.find({ owner: userId })
      .select('title location rent images bookingRequests')
      .lean();

    const allRequests = posts.flatMap((post) => ({
      postId: post._id,
      postTitle: post.title,
      postLocation: post.location,
      postRent: post.rent,
      postImage: post.images?.[0],
      requests: post.bookingRequests || [],
    }));

    res.json(allRequests);
  } catch (error) {
    console.error('Error fetching booking requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Respond to booking request
export const respondToBookingRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { bookingRequestIndex, status } = req.body;
    const userId = new mongoose.Types.ObjectId(req.userId!);

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Use "accepted" or "rejected"' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Verify owner
    if (post.owner.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Only post owner can respond to booking requests' });
    }

    if (!post.bookingRequests || !post.bookingRequests[bookingRequestIndex]) {
      return res.status(404).json({ error: 'Booking request not found' });
    }

    post.bookingRequests[bookingRequestIndex].status = status as 'accepted' | 'rejected';
    post.bookingRequests[bookingRequestIndex].respondedAt = new Date();

    await post.save();

    res.json({ 
      message: `Booking request ${status}`, 
      bookingRequest: post.bookingRequests[bookingRequestIndex] 
    });
  } catch (error) {
    console.error('Error responding to booking request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Request contact number from post owner
export const requestContactNumber = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const requesterId = new mongoose.Types.ObjectId(req.userId!);

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const post = await Post.findById(postId).populate('owner', 'name email');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Owner cannot request their own number
    if (post.owner._id.toString() === requesterId.toString()) {
      return res.status(400).json({ error: 'You cannot request your own contact number' });
    }

    // Get requester info
    const User = (await import('../models/User.js')).default;
    const requester = await User.findById(requesterId);

    if (!requester) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if request already exists
    const existingRequest = await NumberRequest.findOne({
      postId,
      requesterId,
    });

    if (existingRequest && existingRequest.status === 'pending') {
      return res.status(400).json({ error: 'You already have a pending request for this contact number' });
    }

    if (existingRequest && existingRequest.status === 'approved') {
      return res.status(400).json({ error: 'You already have access to this contact number' });
    }

    // Create new number request
    const numberRequest = new NumberRequest({
      postId,
      requesterId,
      requesterName: requester.name,
      requesterEmail: requester.email,
      ownerId: post.owner._id,
    });

    await numberRequest.save();

    res.status(201).json({
      message: 'Contact number request sent successfully',
      numberRequest,
    });
  } catch (error) {
    console.error('Error requesting contact number:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get pending number requests for owner
export const getNumberRequests = async (req: Request, res: Response) => {
  try {
    const ownerId = new mongoose.Types.ObjectId(req.userId!);

    const numberRequests = await NumberRequest.find({
      ownerId,
      status: 'pending',
    })
      .populate('postId', 'title location rent images')
      .populate('requesterId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(numberRequests);
  } catch (error) {
    console.error('Error fetching number requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Respond to number request (approve or reject)
export const respondToNumberRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const ownerId = new mongoose.Types.ObjectId(req.userId!);

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Use "approved" or "rejected"' });
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ error: 'Invalid request ID' });
    }

    const numberRequest = await NumberRequest.findById(requestId);

    if (!numberRequest) {
      return res.status(404).json({ error: 'Number request not found' });
    }

    // Verify owner
    if (numberRequest.ownerId.toString() !== ownerId.toString()) {
      return res.status(403).json({ error: 'Only post owner can respond to requests' });
    }

    numberRequest.status = status;
    numberRequest.respondedAt = new Date();
    await numberRequest.save();

    res.json({
      message: `Number request ${status}`,
      numberRequest,
    });
  } catch (error) {
    console.error('Error responding to number request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Check if user has approved access to contact number
export const checkNumberAccess = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = new mongoose.Types.ObjectId(req.userId!);

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Owner always has access
    if (post.owner.toString() === userId.toString()) {
      return res.json({ hasAccess: true, contactNumber: post.contactNumber });
    }

    // Check if user has approved request
    const approvedRequest = await NumberRequest.findOne({
      postId,
      requesterId: userId,
      status: 'approved',
    });

    if (approvedRequest) {
      return res.json({ hasAccess: true, contactNumber: post.contactNumber });
    }

    res.json({ hasAccess: false, contactNumber: null });
  } catch (error) {
    console.error('Error checking number access:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
