import "./config/env.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { sanitize } from "express-mongo-sanitize";
import { ApolloServer } from "@apollo/server";
import { unwrapResolverError } from "@apollo/server/errors";
import { expressMiddleware } from "@as-integrations/express5";
import { createComplexityRule, fieldExtensionsEstimator, simpleEstimator } from "graphql-query-complexity";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import typeDefs from "./graphql/schema/typeDefs.js";
import resolvers from "./graphql/resolvers/index.js";
import createGraphQLContext from "./graphql/context/index.js";
import requestLoggerPlugin from "./graphql/plugins/requestLogger.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { authRateLimiter, restRateLimiter, uploadRateLimiter } from "./middleware/rateLimiter.js";
import csrfProtection from "./middleware/csrfProtection.js";
import requireDatabase from "./middleware/dbReady.js";
import { getDatabaseStatus } from "./config/db.js";

const normalizeOrigin = (origin) => String(origin || "").trim().replace(/\/+$/, "");

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://ecommerce-frontend-three-psi.vercel.app",
].map(normalizeOrigin);

const corsOptions = {
  origin(origin, callback) {
    const normalizedOrigin = normalizeOrigin(origin);
    const isAllowed = !origin || allowedOrigins.includes(normalizedOrigin);

    console.log(`[cors] origin=${origin || "no-origin"} allowed=${isAllowed}`);

    if (isAllowed) {
      callback(null, true);
      return;
    }

    callback(new Error("CORS not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Apollo-Require-Preflight", "X-CSRF-Token"],
  preflightContinue: false,
  optionsSuccessStatus: 200,
};

const sanitizeXssInPlace = (value) => {
  if (!value || typeof value !== "object") return;
  Object.keys(value).forEach((key) => {
    if (typeof value[key] === "string") {
      value[key] = value[key]
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/on\w+\s*=/gi, "")
        .replace(/javascript:/gi, "");
    } else if (typeof value[key] === "object") {
      sanitizeXssInPlace(value[key]);
    }
  });
};

const createApolloServer = () =>
  new ApolloServer({
    typeDefs,
    resolvers,
    introspection: process.env.NODE_ENV !== "production",
    persistedQueries: true,
    validationRules: [
      createComplexityRule({
        maximumComplexity: Number(process.env.GRAPHQL_MAX_COMPLEXITY || 1000),
        estimators: [fieldExtensionsEstimator(), simpleEstimator({ defaultComplexity: 1 })],
      }),
    ],
    plugins: [requestLoggerPlugin],
    formatError: (formattedError, error) => {
      const originalError = unwrapResolverError(error);

      if (originalError?.name === "ZodError") {
        return {
          message: "Invalid input",
          extensions: {
            code: "BAD_USER_INPUT",
            issues: originalError.issues?.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
            })),
          },
        };
      }

      if (process.env.NODE_ENV === "production" && formattedError.extensions?.code === "INTERNAL_SERVER_ERROR") {
        return {
          message: "Internal server error",
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        };
      }
      return formattedError;
    },
  });

export const createApp = async () => {
  const app = express();
  const apolloServer = createApolloServer();

  await apolloServer.start();

  app.set("trust proxy", Number(process.env.TRUST_PROXY || 1));
  app.disable("x-powered-by");
  app.use(cors(corsOptions));
  app.options(/.*/, cors(corsOptions));
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use((req, res, next) => {
    sanitize(req.body, { replaceWith: "_" });
    sanitize(req.params, { replaceWith: "_" });
    sanitize(req.query, { replaceWith: "_" });
    next();
  });
  app.use((req, res, next) => {
    sanitizeXssInPlace(req.body);
    sanitizeXssInPlace(req.params);
    sanitizeXssInPlace(req.query);
    next();
  });
  app.use(csrfProtection);

  app.get("/", (req, res) => {
    res.send("API running....");
  });

  app.get("/health", (req, res) => {
    const db = getDatabaseStatus();
    res.status(200).json({
      status: db.connected ? "ok" : "degraded",
      db,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.options("/graphql", cors(corsOptions));
  app.post("/graphql", cors(corsOptions), requireDatabase, expressMiddleware(apolloServer, { context: createGraphQLContext }));

  app.use("/api/auth", requireDatabase, authRateLimiter, authRoutes);
  app.use("/api/products", requireDatabase, restRateLimiter, productRoutes);
  app.use("/api/cart", requireDatabase, restRateLimiter, cartRoutes);
  app.use("/api/wishlist", requireDatabase, restRateLimiter, wishlistRoutes);
  app.use("/api/orders", requireDatabase, restRateLimiter, orderRoutes);
  app.use("/api/payment", restRateLimiter, paymentRoutes);
  app.use("/api/upload", uploadRateLimiter, uploadRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export default createApp;
