const Submission = require('../models/Submission');
const Post = require('../models/Post');

// @desc    Submit assignment
// @route   POST /api/posts/:postId/submissions
// @access  Private/Student
exports.submitAssignment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        if (post.type !== 'assignment') {
            return res.status(400).json({ success: false, message: 'Post is not an assignment' });
        }

        // Check if student already submitted
        const existing = await Submission.findOne({ post: post._id, student: req.user.id });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Already submitted for this assignment' });
        }

        const submission = await Submission.create({
            post: post._id,
            student: req.user.id,
            content: req.body.content || 'Submission contents',
            files: req.body.files || []
        });

        res.status(201).json({ success: true, data: submission });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get submission for assignment (Student) or all for teacher
// @route   GET /api/posts/:postId/submissions
// @access  Private
exports.getSubmissions = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        if (req.user.role === 'teacher') {
            const submissions = await Submission.find({ post: post._id }).populate('student', 'name email');
            return res.status(200).json({ success: true, count: submissions.length, data: submissions });
        } else {
            const submission = await Submission.findOne({ post: post._id, student: req.user.id });
            return res.status(200).json({ success: true, data: submission });
        }
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Grade submission
// @route   PUT /api/submissions/:id/grade
// @access  Private/Teacher
exports.gradeSubmission = async (req, res) => {
    try {
        const submission = await Submission.findByIdAndUpdate(req.params.id, {
            grade: req.body.grade,
            feedback: req.body.feedback
        }, { new: true });

        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        res.status(200).json({ success: true, data: submission });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
