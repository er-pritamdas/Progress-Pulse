import { Router } from "express";
import { verifyToken } from "../../middlewares/JwtAuthorization.middleware.js";
import {
  getAllStockTrades,
  createStockTrade,
  updateStockTrade,
  deleteStockTrade,
} from "../../controllers/Investment-controllers/stockTrade.controller.js";
import {
  getAllMutualFunds,
  createMutualFund,
  updateMutualFund,
  deleteMutualFund,
  addSipTransaction,
  updateSipTransaction,
  deleteSipTransaction,
  getMutualFundGroups,
  updateMutualFundGroups,
} from "../../controllers/Investment-controllers/mutualFund.controller.js";

const router = Router();

// Apply auth verification to all routes
router.use(verifyToken);

// Stock routes
router
  .route("/stocks")
  .get(getAllStockTrades)
  .post(createStockTrade);

router
  .route("/stocks/:id")
  .put(updateStockTrade)
  .delete(deleteStockTrade);

// Mutual Fund Custom Groups routes (placed before /mf/:id to avoid parameter clash)
router
  .route("/mf-groups")
  .get(getMutualFundGroups)
  .put(updateMutualFundGroups);

router
  .route("/mf/groups")
  .get(getMutualFundGroups)
  .put(updateMutualFundGroups);

// Mutual Fund routes
router
  .route("/mf")
  .get(getAllMutualFunds)
  .post(createMutualFund);

router
  .route("/mf/:id")
  .put(updateMutualFund)
  .delete(deleteMutualFund);

router
  .route("/mf/:id/transactions")
  .post(addSipTransaction);

router
  .route("/mf/:id/transactions/:txnId")
  .put(updateSipTransaction)
  .delete(deleteSipTransaction);

export default router;
