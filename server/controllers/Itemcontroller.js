import bcrypt from 'bcryptjs'
import Item from '../models/Item.js'

export const createItem = async (req, res, next) => {
  try {
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

    if (!/^\d{4}$/.test(pin || '')) {
      return res.status(400).json({ message: 'PIN must be exactly 4 digits' })
    }

    const hashedPin = await bcrypt.hash(pin, 10)

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

    const result = item.toObject()
    delete result.pin
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

export const getItems = async (req, res, next) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 })
    res.json(items)
  } catch (err) {
    next(err)
  }
}