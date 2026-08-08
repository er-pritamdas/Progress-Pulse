import { Router } from "express";
import { verifyToken } from "../../middlewares/JwtAuthorization.middleware.js";
import {
  getAllStockTrades,
  createStockTrade,
  updateStockTrade,
  deleteStockTrade,
} from "../../controllers/Investment-controllers/stockTrade.controller.js";

const router = Router();

// Apply auth verification to all routes
router.use(verifyToken);

router
  .route("/stocks")
  .get(getAllStockTrades)
  .post(createStockTrade);

router
  .route("/stocks/:id")
  .put(updateStockTrade)
  .delete(deleteStockTrade);

export default router;
