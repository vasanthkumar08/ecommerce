import Product from "../../models/Product.js";
import { graphQLError } from "../../utils/errors.js";
import { productFiltersSchema } from "./product.validation.js";

const buildProductQuery = (filters) => {
  const query = {};

  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  if (filters.category) {
    query.category = filters.category;
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};
    if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
    if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
  }
  if (filters.inStock === true) {
    query.countInStock = { $gt: 0 };
  }

  return query;
};

export const getProductsService = async (input = {}) => {
  const filters = productFiltersSchema.parse(input);
  const query = buildProductQuery(filters);

  const [items, total] = await Promise.all([
    Product.find(query).sort({ createdAt: -1 }).skip(filters.skip).limit(filters.limit),
    Product.countDocuments(query),
  ]);

  return {
    items,
    total,
    limit: filters.limit,
    skip: filters.skip,
    hasMore: filters.skip + items.length < total,
  };
};

export const getProductByIdService = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    throw graphQLError("Product not found", "NOT_FOUND", 404);
  }
  return product;
};
