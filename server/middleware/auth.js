const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('[DEBUG] Token decoded:', decoded);

        req.user = await User.findById(decoded.id);
        console.log('[DEBUG] User found in protect:', req.user?._id || 'NOT FOUND');

        if (!req.user) {
            return res.status(401).json({ message: 'User belonging to this token no longer exists. Please log out and log back in.' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ message: 'Not authorized to access this route' });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized to access this route`,
            });
        }
        next();
    };
};
