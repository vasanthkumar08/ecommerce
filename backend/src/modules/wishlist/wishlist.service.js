import Wishlist from "../../models/Wishlist.js";
import Product from "../../models/Product.js";
import { graphQLError } from "../../utils/errors.js";

export const getWishlistService = async (userId, shouldPopulate = false) => {
  const query = Wishlist.findOne({ user: userId });
  if (shouldPopulate) query.populate("items.product");
  const wishlist = await query;
  return wishlist || { user: userId, items: [] };
};

export const addToWishlistService = async (userId, productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw graphQLError("Product not found", "NOT_FOUND", 404);
  }

  const wishlist = await Wishlist.findOneAndUpdate(
    { user: userId, "items.product": { $ne: productId } },
    { $push: { items: { product: productId } } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate("items.product");

  return wishlist || getWishlistService(userId, true);
};

export const removeFromWishlistService = async (userId, productId) =>
  Wishlist.findOneAndUpdate(
    { user: userId },
    { $pull: { items: { product: productId } } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate("items.product");
