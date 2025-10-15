// controllers/favoritesController.js
import User from '../models/User.js';
import Property from '../models/Property.js';

// Add property to favorites
export const addToFavorites = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Add to favorites if not already there
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favorites: propertyId } }, // $addToSet prevents duplicates
      { new: true }
    ).populate('favorites');

    res.status(200).json({
      message: "Property added to favorites",
      favorites: user.favorites
    });
  } catch (error) {
    console.error("Add to favorites error:", error);
    res.status(500).json({ message: "Failed to add to favorites", error: error.message });
  }
};

// Remove property from favorites
export const removeFromFavorites = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { favorites: propertyId } },
      { new: true }
    ).populate('favorites');

    res.status(200).json({
      message: "Property removed from favorites",
      favorites: user.favorites
    });
  } catch (error) {
    console.error("Remove from favorites error:", error);
    res.status(500).json({ message: "Failed to remove from favorites", error: error.message });
  }
};

// Get user's favorites
export const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate({
      path: 'favorites',
      match: { status: 'active' } // Only get active properties
    });

    res.status(200).json(user.favorites);
  } catch (error) {
    console.error("Get favorites error:", error);
    res.status(500).json({ message: "Failed to get favorites", error: error.message });
  }
};

// Check if property is in favorites
export const checkFavoriteStatus = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const isFavorite = user.favorites.includes(propertyId);

    res.status(200).json({ isFavorite });
  } catch (error) {
    console.error("Check favorite status error:", error);
    res.status(500).json({ message: "Failed to check favorite status", error: error.message });
  }
};