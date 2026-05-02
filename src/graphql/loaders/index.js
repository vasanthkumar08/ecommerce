import DataLoader from "dataloader";
import User from "../../models/user.js";
import Product from "../../models/Product.js";

const mapById = (documents) => {
  const map = new Map();
  documents.forEach((document) => map.set(document._id.toString(), document));
  return map;
};

export const createLoaders = () => ({
  userById: new DataLoader(async (ids) => {
    const users = await User.find({ _id: { $in: ids } }).select("-password");
    const usersById = mapById(users);
    return ids.map((id) => usersById.get(id.toString()) || null);
  }),
  productById: new DataLoader(async (ids) => {
    const products = await Product.find({ _id: { $in: ids } });
    const productsById = mapById(products);
    return ids.map((id) => productsById.get(id.toString()) || null);
  }),
});

export default createLoaders;
