const express = require('express');
const {
    createPost,
    getPosts,
    likePost,
    addComment,
    pinPost,
    deletePost,
    updatePost
} = require('../controllers/postController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const {
    submitAssignment,
    getSubmissions,
    gradeSubmission
} = require('../controllers/submissionController');

const router = express.Router({ mergeParams: true });

router.use(protect);

// Nested routes for classes: /api/classes/:classId/posts
router.route('/')
    .post(authorize('teacher', 'admin'), upload.single('file'), createPost)
    .get(getPosts);

// Single post routes
router.put('/:id/like', likePost);
router.post('/:id/comments', addComment);
router.put('/:id/pin', authorize('teacher', 'admin'), pinPost);

router.route('/:id')
    .put(authorize('teacher', 'admin'), updatePost)
    .delete(authorize('teacher', 'admin'), deletePost);

// Submission routes
router.route('/:postId/submissions')
    .post(authorize('student'), submitAssignment)
    .get(getSubmissions);

router.put('/submissions/:id/grade', authorize('teacher', 'admin'), gradeSubmission);

module.exports = router;
