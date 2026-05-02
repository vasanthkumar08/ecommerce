import {
  addToCartService,
  getCartService,
  removeFromCartService,
  updateCartQuantityService,
} from "../../modules/cart/cart.service.js";
import { requireAuth } from "../../utils/errors.js";

const resolveProduct = (item, loaders) => {
  if (!item.product) return null;
  if (typeof item.product === "object" && item.product._id) return item.product;
  return loaders.productById.load(item.product.toString());
};

export const cartResolvers = {
  Query: {
    getCart: (_, __, { user }) => {
      requireAuth(user);
      return getCartService(user._id);
    },
  },
  Mutation: {
    addToCart: (_, { input }, { user }) => {
      requireAuth(user);
      return addToCartService(user._id, input);
    },
    updateCartQuantity: (_, { input }, { user }) => {
      requireAuth(user);
      return updateCartQuantityService(user._id, input);
    },
    removeFromCart: (_, { productId, input }, { user }) => {
      requireAuth(user);
      return removeFromCartService(user._id, { productId, cartItemId: input?.cartItemId });
    },
  },
  Cart: {
    id: (cart) => cart.id || cart._id?.toString(),
    _id: (cart) => cart._id?.toString() || cart.id,
    user: (cart, _, { loaders }) => {
      if (!cart.user) return null;
      if (typeof cart.user === "object" && cart.user._id) return cart.user;
      return loaders.userById.load(cart.user.toString());
    },
    items: (cart) => cart.items || [],
  },
  CartItem: {
    id: (item) => item.id || item._id?.toString(),
    _id: (item) => item._id?.toString() || item.id,
    product: (item, _, { loaders }) => resolveProduct(item, loaders),
  },
};

export default cartResolvers;
