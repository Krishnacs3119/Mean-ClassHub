const mongoose = require('mongoose');
const Class = require('./models/Class');
const dotenv = require('dotenv');

dotenv.config();

const listClasses = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/classhub');
        const classes = await Class.find({}, 'className classCode subject teacher');
        console.log('--- Current Classes in DB ---');
        classes.forEach(c => {
            console.log(`Name: ${c.className} | Code: ${c.classCode} | Subject: ${c.subject}`);
        });
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

listClasses();
