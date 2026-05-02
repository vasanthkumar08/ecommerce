import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, default: 1, min: 1, max: 99 },
    },
  ],
});

cartSchema.index({ user: 1 }, { unique: true });
cartSchema.index({ "items.product": 1 });

const Cart =
  mongoose.models.Cart || mongoose.model("Cart", cartSchema);

export default Cart;
