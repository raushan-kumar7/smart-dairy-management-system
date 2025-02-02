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
import healthRouter from "./routes/health.routes.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import bmcRouter from "./routes/bmc.routes.js";
import mppRouter from "./routes/mpp.routes.js";

// Routes declaration
app.use("/api/v1/healthcheck", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/bmcs", bmcRouter);
app.use("/api/v1/mpps", mppRouter);

export { app };