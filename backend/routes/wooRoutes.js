const express = require("express");
const router = express.Router();
const {
  getOrders,
  saveConfig,
  checkOrderStockAndStatus,
  shipOrderItem,
} = require("../controllers/wooController");


router.post("/woo/save-config", saveConfig);
router.post("/woo/get-orders", getOrders);
router.post("/woo/check-stock", checkOrderStockAndStatus);
router.post("/woo/ship-item", shipOrderItem);


module.exports = router;
