const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error("MONGODB_URI or MONGO_URI environment variable is missing in .env");
        }
        const conn = await mongoose.connect(mongoUri);
        console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
    } catch (error) {
        console.error("❌ MongoDB Atlas Connection Failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;