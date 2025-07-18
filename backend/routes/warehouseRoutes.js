const express = require("express");
const router = express.Router();
const warehouseController = require("../controllers/warehouseController");

router.get("/warehouse-stock", warehouseController.getWarehouseStock);
router.post("/add-warehouse-stock", warehouseController.addWarehouseStock);
router.post("/transfer-stock", warehouseController.transferStock);

router.post("/import-warehouse-products", warehouseController.uploadWarehouseProducts);

module.exports = router;
