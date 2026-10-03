import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
// Reuse the same database connection as the server.
import connectDB from './config/db.js'
import Item from './models/Item.js'

// Load .env so MONGO_URI is available.
dotenv.config()

// A date n days before today. Makes the sample data always look recent.
const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

// The sample items. Pairs are written on purpose, so Smart Match has something to find.
// (If you changed the category or location lists in Item.js, make sure these values still exist in them.)
const samples = [
  {
    type: 'found', title: 'Black calculator', description: 'Found on a bench near the library entrance.',
    category: 'Electronics', location: 'Library', dateOccurred: daysAgo(2),
    contactName: 'Arun', contactPhone: '9876543210', verifyQuestion: 'What name is written on the back?',
  },
  {
    type: 'lost', title: 'Casio calculator', description: 'Black scientific calculator, lost somewhere near the library.',
    category: 'Electronics', location: 'Library', dateOccurred: daysAgo(3),
    contactName: 'Meena', contactPhone: '9123456780',
  },
  {
    type: 'found', title: 'Hostel room keys', description: 'A bunch of three keys on a ring.',
    category: 'Keys', location: 'Hostel', dateOccurred: daysAgo(1),
    contactName: 'Rahul', contactPhone: '9988776655', verifyQuestion: 'What keychain is attached?',
  },
  {
    type: 'lost', title: 'Hostel keys with blue keychain', description: 'Lost my room keys near the hostel gate.',
    category: 'Keys', location: 'Hostel', dateOccurred: daysAgo(2),
    contactName: 'Divya', contactPhone: '9090909090',
  },
  {
    type: 'found', title: 'Student ID card', description: 'ID card found near the main block stairs.',
    category: 'ID & Cards', location: 'Main Block', dateOccurred: daysAgo(1),
    contactName: 'Kiran', contactPhone: '9812345678', verifyQuestion: 'Which department is printed on it?',
  },
  {
    type: 'lost', title: 'Blue water bottle', description: 'Steel bottle with a dent on the side.',
    category: 'Other', location: 'Canteen', dateOccurred: daysAgo(4),
    contactName: 'Sanjay', contactPhone: '9345678901',
  },
  {
    type: 'found', title: 'Blue steel water bottle', description: 'Left on a canteen table.',
    category: 'Other', location: 'Canteen', dateOccurred: daysAgo(3),
    contactName: 'Priya', contactPhone: '9456789012', verifyQuestion: 'What sticker is on the bottle?',
  },
  {
    type: 'lost', title: 'Black backpack', description: 'Black backpack with a laptop sleeve.',
    category: 'Bags & Wallets', location: 'Bus Stop', dateOccurred: daysAgo(5),
    contactName: 'Vikram', contactPhone: '9567890123',
  },
  {
    // A found item that already has one claim, so you can demo the review screen straight away.
    type: 'found', title: 'Black wallet', description: 'Leather wallet found in the parking area.',
    category: 'Bags & Wallets', location: 'Parking', dateOccurred: daysAgo(2),
    contactName: 'Asha', contactPhone: '9678901234', verifyQuestion: 'How much cash is inside?',
    status: 'claimed', claimsCount: 1,
    claims: [{ claimerName: 'Naveen', contact: '9789012345', answer: 'About 500 rupees' }],
  },
  {
    // An item that was already returned, to show the "returned" status.
    type: 'lost', title: 'Grey hoodie', description: 'Grey hoodie left at the sports ground.',
    category: 'Clothing', location: 'Sports Ground', dateOccurred: daysAgo(6),
    contactName: 'Ravi', contactPhone: '9890123456', status: 'returned',
  },
]

const run = async () => {
  // Connect to the database.
  await connectDB()
  // Hash the PIN "1234" once and give it to every sample item.
  const pin = await bcrypt.hash('1234', 10)
  // Remove everything that is already there.
  await Item.deleteMany({})
  // Add the PIN to each sample, then save them all at once.
  await Item.insertMany(samples.map((sample) => ({ ...sample, pin })))
  console.log(`Seeded ${samples.length} items. Every item uses PIN 1234.`)
  // Close the connection so the script can end.
  await mongoose.disconnect()
}

// If anything fails, print the reason and stop with an error code.
run().catch(async (err) => {
  console.error('Seeding failed:', err.message)
  await mongoose.disconnect()
  process.exit(1)
})