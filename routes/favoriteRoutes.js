// routes/favorites.js
import express from 'express';
import {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  checkFavoriteStatus
} from '../controllers/favoritesController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', getUserFavorites);
router.post('/:propertyId', addToFavorites);
router.delete('/:propertyId', removeFromFavorites);
router.get('/:propertyId/status', checkFavoriteStatus);

export default router;