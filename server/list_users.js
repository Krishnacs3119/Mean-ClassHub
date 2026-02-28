const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/classhub');
        const users = await User.find({}, 'name email role');
        console.log('--- Current Users in DB ---');
        users.forEach(u => {
            console.log(`Name: ${u.name} | Role: ${u.role} | Email: ${u.email}`);
        });
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

listUsers();
