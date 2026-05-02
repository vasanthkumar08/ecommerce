import Cart from "../../models/Cart.js";
import Product from "../../models/Product.js";
import { graphQLError } from "../../utils/errors.js";
import { cartItemInputSchema, updateCartQuantitySchema } from "./cart.validation.js";

export const getCartService = async (userId, shouldPopulate = false) => {
  const query = Cart.findOne({ user: userId });
  if (shouldPopulate) query.populate("items.product");
  const cart = await query;
  return cart || { user: userId, items: [] };
};

export const addToCartService = async (userId, input) => {
  const data = cartItemInputSchema.parse(input);
  const product = await Product.findById(data.product);
  if (!product) {
    throw graphQLError("Product not found", "NOT_FOUND", 404);
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  const existingItem = cart.items.find((item) => item.product.toString() === data.product);
  if (existingItem) {
    existingItem.quantity += data.quantity;
  } else {
    cart.items.push({ product: data.product, quantity: data.quantity });
  }

  await cart.save();
  return Cart.findOne({ user: userId }).populate("items.product");
};

export const updateCartQuantityService = async (userId, input) => {
  const data = updateCartQuantitySchema.parse(input);
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw graphQLError("Cart not found", "NOT_FOUND", 404);
  }

  const itemIndex = cart.items.findIndex((item) => item.product.toString() === data.product);
  if (itemIndex === -1) {
    throw graphQLError("Item not found", "NOT_FOUND", 404);
  }

  if (data.quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = data.quantity;
  }

  await cart.save();
  return Cart.findOne({ user: userId }).populate("items.product");
};

export const removeFromCartService = async (userId, input) => {
  const productId = typeof input === "string" ? input : input?.productId;
  const cartItemId = typeof input === "object" ? input?.cartItemId : null;
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return { user: userId, items: [] };
  }

  const initialLength = cart.items.length;

  if (cartItemId) {
    cart.items = cart.items.filter((item) => item._id.toString() !== cartItemId);
  } else if (productId) {
    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  } else {
    throw graphQLError("Cart item id or product id is required", "BAD_USER_INPUT", 400);
  }

  if (cart.items.length === initialLength) {
    throw graphQLError("Cart item not found", "NOT_FOUND", 404);
  }

  await cart.save();
  return Cart.findOne({ user: userId }).populate("items.product");
};
