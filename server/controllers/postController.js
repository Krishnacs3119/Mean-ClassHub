const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Class = require('../models/Class');

// @desc    Create new post in class
// @route   POST /api/classes/:classId/posts
// @access  Private/Teacher
exports.createPost = async (req, res) => {
    try {
        const postData = {
            title: req.body.title,
            content: req.body.content,
            type: req.body.type || 'note',
            class: req.params.classId,
            author: req.user.id,
            dueDate: req.body.dueDate || null
        };

        if (req.file) {
            postData.files = [{
                url: `/uploads/${req.file.filename}`,
                filename: req.file.originalname,
                fileType: req.file.mimetype,
                size: req.file.size
            }];
        }

        // Check if class exists
        const classroom = await Class.findById(req.params.classId);
        if (!classroom) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        let post = await Post.create(postData);
        post = await post.populate('author', 'name profilePic');

        res.status(201).json({ success: true, data: post });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all posts for a class
// @route   GET /api/classes/:classId/posts
// @access  Private
exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find({ class: req.params.classId })
            .populate('author', 'name profilePic')
            .populate({
                path: 'comments',
                populate: { path: 'author', select: 'name profilePic' }
            })
            .sort({ isPinned: -1, createdAt: -1 });

        res.status(200).json({ success: true, count: posts.length, data: posts });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Like/Unlike post
// @route   PUT /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Check if already liked
        const index = post.likes.indexOf(req.user.id);
        if (index === -1) {
            post.likes.push(req.user.id);
        } else {
            post.likes.splice(index, 1);
        }

        await post.save();

        res.status(200).json({ success: true, data: post.likes });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const comment = await Comment.create({
            text: req.body.text,
            author: req.user.id,
            post: req.params.id
        });

        const populatedComment = await Comment.findById(comment._id).populate('author', 'name profilePic');

        res.status(201).json({ success: true, data: populatedComment });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Pin/Unpin post
// @route   PUT /api/posts/:id/pin
// @access  Private/Teacher
exports.pinPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        post.isPinned = !post.isPinned;
        await post.save();

        res.status(200).json({ success: true, data: post });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private/Teacher
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Allow post author, admin, OR any user with teacher role to delete it
        // (In a more complex app, we'd verify they are a teacher of THIS specific class)
        const isAuthor = post.author.toString() === req.user.id;
        const isPrivileged = req.user.role === 'admin' || req.user.role === 'teacher';

        if (!isAuthor && !isPrivileged) {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this post' });
        }

        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private/Teacher
exports.updatePost = async (req, res) => {
    try {
        let post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Make sure user is post author or an admin
        const isAuthor = post.author.toString() === req.user.id;
        const isPrivileged = req.user.role === 'admin' || req.user.role === 'teacher';

        if (!isAuthor && !isPrivileged) {
            return res.status(401).json({ success: false, message: 'Not authorized to update this post' });
        }

        const fieldsToUpdate = {
            title: req.body.title,
            content: req.body.content,
            dueDate: req.body.dueDate,
            updatedAt: Date.now()
        };

        const updatedPost = await Post.findByIdAndUpdate(req.params.id, { $set: fieldsToUpdate }, {
            new: true,
            runValidators: true
        }).populate('author', 'name profilePic');

        console.log('Post updated successfully in DB:', updatedPost._id);
        res.status(200).json({ success: true, data: updatedPost });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
