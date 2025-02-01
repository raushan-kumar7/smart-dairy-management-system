import { Router } from "express";
import {
  forgotPassword,
  login,
  logout,
  resetPassword,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.route("/login").post(login);
authRouter.route("/forgot-password").post(forgotPassword);
authRouter.route("/reset-password/:token").post(resetPassword);

// secure route
authRouter.route("/logout").post(verifyJWT, logout);

export default authRouter;