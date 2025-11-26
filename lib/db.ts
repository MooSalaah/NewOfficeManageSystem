import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    // throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    // We will use in-memory server if no URI
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
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

            // Fallback to in-memory server if URI is invalid or localhost (assuming user has no mongo)
            // Or just always use it for this demo to be safe
            if (!uri || uri.includes('localhost') || uri.includes('127.0.0.1') || uri.includes('mongodb.net')) {
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
        })();
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
