const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Class = require('./models/Class');

const checkClasses = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/classhub');
        console.log('Connected to MongoDB');

        const classes = await Class.find({}, 'className classCode');
        console.log('Available Classes:');
        classes.forEach(c => {
            console.log(`- ${c.className}: [${c.classCode}] (Length: ${c.classCode.length})`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkClasses();
