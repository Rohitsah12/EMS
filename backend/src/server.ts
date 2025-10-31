import http from "http";
import app from "./app.js"; 
import { config } from "./config/index.js";
import { connectRedis, redisClient } from "./lib/redisClient.js"; 
import { startAttendanceCronJob } from "./cron/markAbsentAttendance.js";

async function startServer() {
  const server = http.createServer(app);


  try {
    await connectRedis();
  } catch (error) {
    console.error("Fatal: Failed to connect to essential services:", error);
    process.exit(1); 
  }

  const port = config.port;
  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    startAttendanceCronJob();
  });

  const shutdown = (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log("HTTP server closed.");
      redisClient.quit();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM')); 
  process.on('SIGINT', () => shutdown('SIGINT'));   
}
startServer();
