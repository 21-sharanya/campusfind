// Express is the web framework that handles requests and responses.
import express from 'express'
// cors allows our React app (a different port) to call this API.
import cors from 'cors'
// dotenv reads the .env file and puts its values into process.env.
import dotenv from 'dotenv'
// Our database connection function from db.js.
import connectDB from './config/db.js'
// The router that holds all the /api/items URLs.
import itemRoutes from './routes/itemRoutes.js'
// Our two error helpers: notFound for unknown URLs, errorHandler for thrown errors.
import { notFound, errorHandler } from './middleware/errorHandler.js'

// Load the .env values now, so process.env.PORT and process.env.MONGO_URI exist.
dotenv.config()

// Create the Express application.
const app = express()

// Allow requests from other origins, such as the React dev server.
app.use(cors())
// Teach Express to read JSON request bodies. Must come before the routes that need it.
app.use(express.json())

// A simple route to check the server is alive. (req = request, res = response)
app.get('/api/health', (req, res) => {
  // Send back JSON with a status and the current time.
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// Connect the item routes: every URL starting with /api/items is handled by itemRoutes.
app.use('/api/items', itemRoutes)

// MUST come after all real routes: catches any URL that matched nothing above.
app.use(notFound)
// MUST come last: catches every error passed on with next(err).
app.use(errorHandler)

// Use the PORT from .env, or 5000 if it's missing.
const PORT = process.env.PORT || 5000

// A start function so we can connect to the database BEFORE accepting requests.
const start = async () => {
  // Wait until MongoDB is connected.
  await connectDB()
  // Only now start listening, and print a message.
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

// Run it.
start()