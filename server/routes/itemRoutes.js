import { Router } from 'express'
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getMatches,
} from '../controllers/Itemcontroller.js'

const router = Router()

router.route('/').get(getItems).post(createItem)
// The matches route has an extra path segment, so it never clashes with "/:id".
router.get('/:id/matches', getMatches)
router.route('/:id').get(getItemById).put(updateItem).delete(deleteItem)

export default router