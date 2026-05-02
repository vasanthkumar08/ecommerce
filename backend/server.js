import connectDB from "./src/config/db.js";
import createApp from "./src/app.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  const app = await createApp();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
