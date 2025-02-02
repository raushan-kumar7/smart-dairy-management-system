import { Router } from "express";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";
import {
  createBmc,
  deleteBMC,
  getBMC,
  getBMCs,
  updateBMC,
} from "../controllers/bmc.controller.js";

const bmcRouter = Router();

bmcRouter.use(verifyJWT, verifyRole("admin"));

bmcRouter.route("").post(createBmc).get(getBMCs);
bmcRouter.route("/:bmcCode").get(getBMC).put(updateBMC).delete(deleteBMC);

export default bmcRouter;