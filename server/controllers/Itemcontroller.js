// bcryptjs turns a PIN into a one-way "hash" so the real PIN is never stored.
import bcrypt from 'bcryptjs'
// mongoose is needed here to check that an id looks valid.
import mongoose from 'mongoose'
// The Item model, used to read and write items in MongoDB.
import Item from '../models/Item.js'
// The scoring function that compares two items (Day 4).
import { scoreMatch } from '../utils/matchScore.js'

// True if the text is a valid MongoDB id format (24 hex characters).
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

// A helper that finds the item and checks the PIN. Update, delete and "view claims" all use it.
// extraFields lets a caller also load normally-hidden fields, e.g. '+claims'.
// If anything is wrong it sends the error response itself and returns null.
const authorize = async (req, res, extraFields = '') => {
  // Get the id from the URL, e.g. /api/items/abc123 gives id = 'abc123'.
  const { id } = req.params

  // Reject ids that aren't in a valid format.
  if (!isValidId(id)) {
    res.status(400).json({ message: 'Invalid item id' })
    return null
  }

  // Find the item. +pin forces the hidden PIN hash to be included, plus any extra fields asked for.
  const item = await Item.findById(id).select(`+pin ${extraFields}`.trim())
  // No item with that id means 404 "Not Found".
  if (!item) {
    res.status(404).json({ message: 'Item not found' })
    return null
  }

  // Read the PIN the user sent in the "x-item-pin" header. Use '' if they sent none.
  const pin = req.header('x-item-pin') || ''
  // Compare the sent PIN with the stored hash. Returns true or false.
  const isCorrect = await bcrypt.compare(pin, item.pin)
  // Wrong PIN means 403 "Forbidden".
  if (!isCorrect) {
    res.status(403).json({ message: 'Incorrect PIN' })
    return null
  }

  // Everything is fine, so give the item back to the caller.
  return item
}

// The only fields a user is allowed to change when editing an item.
const EDITABLE_FIELDS = [
  'title',
  'description',
  'category',
  'location',
  'dateOccurred',
  'contactName',
  'contactPhone',
  'verifyQuestion',
  'status',
]

// Only accept plain text from the URL or body. Objects like {"$ne": "x"} could change what a database query means.
const asText = (value) => (typeof value === 'string' ? value.trim() : '')

// Escape characters that have a special meaning in regular expressions,
// so a search for "c++" or "(black)" is treated as plain text instead of crashing.
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// POST /api/items: create a new item. next passes errors to the error handler.
export const createItem = async (req, res, next) => {
  try {
    // Pull out ONLY the fields we allow from the request body.
    const {
      type,
      title,
      description,
      category,
      location,
      dateOccurred,
      contactName,
      contactPhone,
      verifyQuestion,
      pin,
    } = req.body

    // The PIN must be exactly 4 digits.
    if (!/^\d{4}$/.test(pin || '')) {
      return res.status(400).json({ message: 'PIN must be exactly 4 digits' })
    }

    // Hash the PIN. The 10 is the "cost": higher is safer but slower.
    const hashedPin = await bcrypt.hash(pin, 10)

    // Save the new item. Note we store the hashed PIN, not the real one.
    const item = await Item.create({
      type,
      title,
      description,
      category,
      location,
      dateOccurred,
      contactName,
      contactPhone,
      verifyQuestion,
      pin: hashedPin,
    })

    // Convert to a plain object so we can remove the PIN hash before replying.
    const result = item.toObject()
    delete result.pin
    // 201 = "Created".
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

// GET /api/items: return items, optionally filtered, e.g. /api/items?type=found&q=calculator
export const getItems = async (req, res, next) => {
  try {
    const type = asText(req.query.type)
    const category = asText(req.query.category)
    const location = asText(req.query.location)
    const status = asText(req.query.status)
    const q = asText(req.query.q)

    // An empty query object {} means "match everything".
    const query = {}
    if (type === 'lost' || type === 'found') query.type = type
    if (category) query.category = category
    if (location) query.location = location
    if (['open', 'claimed', 'returned'].includes(status)) query.status = status
    if (q) {
      // Case-insensitive pattern built from the (escaped) search text.
      const regex = new RegExp(escapeRegex(q), 'i')
      // The title matches OR the description matches.
      query.$or = [{ title: regex }, { description: regex }]
    }

    // pin and claims are left out automatically because of select:false.
    const items = await Item.find(query).sort({ createdAt: -1 })
    res.json(items)
  } catch (err) {
    next(err)
  }
}

// GET /api/items/:id: return one item.
export const getItemById = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid item id' })
    }
    const item = await Item.findById(req.params.id)
    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }
    res.json(item)
  } catch (err) {
    next(err)
  }
}

