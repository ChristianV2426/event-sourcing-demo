import { Router } from "express";
import { createAccount, performTransaction, fetchAllAccounts, getAccountState} from "../controllers/accountController";

const router = Router();

router.post("/accounts", createAccount);
router.post("/accounts/transactions", performTransaction);
router.get("/accounts", fetchAllAccounts);
router.get("/accounts/:account_id", getAccountState);

export default router;