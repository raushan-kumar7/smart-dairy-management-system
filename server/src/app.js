import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./utils/ErrorMiddleware.js";

const app = express();

app.use(cors({}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Handle errors globally using the ErrorMiddleware
app.use(ErrorMiddleware);

// Import and use the routes
import adminRoutes from "./routes/admin.routes.js"
import authRouter from "./routes/auth.routes.js";

// Routes declaration
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRoutes);
export { app };