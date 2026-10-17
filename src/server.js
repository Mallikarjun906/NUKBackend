
require("dotenv").config();

const { validateEnv } = require("./config/env");
const connectDB = require("./config/db");

async function startServer() {
  validateEnv();
  await connectDB();

  const app = require("./app");
  const port = Number(process.env.PORT) || 5000;

  const server = app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      const mongoose = require("mongoose");
      await mongoose.disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
