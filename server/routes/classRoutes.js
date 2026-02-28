const express = require('express');
const {
    createClass,
    joinClass,
    getClasses,
    getClass,
    leaveClass,
    removeStudent
} = require('../controllers/classController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All class routes protected

router.route('/')
    .get(getClasses)
    .post(authorize('teacher', 'admin'), createClass);

router.post('/join', authorize('student'), joinClass);

router.route('/:id')
    .get(getClass);

router.delete('/:id/students/:studentId', authorize('teacher', 'admin'), removeStudent);
router.delete('/:id/leave', authorize('student'), leaveClass);

module.exports = router;
