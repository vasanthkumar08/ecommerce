import Product from "../models/Product.js";

const isMongoId = (id) => /^[a-f\d]{24}$/i.test(id);

const normalizeProductPayload = (body, partial = false) => {
  const payload = {};

  if (!partial || body.name !== undefined) payload.name = body.name?.trim();
  if (!partial || body.price !== undefined) payload.price = Number(body.price);
  if (body.image !== undefined) payload.image = body.image;
  if (body.description !== undefined) payload.description = body.description;
  if (body.category !== undefined) payload.category = body.category?.trim();
  if (body.countInStock !== undefined) payload.countInStock = Number(body.countInStock);

  if (!partial && !payload.name) throw new Error("Product name is required");
  if (!partial && (payload.price === undefined || Number.isNaN(payload.price))) {
    throw new Error("Valid product price is required");
  }
  if (payload.price !== undefined && (Number.isNaN(payload.price) || payload.price < 0)) {
    throw new Error("Product price must be a positive number");
  }
  if (payload.countInStock !== undefined && (Number.isNaN(payload.countInStock) || payload.countInStock < 0)) {
    throw new Error("Product stock must be a positive number");
  }

  Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
  return payload;
};

/* =========================
   CREATE PRODUCT
========================= */
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(normalizeProductPayload(req.body));

    res.status(201).json(product);
  } catch (error) {
    res.status(error.name === "ValidationError" || error.message.includes("required") || error.message.includes("must") ? 400 : 500).json({ message: error.message });
  }
};

/* =========================
   GET ALL PRODUCTS
========================= */
export const getProducts = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 100), 100);
    const skip = Math.max(Number(req.query.skip || 0), 0);
    const query = {};

    if (req.query.search) query.$text = { $search: String(req.query.search).slice(0, 100) };
    if (req.query.category) query.category = String(req.query.category).trim();

    const products = await Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET SINGLE PRODUCT
========================= */
export const getProductById = async (req, res) => {
  try {
    if (!isMongoId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   UPDATE PRODUCT
========================= */
export const updateProduct = async (req, res) => {
  try {
    if (!isMongoId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const payload = normalizeProductPayload(req.body, true);
    Object.assign(product, payload);

    const updated = await product.save();

    res.json(updated);
  } catch (error) {
    res.status(error.name === "ValidationError" || error.message.includes("must") ? 400 : 500).json({ message: error.message });
  }
};

/* =========================
   DELETE PRODUCT
========================= */
export const deleteProduct = async (req, res) => {
  try {
    if (!isMongoId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
