import Order from "../models/Order.js";

export const createOrder = async (req, res) => {
  try {
    const { items, total } = req.body;

    if (!Array.isArray(items) || items.length === 0 || Number(total) < 0) {
      return res.status(400).json({ message: "Valid order items and total are required" });
    }

    const order = await Order.create({
      user: req.user.id,
      items,
      total: Number(total),
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(error.name === "ValidationError" || error.name === "CastError" ? 400 : 500).json({ message: error.name === "CastError" ? "Invalid order data" : error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("items.product");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 100), 100);
    const skip = Math.max(Number(req.query.skip || 0), 0);
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const allowedStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = req.body.status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(error.name === "CastError" ? 400 : 500).json({ message: error.name === "CastError" ? "Invalid order id" : error.message });
  }
};

export const deleteDeliveredOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Delivered") {
      return res.status(400).json({ message: "Only delivered orders can be deleted" });
    }

    await order.deleteOne();

    res.json({ message: "Delivered order deleted" });
  } catch (error) {
    res.status(error.name === "CastError" ? 400 : 500).json({ message: error.name === "CastError" ? "Invalid order id" : error.message });
  }
};
