import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import listingsRouter from "./listings.js";
import sellerRouter from "./seller.js";
import adminRouter from "./admin.js";
import buyerRouter from "./buyer.js";
import aiRouter from "./ai.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/listings", listingsRouter);
router.use("/seller", sellerRouter);
router.use("/admin", adminRouter);
router.use("/buyer", buyerRouter);
router.use("/ai", aiRouter);

export default router;
