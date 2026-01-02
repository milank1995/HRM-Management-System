import "dotenv/config";
import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./utils/dbConnect";
import router from "./routes";

export async function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Data Source has been initialized!");
    }
  } catch (err) {
    console.error("Error during Data Source initialization:", err);
    throw err;
  }
 
  app.use('/api', router);

  return app;
}

// Start the server
const web = await createServer();
web.listen(process.env.PORT || 4000, () => {
  console.log(`🚀 Server is running on port ${process.env.PORT || 4000}`);
});

// Backend PORT: 4000
// Frontend PORT: 8080