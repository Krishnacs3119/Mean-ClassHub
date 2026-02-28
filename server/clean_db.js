const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Class = require('./models/Class');

const cleanDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/classhub');
        console.log('Connected to MongoDB');

        const classes = await Class.find({});
        console.log(`Found ${classes.length} classes. Cleaning codes...`);

        for (const classroom of classes) {
            const originalCode = classroom.classCode;
            const cleanedCode = originalCode.replace(/\s+/g, '').toUpperCase();

            if (originalCode !== cleanedCode) {
                classroom.classCode = cleanedCode;
                await classroom.save();
                console.log(`Updated: "${originalCode}" -> "${cleanedCode}"`);
            }
        }

        console.log('Database cleaning complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error during cleanup:', err);
        process.exit(1);
    }
};

cleanDatabase();
