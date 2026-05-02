import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// ADD TO CART

export const addToCart = async (req, res) => {
  try {
    const { product } = req.body;
    const quantity = Number(req.body.quantity || 1);

    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return res.status(400).json({ message: "Valid product and quantity are required" });
    }

    const exists = await Product.exists({ _id: product });
    if (!exists) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (i) => i.product.toString() === product
    );

    if (existingItem) {
      existingItem.quantity = Math.min(existingItem.quantity + quantity, 99);
    } else {
      cart.items.push({ product, quantity });
    }

    await cart.save();
    const updated = await Cart.findOne({ user: req.user._id }).populate("items.product");
    res.json(updated);
  } catch (err) {
    res.status(err.name === "CastError" ? 400 : 500).json({ message: err.name === "CastError" ? "Invalid product id" : err.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// UPDATE CART
export const updateCartItem = async (req, res) => {
  try {
    const { product } = req.body;
    const quantity = Number(req.body.quantity);

    if (!product || !Number.isInteger(quantity) || quantity < 0 || quantity > 99) {
      return res.status(400).json({ message: "Valid product and quantity are required" });
    }

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (i) => String(i.product) === String(product)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found" });
    }

    // ✅ SAME LOGIC FOR INCREASE + DECREASE
    cart.items[itemIndex].quantity = quantity;

    // ❗ if quantity <= 0 remove item
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    }

    await cart.save();

    const updated = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );

    res.json({ items: updated.items });
  } catch (err) {
    res.status(err.name === "CastError" ? 400 : 500).json({ message: err.name === "CastError" ? "Invalid product id" : err.message });
  }
};
// REMOVE
export const removeFromCart = async (req, res) => {
  try {
    const { productId, cartItemId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const initialLength = cart.items.length;

    if (cartItemId) {
      cart.items = cart.items.filter((i) => i._id.toString() !== cartItemId);
    } else {
      cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    }

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    await cart.save();

    const updated = await Cart.findOne({ user: req.user.id }).populate("items.product");

    res.json({ items: updated?.items || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    await Cart.deleteMany({ user: req.user.id });

    res.status(200).json({
      message: "Cart cleared successfully",
    });

  } catch (err) {
    res.status(500).json({
      message: "Error clearing cart",
      error: err.message,
    });
  }
};
