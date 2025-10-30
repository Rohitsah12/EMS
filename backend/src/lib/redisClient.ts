import { createClient } from "redis";
import dotenv from "dotenv";
import { config } from "../config/index.js";

dotenv.config();

const host = config.redisHost;
const port = config.redisPort;

if (!host || !config.redisPassword) {
  console.warn("Redis env vars are not fully set. Check REDIS_HOST/REDIS_PASSWORD.");
}

export const redisClient = createClient({
  username: config.redisUsername,
  password: config.redisPassword,
  socket: { host, port },
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("Redis connected");
    }
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
  }
};
