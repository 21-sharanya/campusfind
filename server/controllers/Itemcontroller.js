// The scoring function from Commit 4.
import { scoreMatch } from '../utils/matchScore.js'
// bcryptjs turns a PIN into a one-way "hash" so the real PIN is never stored.
import bcrypt from 'bcryptjs'
// mongoose is needed here to check that an id looks valid.
import mongoose from 'mongoose'
// The Item model, used to read and write items in MongoDB.
import Item from '../models/Item.js'

// True if the text is a valid MongoDB id format (24 hex characters).
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

// A helper that finds the item and checks the PIN. Update and delete both use it.
// If anything is wrong it sends the error response itself and returns null.
const authorize = async (req, res) => {
  // Get the id from the URL, e.g. /api/items/abc123 gives id = 'abc123'.
  const { id } = req.params

  // Reject ids that aren't in a valid format.
  if (!isValidId(id)) {
    res.status(400).json({ message: 'Invalid item id' })
    return null
  }

  // Find the item. +pin forces the normally-hidden PIN hash to be included.
  const item = await Item.findById(id).select('+pin')
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

// Only accept plain text from the URL. Without this check, a request like ?category[$ne]=x
// would arrive as an object and could change what the database query means ("NoSQL injection").
const asText = (value) => (typeof value === 'string' ? value.trim() : '')

// Escape characters that have a special meaning in regular expressions (. * + ? ^ $ { } ( ) | [ ] \)
// so a search for "c++" or "(black)" is treated as plain text instead of crashing.
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// POST /api/items: create a new item. next passes errors to the error handler.
export const createItem = async (req, res, next) => {
  // try/catch so any error goes to our error handler instead of crashing.
  try {
    // Pull out ONLY the fields we allow from the request body.
    // This stops a user from sending extra fields such as status or claims.
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

    // The PIN must be exactly 4 digits. ^ = start, \d = a digit, {4} = four times, $ = end.
    // (pin || '') avoids an error if pin is missing.
    if (!/^\d{4}$/.test(pin || '')) {
      // 400 = "Bad Request", meaning the client sent something invalid.
      return res.status(400).json({ message: 'PIN must be exactly 4 digits' })
    }

    // Hash the PIN. The 10 is the "cost": higher is safer but slower.
    const hashedPin = await bcrypt.hash(pin, 10)

    // Save the new item in MongoDB. Note we store the hashed PIN, not the real one.
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

    // Convert the saved item to a plain JavaScript object so we can edit it.
    const result = item.toObject()
    // Remove the PIN hash so it is never sent back to the browser.
    delete result.pin
    // 201 = "Created". Send the new item back as JSON.
    res.status(201).json(result)
  } catch (err) {
    // Hand any error to the error-handling middleware.
    next(err)
  }
}

// GET /api/items: return items, optionally filtered, e.g. /api/items?type=found&q=calculator
export const getItems = async (req, res, next) => {
  try {
    // Read each filter from the URL and make sure it is plain text.
    const type = asText(req.query.type)
    const category = asText(req.query.category)
    const location = asText(req.query.location)
    const status = asText(req.query.status)
    const q = asText(req.query.q)

    // Build the MongoDB query. An empty object {} means "match everything".
    const query = {}
    // Add each condition only when that filter was given (and is valid).
    if (type === 'lost' || type === 'found') query.type = type
    if (category) query.category = category
    if (location) query.location = location
    if (['open', 'claimed', 'returned'].includes(status)) query.status = status
    if (q) {
      // Build a pattern from the search text. "i" makes it case-insensitive.
      const regex = new RegExp(escapeRegex(q), 'i')
      // $or means: the title matches OR the description matches.
      query.$or = [{ title: regex }, { description: regex }]
    }

    // Find the items that match every condition, newest first.
    // pin and claims are left out automatically because of select:false.
    const items = await Item.find(query).sort({ createdAt: -1 })
    // Send the list as JSON (status 200 by default).
    res.json(items)
  } catch (err) {
    next(err)
  }
}

// GET /api/items/:id: return one item.
export const getItemById = async (req, res, next) => {
  try {
    // Check the id format first.
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid item id' })
    }
    // Look the item up by its id.
    const item = await Item.findById(req.params.id)
    // Not found gives 404.
    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }
    // Send the item as JSON.
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
    // So if item is null we just stop.
    if (!item) return

    // For each editable field, if the request includes it, copy the new value onto the item.
    EDITABLE_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) item[field] = req.body[field]
    })
    // Save the changes. This also re-runs the schema validation.
    await item.save()

    // Remove the PIN hash before replying, same as in createItem.
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
    // Same id and PIN check.
    const item = await authorize(req, res)
    if (!item) return

    // Remove the item from the database.
    await item.deleteOne()
    // Confirm with a message.
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
      // Score each candidate and remember why.
      .map((candidate) => {
        const { score, reasons } = scoreMatch(item, candidate)
        return { item: candidate, score, reasons }
      })
      // Drop weak matches.
      .filter((match) => match.score >= MIN_SCORE)
      // Highest score first.
      .sort((a, b) => b.score - a.score)
      // Keep only the top 3.
      .slice(0, 3)

    res.json(matches)
  } catch (err) {
    next(err)
  }
}