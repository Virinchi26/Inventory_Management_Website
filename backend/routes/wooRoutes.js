const express = require("express");
const router = express.Router();
const { getOrders, saveConfig } = require("../controllers/wooController");

router.post("/woo/save-config", saveConfig);
router.post("/woo/get-orders", getOrders);

module.exports = router;
