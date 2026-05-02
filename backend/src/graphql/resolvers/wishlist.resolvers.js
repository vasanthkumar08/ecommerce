import {
  addToWishlistService,
  getWishlistService,
  removeFromWishlistService,
} from "../../modules/wishlist/wishlist.service.js";
import { requireAuth } from "../../utils/errors.js";

export const wishlistResolvers = {
  Query: {
    getWishlist: (_, __, { user }) => {
      requireAuth(user);
      return getWishlistService(user._id);
    },
  },
  Mutation: {
    addToWishlist: (_, { productId }, { user }) => {
      requireAuth(user);
      return addToWishlistService(user._id, productId);
    },
    removeFromWishlist: (_, { productId }, { user }) => {
      requireAuth(user);
      return removeFromWishlistService(user._id, productId);
    },
  },
  Wishlist: {
    id: (wishlist) => wishlist.id || wishlist._id?.toString(),
    _id: (wishlist) => wishlist._id?.toString() || wishlist.id,
    user: (wishlist, _, { loaders }) => {
      if (!wishlist.user) return null;
      if (typeof wishlist.user === "object" && wishlist.user._id) return wishlist.user;
      return loaders.userById.load(wishlist.user.toString());
    },
    items: (wishlist) => wishlist.items || [],
  },
  WishlistItem: {
    product: (item, _, { loaders }) => {
      if (!item.product) return null;
      if (typeof item.product === "object" && item.product._id) return item.product;
      return loaders.productById.load(item.product.toString());
    },
  },
};

export default wishlistResolvers;