// PUT /api/items/:id: update an item (PIN required).
export const updateItem = async (req, res, next) => {
  try {
    // Check the id and PIN. If it fails, authorize already sent the error.
    const item = await authorize(req, res)
    if (!item) return

    // Copy each editable field that the request includes.
    EDITABLE_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) item[field] = req.body[field]
    })
    // Save. This also re-runs the schema validation.
    await item.save()

    const result = item.toObject()
    delete result.pin
    res.json(result)
  } catch (err) {
    next(err)
  }
}

// DELETE /api/items/:id: remove an item (PIN required).
export const deleteItem = async (req, res, next) => {
  try {
    const item = await authorize(req, res)
    if (!item) return

    await item.deleteOne()
    res.json({ message: 'Item deleted' })
  } catch (err) {
    next(err)
  }
}

// A pair of items must score at least this much to count as a possible match.
const MIN_SCORE = 4

// GET /api/items/:id/matches: suggest items that might be the other half of this one.
export const getMatches = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid item id' })
    }

    const item = await Item.findById(req.params.id)
    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }

    // A returned item is finished, so there is nothing to match.
    if (item.status === 'returned') {
      return res.json([])
    }

    // A lost item can only match found items, and the other way round.
    const oppositeType = item.type === 'lost' ? 'found' : 'lost'
    // Only compare with items that are still open.
    const candidates = await Item.find({ type: oppositeType, status: 'open' })

    const matches = candidates
      .map((candidate) => {
        const { score, reasons } = scoreMatch(item, candidate)
        return { item: candidate, score, reasons }
      })
      .filter((match) => match.score >= MIN_SCORE)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)

    res.json(matches)
  } catch (err) {
    next(err)
  }
}

// The most claims one item can receive. Stops spam.
const MAX_CLAIMS = 10

// POST /api/items/:id/claims: someone says "this is mine" and answers the verification question.
// No PIN needed, because the claimer is not the poster.
export const addClaim = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid item id' })
    }

    // +claims forces the normally-hidden claims array to load, so we can add to it.
    const item = await Item.findById(req.params.id).select('+claims')
    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }

    // Only found items can be claimed. For lost items, the finder calls the owner instead.
    if (item.type !== 'found') {
      return res.status(400).json({ message: 'Only found items can be claimed' })
    }
    if (item.status === 'returned') {
      return res.status(400).json({ message: 'This item has already been returned' })
    }
    if (item.claims.length >= MAX_CLAIMS) {
      return res.status(400).json({ message: 'This item has received too many claims' })
    }

    // Read the three fields as plain text.
    const claimerName = asText(req.body.claimerName)
    const contact = asText(req.body.contact)
    const answer = asText(req.body.answer)
    if (!claimerName || !contact || !answer) {
      return res.status(400).json({ message: 'Name, contact and answer are all required' })
    }

    // Add the claim to the list.
    item.claims.push({ claimerName, contact, answer })
    // Keep the public counter in step with the real list.
    item.claimsCount = item.claims.length
    // The first claim moves the item from "open" to "claimed".
    if (item.status === 'open') item.status = 'claimed'
    // Save. Mongoose validates the new claim (lengths etc.) here.
    await item.save()

    // Reply with a small message. We never send the claims list back to the claimer.
    res.status(201).json({ message: 'Claim submitted', claimsCount: item.claimsCount })
  } catch (err) {
    next(err)
  }
}

// GET /api/items/:id/claims: the poster reads all claims (PIN required).
export const getClaims = async (req, res, next) => {
  try {
    // Check the PIN AND load the hidden claims array.
    const item = await authorize(req, res, '+claims')
    if (!item) return

    // Newest claim first. [...array] makes a copy, so reverse() doesn't touch the original.
    res.json([...item.claims].reverse())
  } catch (err) {
    next(err)
  }
}