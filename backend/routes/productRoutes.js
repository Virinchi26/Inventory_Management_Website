const express = require("express");

const {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  viewProducts,
  importProducts,
} = require("../controllers/productController");

const router = express.Router();

router.get("/", getAllProducts);
router.get("/low-stock", getLowStockProducts); // New route
router.get("/:id", getProductById);
router.post("/", addProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
