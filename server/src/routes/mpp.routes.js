import { Router } from "express";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";
import {
  createMPP,
  getMPPs,
  getMPP,
  updateMPP,
  deleteMPP,
} from "../controllers/mpp.controller.js";

const mppRouter = Router();

mppRouter.use(verifyJWT, verifyRole("admin"));

mppRouter.route("").post(createMPP).get(getMPPs);
mppRouter.route("/:mppCode").get(getMPP).put(updateMPP).delete(deleteMPP);

export default mppRouter;