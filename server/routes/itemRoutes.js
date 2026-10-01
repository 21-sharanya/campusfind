import { Router } from 'express'
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
} from '../controllers/Itemcontroller.js'

const router = Router()

router.route('/').get(getItems).post(createItem)
router.route('/:id').get(getItemById).put(updateItem).delete(deleteItem)

export default router