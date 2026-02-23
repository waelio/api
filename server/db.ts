import mongoose from 'mongoose'

let cachedConnection: typeof mongoose | null = null

export async function connectDB() {
    if (cachedConnection) {
        return cachedConnection
    }

    const uri = process.env.MONGODB_URI
    if (!uri) {
        throw new Error('MONGODB_URI environment variable not set')
    }

    try {
        const connection = await mongoose.connect(uri)
        cachedConnection = connection
        console.log('✓ MongoDB connected')
        return connection
    } catch (error) {
        console.error('MongoDB connection error:', error)
        throw error
    }
}

export async function disconnectDB() {
    if (cachedConnection) {
        await mongoose.disconnect()
        cachedConnection = null
        console.log('MongoDB disconnected')
    }
}
