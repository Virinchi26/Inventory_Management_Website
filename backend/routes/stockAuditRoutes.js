const express = require("express");
const router = express.Router();
const {
  performStockAudit,
  getAuditHistory,
} = require("../controllers/stockAuditController");

router.post("/stock-audit", performStockAudit);
router.get("/stock-audit-history", getAuditHistory);

module.exports = router;
