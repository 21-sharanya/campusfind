import { Router } from 'express'
import { createItem, getItems } from '../controllers/Itemcontroller.js'

const router = Router()

router.route('/').get(getItems).post(createItem)

export default router