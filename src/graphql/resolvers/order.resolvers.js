import {
  getOrdersService,
  placeOrderService,
} from "../../modules/order/order.service.js";
import { requireAuth } from "../../utils/errors.js";

export const orderResolvers = {
  Query: {
    getOrders: (_, __, { user }) => {
      requireAuth(user);
      return getOrdersService(user);
    },
  },
  Mutation: {
    placeOrder: (_, { input }, { user }) => {
      requireAuth(user);
      return placeOrderService(user._id, input);
    },
  },
  Order: {
    id: (order) => order.id || order._id?.toString(),
    _id: (order) => order._id?.toString() || order.id,
    user: (order, _, { loaders }) => {
      if (!order.user) return null;
      if (typeof order.user === "object" && order.user._id) return order.user;
      return loaders.userById.load(order.user.toString());
    },
  },
  OrderItem: {
    product: (item, _, { loaders }) => {
      if (!item.product) return null;
      if (typeof item.product === "object" && item.product._id) return item.product;
      return loaders.productById.load(item.product.toString());
    },
  },
};

export default orderResolvers;
