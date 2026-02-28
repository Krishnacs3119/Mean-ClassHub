const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Log all requests
app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.url}`);
    next();
});

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Static folder for uploads
app.use('/uploads', express.static('uploads'));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Route files
const auth = require('./routes/authRoutes');
const classes = require('./routes/classRoutes');
const posts = require('./routes/postRoutes');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/classes', classes);
// Note: post routes are also handled nested under classes
app.use('/api/classes/:classId/posts', posts);
app.use('/api/posts', posts); // For direct post actions like like/comment

// Root route
app.get('/', (req, res) => {
    res.send('ClassHub API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`MongoDB Connected: ${process.env.MONGODB_URI || 'localhost'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Error: ${err.message}`);
    // Close server & exit process if it's fatal, or just log
    // server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
    // process.exit(1);
});
