import test from "node:test";
import assert from "node:assert/strict";
import resolvers from "./index.js";

test("getCart requires authentication", async () => {
  assert.throws(
    () => resolvers.Query.getCart(null, {}, { user: null }),
    /Authentication required/
  );
});

test("Product resolver exposes stable id fields", () => {
  const product = { _id: { toString: () => "product-1" } };

  assert.equal(resolvers.Product.id(product), "product-1");
  assert.equal(resolvers.Product._id(product), "product-1");
});

test("logout resolver clears auth cookies", async () => {
  const cleared = [];
  const res = {
    clearCookie(name) {
      cleared.push(name);
    },
  };

  const result = await resolvers.Mutation.logoutUser(null, {}, { res });

  assert.equal(result, true);
  assert.deepEqual(cleared, ["accessToken", "refreshToken", "csrfToken"]);
});
