// Node's built-in DNS module.
import dns from 'node:dns'
// Use Google and Cloudflare DNS instead of the network's own, which may not handle SRV lookups.
dns.setServers(['8.8.8.8', '1.1.1.1'])
// Mongoose is the library that lets our Node code talk to MongoDB.
import mongoose from 'mongoose'


const connectDB = async () => {
  
  try {

    const conn = await mongoose.connect(process.env.MONGO_URI)
    
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    
    console.error('MongoDB connection failed:', err.message)
    
    process.exit(1)
  }
}

// Export the function so index.js can import and call it.
export default connectDB