import Post from '../models/Post.js';
import mongoose from 'mongoose';
// Create a new post
export const createPost = async (req, res) => {
    try {
        const { title, description, location, rent, contactNumber, deposit, roomType, bhkSize, availableFrom, images, amenities, tenantType, smokerAllowed, drinkerAllowed, } = req.body;
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
    }
    catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Get all posts with filtering and pagination
export const getPosts = async (req, res) => {
    try {
        const { location, minRent, maxRent, roomType, page = 1, limit = 10 } = req.query;
        const filter = { status: 'available' };
        if (location) {
            filter.location = { $regex: location, $options: 'i' };
        }
        if (minRent || maxRent) {
            filter.rent = {};
            if (minRent)
                filter.rent.$gte = parseInt(minRent);
            if (maxRent)
                filter.rent.$lte = parseInt(maxRent);
        }
        if (roomType) {
            filter.roomType = roomType;
        }
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        const posts = await Post.find(filter)
            .populate('owner', 'name email phone avatar location')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);
        const total = await Post.countDocuments(filter);
        res.json({
            posts,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Get a single post by ID
export const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }
        const post = await Post.findById(id).populate('owner', 'name email phone avatar location');
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(post);
    }
    catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Update a post
export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, location, rent, contactNumber, deposit, roomType, bhkSize, availableFrom, images, amenities, tenantType, smokerAllowed, drinkerAllowed, status, } = req.body;
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
        if (typeof title !== 'undefined')
            post.title = title;
        if (typeof description !== 'undefined')
            post.description = description;
        if (typeof location !== 'undefined')
            post.location = location;
        if (typeof rent !== 'undefined')
            post.rent = rent;
        if (typeof contactNumber !== 'undefined')
            post.contactNumber = contactNumber;
        if (typeof deposit !== 'undefined')
            post.deposit = deposit;
        if (typeof roomType !== 'undefined')
            post.roomType = roomType;
        if (typeof bhkSize !== 'undefined')
            post.bhkSize = bhkSize;
        if (typeof availableFrom !== 'undefined')
            post.availableFrom = availableFrom;
        if (typeof images !== 'undefined')
            post.images = images;
        if (typeof amenities !== 'undefined')
            post.amenities = amenities;
        if (typeof tenantType !== 'undefined')
            post.tenantType = tenantType;
        if (typeof smokerAllowed !== 'undefined')
            post.smokerAllowed = Boolean(smokerAllowed);
        if (typeof drinkerAllowed !== 'undefined')
            post.drinkerAllowed = Boolean(drinkerAllowed);
        if (typeof status !== 'undefined')
            post.status = status;
        await post.save();
        res.json({ message: 'Post updated successfully', post });
    }
    catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Delete a post
export const deletePost = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Get user's own posts
export const getUserPosts = async (req, res) => {
    try {
        const posts = await Post.find({ owner: req.userId })
            .populate('owner', 'name email phone avatar location')
            .sort({ createdAt: -1 });
        res.json(posts);
    }
    catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Add user to interested list
export const addInterestedUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        const userId = new mongoose.Types.ObjectId(req.userId);
        if (post.interestedUsers?.includes(userId)) {
            return res.status(400).json({ error: 'You are already interested in this post' });
        }
        post.interestedUsers?.push(userId);
        await post.save();
        res.json({ message: 'Added to interested list', post });
    }
    catch (error) {
        console.error('Error adding interested user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Create a booking request
export const createBookingRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = new mongoose.Types.ObjectId(req.userId);
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }
        const post = await Post.findById(id).populate('owner', 'name email phone');
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        // Check if already booked or already has pending request
        const existingRequest = post.bookingRequests?.find((req) => req.tenantId.toString() === userId.toString() && req.status === 'pending');
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
        post.bookingRequests?.push(bookingRequest);
        await post.save();
        res.status(201).json({
            message: 'Booking request sent successfully',
            bookingRequest
        });
    }
    catch (error) {
        console.error('Error creating booking request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Get booking requests for owner's posts
export const getBookingRequests = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.userId);
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
    }
    catch (error) {
        console.error('Error fetching booking requests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Respond to booking request
export const respondToBookingRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { bookingRequestIndex, status } = req.body;
        const userId = new mongoose.Types.ObjectId(req.userId);
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
        post.bookingRequests[bookingRequestIndex].status = status;
        post.bookingRequests[bookingRequestIndex].respondedAt = new Date();
        await post.save();
        res.json({
            message: `Booking request ${status}`,
            bookingRequest: post.bookingRequests[bookingRequestIndex]
        });
    }
    catch (error) {
        console.error('Error responding to booking request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
//# sourceMappingURL=postController.js.map