import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    // In production, we throw an error if URI is missing.
    // In dev, we can warn or throw.
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    }
}

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongoose: MongooseCache;
}

let cached: MongooseCache = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
