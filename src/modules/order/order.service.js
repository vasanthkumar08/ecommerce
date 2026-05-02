import Order from "../../models/Order.js";
import { graphQLError } from "../../utils/errors.js";

export const getOrdersService = (user) => {
  const query = user.role === "admin" || user.role === "superadmin" ? {} : { user: user._id };
  return Order.find(query).sort({ createdAt: -1 }).populate("items.product");
};

export const placeOrderService = async (userId, input) => {
  if (!input?.items?.length) {
    throw graphQLError("Order items are required", "BAD_USER_INPUT", 400);
  }

  return Order.create({
    user: userId,
    items: input.items,
    total: input.total,
  });
};
