const Class = require('../models/Class');
const User = require('../models/User');
const crypto = require('crypto');

// Helper to generate unique class code SUBJ-XXX-YYYY
const generateClassCode = (subject) => {
    // Remove spaces and special characters from subject first
    const cleanSubj = (subject || 'CLS').replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
    const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
    const yearPart = new Date().getFullYear();
    return `${cleanSubj}-${randomPart}-${yearPart}`;
};

// @desc    Create new class
// @route   POST /api/classes
// @access  Private/Teacher
exports.createClass = async (req, res) => {
    try {
        const { className, section, subject, description, category, syllabus } = req.body;

        const classCode = generateClassCode(subject || 'CLS');

        const newClass = await Class.create({
            className,
            section,
            subject,
            description,
            category,
            syllabus,
            classCode,
            teacher: req.user.id
        });

        // Add to teacher's created classes
        await User.findByIdAndUpdate(req.user.id, {
            $push: { createdClasses: newClass._id }
        });

        res.status(201).json({ success: true, data: newClass });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Join class using code
// @route   POST /api/classes/join
// @access  Private/Student
exports.joinClass = async (req, res) => {
    try {
        let { classCode } = req.body;
        if (!classCode) return res.status(400).json({ success: false, message: 'Class code is required' });

        classCode = classCode.trim().toUpperCase();
        console.log('[DEBUG] Attempting join with code:', classCode);

        // Flexible search: Match exact OR match without dashes/spaces
        const normalizedInput = classCode.replace(/[^A-Z0-9]/g, '');

        // Search by exact match or by a regex that makes dashes optional
        const classroom = await Class.findOne({
            $or: [
                { classCode: classCode },
                { classCode: { $regex: new RegExp('^' + normalizedInput.split('').join('-?') + '$', 'i') } }
            ]
        });

        if (!classroom) {
            return res.status(404).json({ success: false, message: 'Class not found with this code' });
        }

        // Check if already enrolled
        if (classroom.students.includes(req.user.id)) {
            return res.status(400).json({ success: false, message: 'Already enrolled in this class' });
        }

        // Add student to class
        classroom.students.push(req.user.id);
        await classroom.save();

        // Add class to student's enrolled classes
        await User.findByIdAndUpdate(req.user.id, {
            $push: { enrolledClasses: classroom._id }
        });

        res.status(200).json({ success: true, data: classroom });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all classes for current user
// @route   GET /api/classes
// @access  Private
exports.getClasses = async (req, res) => {
    try {
        let classes;
        if (req.user.role === 'teacher') {
            classes = await Class.find({
                $or: [
                    { teacher: req.user.id },
                    { coTeachers: req.user.id }
                ]
            }).populate('teacher', 'name email');
        } else if (req.user.role === 'student') {
            classes = await Class.find({ students: req.user.id }).populate('teacher', 'name email');
        } else if (req.user.role === 'admin') {
            classes = await Class.find().populate('teacher', 'name email');
        }

        res.status(200).json({ success: true, count: classes.length, data: classes });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Private
exports.getClass = async (req, res) => {
    try {
        const classroom = await Class.findById(req.params.id)
            .populate('teacher', 'name email profilePic')
            .populate('coTeachers', 'name email profilePic')
            .populate('students', 'name email profilePic');

        if (!classroom) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        res.status(200).json({ success: true, data: classroom });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Leave class
// @route   DELETE /api/classes/:id/leave
// @access  Private/Student
exports.leaveClass = async (req, res) => {
    try {
        const classroom = await Class.findById(req.params.id);

        if (!classroom) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        // Remove student from class
        classroom.students = classroom.students.filter(id => id.toString() !== req.user.id);
        await classroom.save();

        // Remove class from student's enrolled list
        await User.findByIdAndUpdate(req.user.id, {
            $pull: { enrolledClasses: classroom._id }
        });

        res.status(200).json({ success: true, message: 'Left class successfully' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
// @desc    Remove student from class (Teacher only)
// @route   DELETE /api/classes/:id/students/:studentId
// @access  Private/Teacher
exports.removeStudent = async (req, res) => {
    try {
        const classroom = await Class.findById(req.params.id);

        if (!classroom) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        // Authorization check: only the main teacher (or admin later)
        if (classroom.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to manage this class' });
        }

        const { studentId } = req.params;
        console.log(`[DEBUG] Removing student ${studentId} from class ${req.params.id}`);

        // Atomic removal from both sides
        const classUpdate = await Class.findByIdAndUpdate(req.params.id, {
            $pull: { students: studentId }
        }, { new: true });

        const userUpdate = await User.findByIdAndUpdate(studentId, {
            $pull: { enrolledClasses: req.params.id }
        }, { new: true });

        if (!classUpdate || !userUpdate) {
            console.log('[DEBUG] Removal failed: Class or User not found');
            return res.status(404).json({ success: false, message: 'Class or Student not found' });
        }

        res.status(200).json({ success: true, message: 'Student removed from class successfully' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
