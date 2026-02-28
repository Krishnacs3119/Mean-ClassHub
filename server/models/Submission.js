const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Please add some content']
    },
    files: [{
        url: String,
        filename: String,
        fileType: String,
        size: Number
    }],
    grade: {
        type: Number,
        min: 0,
        max: 100
    },
    feedback: {
        type: String
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure a student can only submit once per assignment
submissionSchema.index({ post: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
