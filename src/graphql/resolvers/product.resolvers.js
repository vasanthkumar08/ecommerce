import {
  getProductByIdService,
  getProductsService,
} from "../../modules/product/product.service.js";

export const productResolvers = {
  Query: {
    getProducts: (_, { filters }) => getProductsService(filters || {}),
    getProductById: (_, { id }) => getProductByIdService(id),
  },
  Product: {
    id: (product) => product.id || product._id?.toString(),
    _id: (product) => product._id?.toString() || product.id,
  },
};

export default productResolvers;
