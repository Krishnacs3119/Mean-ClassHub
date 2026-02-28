const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    className: {
        type: String,
        required: [true, 'Please add a class name'],
        trim: true,
    },
    classCode: {
        type: String,
        unique: true,
        required: true,
    },
    section: {
        type: String,
        trim: true,
    },
    subject: {
        type: String,
        required: [true, 'Please add a subject'],
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    coTeachers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    description: {
        type: String,
    },
    thumbnail: {
        type: String,
        default: 'default-class.png',
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
    },
    syllabus: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    classCodeExpiry: {
        type: Date,
        // Optional: will be handled in logic if needed
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Class', classSchema);
