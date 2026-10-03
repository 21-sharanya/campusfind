import { Router } from 'express'
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getMatches,
  addClaim,
  getClaims,
} from '../controllers/Itemcontroller.js'

const router = Router()

router.route('/').get(getItems).post(createItem)
router.get('/:id/matches', getMatches)
// GET lists the claims (PIN needed), POST adds a claim (public).
router.route('/:id/claims').get(getClaims).post(addClaim)
router.route('/:id').get(getItemById).put(updateItem).delete(deleteItem)

export default router