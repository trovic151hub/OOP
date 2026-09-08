import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectDB() {
  mongoose.set('strictQuery', true)
  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: Number(process.env.MONGODB_TIMEOUT_MS || 10000),
    })
    console.log(`MongoDB connected: ${mongoose.connection.name}`)
  } catch (err) {
    console.error('MongoDB connection failed.')
    if (env.mongoUri.includes('mongodb.net')) {
      console.error('MongoDB Atlas is configured. Check Network Access/IP whitelist and database user credentials.')
    }
    throw err
  }
}
