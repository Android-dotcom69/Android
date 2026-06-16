import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

// Cache the connection so models are only registered once per process.
// Without this, hot-reload in dev can cause stale model schemas.
let isConnected = false;

async function connectDB() {
    if (isConnected) return;
    if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined");
    try {
        await mongoose.connect(MONGODB_URI);
        isConnected = true;
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.log("Error connecting to MongoDB:", error);
    }
}

export default connectDB;
