const mongoose = require('mongoose');

const connectDb = () => {
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const db = mongoose.connection;
    db.on('error', (error) => console.log('MongoDB connection error =>', error));
    db.once('open', () => console.log('MongoDB connected'));
};

module.exports = { connectDb };
