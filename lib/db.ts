import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    // throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
    mongod: MongoMemoryServer | null;
}

declare global {
    var mongoose: MongooseCache;
}

let cached: MongooseCache = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null, mongod: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = (async () => {
            let uri = MONGODB_URI;
            // Check if we are in production OR on Vercel (which implies production-like environment)
            const isVercel = !!process.env.VERCEL;
            const isProduction = process.env.NODE_ENV === 'production' || isVercel;

            if (!uri && isProduction) {
                throw new Error('MONGODB_URI is not defined in Environment Variables. Please add it in Vercel Settings and Redeploy.');
            }

            // Fallback to in-memory server if URI is invalid or localhost (assuming user has no mongo)
            // ONLY if we are NOT in production (or if URI explicitly says localhost)
            if (!uri || ((uri.includes('localhost') || uri.includes('127.0.0.1')) && !isProduction)) {
                if (!cached.mongod) {
                    console.log('Starting MongoDB Memory Server...');
                    cached.mongod = await MongoMemoryServer.create();
                    uri = cached.mongod.getUri();
                    console.log('MongoDB Memory Server started at:', uri);
                } else {
                    uri = cached.mongod.getUri();
                }
            }

            return mongoose.connect(uri!, opts).then((mongoose) => {
                return mongoose;
            });
        })() as Promise<typeof mongoose>;
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
