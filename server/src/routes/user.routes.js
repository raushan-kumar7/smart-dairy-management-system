import { Router } from "express";
import { createUser, deleteUserAccount, getCurrentUser, updateUser } from "../controllers/user.controller.js";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.use(verifyJWT);

userRouter.route("/create-account").post(verifyRole("admin"), createUser);
userRouter.route("/update-account").put(updateUser);
userRouter.route("/current-user").get(getCurrentUser);
userRouter.route("/delete-account").delete(deleteUserAccount);

export default userRouter;