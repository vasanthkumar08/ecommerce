export const typeDefs = `#graphql
  scalar DateTime

  enum UserRole {
    user
    admin
    superadmin
  }

  type User {
    id: ID!
    _id: ID!
    name: String!
    email: String!
    role: UserRole!
    createdAt: DateTime
    updatedAt: DateTime
  }

  type Product {
    id: ID!
    _id: ID!
    name: String!
    price: Float!
    description: String
    image: String
    category: String
    countInStock: Int
    createdAt: DateTime
    updatedAt: DateTime
  }

  type CartItem {
    id: ID!
    _id: ID!
    product: Product!
    quantity: Int!
  }

  type Cart {
    id: ID
    _id: ID
    user: User
    items: [CartItem!]!
  }

  type OrderItem {
    product: Product!
    quantity: Int!
  }

  type Order {
    id: ID!
    _id: ID!
    user: User
    items: [OrderItem!]!
    total: Float!
    status: String!
    createdAt: DateTime
    updatedAt: DateTime
  }

  type WishlistItem {
    product: Product!
    addedAt: DateTime
  }

  type Wishlist {
    id: ID
    _id: ID
    user: User
    items: [WishlistItem!]!
  }

  type ProductConnection {
    items: [Product!]!
    total: Int!
    limit: Int!
    skip: Int!
    hasMore: Boolean!
  }

  type AuthPayload {
    user: User!
    accessToken: String!
    refreshToken: String!
  }

  input ProductFiltersInput {
    search: String
    category: String
    minPrice: Float
    maxPrice: Float
    inStock: Boolean
    limit: Int = 20
    skip: Int = 0
  }

  input RegisterUserInput {
    name: String!
    email: String!
    password: String!
    role: UserRole
  }

  input LoginUserInput {
    email: String!
    password: String!
  }

  input CartItemInput {
    product: ID!
    quantity: Int = 1
  }

  input UpdateCartQuantityInput {
    product: ID!
    quantity: Int!
  }

  input RemoveFromCartInput {
    cartItemId: ID!
  }

  input OrderItemInput {
    product: ID!
    quantity: Int!
  }

  input PlaceOrderInput {
    items: [OrderItemInput!]!
    total: Float!
  }

  type Query {
    getProducts(filters: ProductFiltersInput): ProductConnection!
    getProductById(id: ID!): Product
    getCart: Cart!
    getOrders: [Order!]!
    getWishlist: Wishlist!
    getUserProfile: User!
  }

  type Mutation {
    registerUser(input: RegisterUserInput!): AuthPayload!
    loginUser(input: LoginUserInput!): AuthPayload!
    logoutUser: Boolean!
    refreshToken: AuthPayload!
    addToCart(input: CartItemInput!): Cart!
    updateCartQuantity(input: UpdateCartQuantityInput!): Cart!
    removeFromCart(productId: ID, input: RemoveFromCartInput): Cart!
    placeOrder(input: PlaceOrderInput!): Order!
    addToWishlist(productId: ID!): Wishlist!
    removeFromWishlist(productId: ID!): Wishlist!
  }
`;

export default typeDefs;
