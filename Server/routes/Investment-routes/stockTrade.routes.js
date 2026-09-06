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
import {
  getAllFixedDeposits,
  createFixedDeposit,
  updateFixedDeposit,
  deleteFixedDeposit,
  getFixedDepositGroups,
  updateFixedDepositGroups,
} from "../../controllers/Investment-controllers/fixedDeposit.controller.js";
import {
  getAllRecurringDeposits,
  createRecurringDeposit,
  updateRecurringDeposit,
  deleteRecurringDeposit,
  getRecurringDepositGroups,
  updateRecurringDepositGroups,
  addRdDeposit,
  updateRdDeposit,
  deleteRdDeposit,
} from "../../controllers/Investment-controllers/recurringDeposit.controller.js";
import {
  getAllSalaries,
  createSalary,
  updateSalary,
  deleteSalary,
} from "../../controllers/Investment-controllers/salary.controller.js";
import {
  getAllPfWithdrawals,
  createPfWithdrawal,
  updatePfWithdrawal,
  deletePfWithdrawal,
} from "../../controllers/Investment-controllers/pfWithdrawal.controller.js";

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

// Fixed Deposit Custom Groups routes (placed before /fd/:id to avoid parameter clash)
router
  .route("/fd-groups")
  .get(getFixedDepositGroups)
  .put(updateFixedDepositGroups);

router
  .route("/fd/groups")
  .get(getFixedDepositGroups)
  .put(updateFixedDepositGroups);

// Fixed Deposit routes
router
  .route("/fd")
  .get(getAllFixedDeposits)
  .post(createFixedDeposit);

router
  .route("/fd/:id")
  .put(updateFixedDeposit)
  .delete(deleteFixedDeposit);

// Recurring Deposit Custom Groups routes (placed before /rd/:id to avoid parameter clash)
router
  .route("/rd-groups")
  .get(getRecurringDepositGroups)
  .put(updateRecurringDepositGroups);

router
  .route("/rd/groups")
  .get(getRecurringDepositGroups)
  .put(updateRecurringDepositGroups);

// Recurring Deposit routes
router
  .route("/rd")
  .get(getAllRecurringDeposits)
  .post(createRecurringDeposit);

router
  .route("/rd/:id")
  .put(updateRecurringDeposit)
  .delete(deleteRecurringDeposit);

router
  .route("/rd/:id/transactions")
  .post(addRdDeposit);

router
  .route("/rd/:id/transactions/:txnId")
  .put(updateRdDeposit)
  .delete(deleteRdDeposit);

// Salary routes
router
  .route("/salary")
  .get(getAllSalaries)
  .post(createSalary);

router
  .route("/salary/:id")
  .put(updateSalary)
  .delete(deleteSalary);

// Provident Fund (PF) Withdrawal routes
router
  .route("/pf/withdrawals")
  .get(getAllPfWithdrawals)
  .post(createPfWithdrawal);

router
  .route("/pf/withdrawals/:id")
  .put(updatePfWithdrawal)
  .delete(deletePfWithdrawal);

export default router;
