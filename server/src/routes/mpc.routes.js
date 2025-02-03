import { Router } from "express"
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js"
import { getMPCCounts, getMPCsDetails } from "../controllers/mpc.controller.js";

const mpcRouter = Router();

mpcRouter.use(verifyJWT, verifyRole("admin"));

mpcRouter.route("/details").get(getMPCsDetails);
mpcRouter.route("/counts").get(getMPCCounts)

export default mpcRouter;