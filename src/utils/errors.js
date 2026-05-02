import { GraphQLError } from "graphql";

export const graphQLError = (message, code = "BAD_USER_INPUT", statusCode = 400) =>
  new GraphQLError(message, {
    extensions: { code, http: { status: statusCode } },
  });

export const requireAuth = (user) => {
  if (!user) {
    throw graphQLError("Authentication required", "UNAUTHENTICATED", 401);
  }
  return user;
};

export const requireRole = (user, roles = []) => {
  requireAuth(user);
  if (!roles.includes(user.role)) {
    throw graphQLError("Not authorized", "FORBIDDEN", 403);
  }
  return user;
};
