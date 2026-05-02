import { GraphQLScalarType, Kind } from "graphql";
import userResolvers from "./user.resolvers.js";
import productResolvers from "./product.resolvers.js";
import cartResolvers from "./cart.resolvers.js";
import orderResolvers from "./order.resolvers.js";
import wishlistResolvers from "./wishlist.resolvers.js";

const dateTimeScalar = new GraphQLScalarType({
  name: "DateTime",
  serialize(value) {
    return value instanceof Date ? value.toISOString() : value;
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    return ast.kind === Kind.STRING ? new Date(ast.value) : null;
  },
});

const mergeResolvers = (...resolverMaps) =>
  resolverMaps.reduce((merged, resolverMap) => {
    Object.entries(resolverMap).forEach(([typeName, resolvers]) => {
      merged[typeName] = { ...(merged[typeName] || {}), ...resolvers };
    });
    return merged;
  }, {});

export const resolvers = mergeResolvers(
  { DateTime: dateTimeScalar },
  userResolvers,
  productResolvers,
  cartResolvers,
  orderResolvers,
  wishlistResolvers
);

export default resolvers;
