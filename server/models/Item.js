import mongoose from 'mongoose'

export const CATEGORIES = [
  'ID & Cards',
  'Electronics',
  'Books & Stationery',
  'Bags & Wallets',
  'Keys',
  'Clothing',
  'Other',
]

export const LOCATIONS = [
  'Library',
  'Canteen',
  'Main Block',
  'Auditorium',
  'Hostel',
  'Sports Ground',
  'Bus Stop',
  'Parking',
  'Other',
]

const claimSchema = new mongoose.Schema(
  {
    claimerName: { type: String, required: true, trim: true, maxlength: 60 },
    contact: { type: String, required: true, trim: true, maxlength: 60 },
    answer: { type: String, required: true, trim: true, maxlength: 200 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

const itemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['lost', 'found'], required: true },
    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    category: { type: String, enum: CATEGORIES, required: true },
    location: { type: String, enum: LOCATIONS, required: true },
    dateOccurred: { type: Date, required: true },
    contactName: { type: String, required: true, trim: true, maxlength: 60 },
    contactPhone: { type: String, required: true, trim: true, maxlength: 20 },
    status: {
      type: String,
      enum: ['open', 'claimed', 'returned'],
      default: 'open',
    },
    verifyQuestion: { type: String, trim: true, maxlength: 150, default: '' },
    pin: { type: String, required: true, select: false },
    claims: { type: [claimSchema], default: [], select: false },
    claimsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.model('Item', itemSchema)