import {
  addToWishlistService,
  getWishlistService,
  removeFromWishlistService,
} from "../modules/wishlist/wishlist.service.js";

export const getWishlist = async (req, res) => {
  try {
    const wishlist = await getWishlistService(req.user._id, true);
    res.json(wishlist);
  } catch (error) {
    res.status(error.name === "CastError" ? 400 : 500).json({ message: error.name === "CastError" ? "Invalid product id" : error.message });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const wishlist = await addToWishlistService(req.user._id, productId);
    res.json(wishlist);
  } catch (error) {
    res.status(error.name === "CastError" ? 400 : error.extensions?.http?.status || 500).json({ message: error.name === "CastError" ? "Invalid product id" : error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const wishlist = await removeFromWishlistService(req.user._id, productId);
    res.json(wishlist);
  } catch (error) {
    res.status(error.name === "CastError" ? 400 : 500).json({ message: error.name === "CastError" ? "Invalid product id" : error.message });
  }
};
