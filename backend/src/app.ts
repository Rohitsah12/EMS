import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { config } from "./config/index.js";
import router from './api/index.js'; 
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(cors({
    origin: config.frontend_url, 
    credentials: true,
}));

app.use(express.json({ limit: '16kb' }));
app.use(cookieParser());


app.use('/api', router);


app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
    res.status(200).json({ success: true, message: "Welcome to the Spin Wheel API!" });
});


app.use(errorHandler);

export default app;
