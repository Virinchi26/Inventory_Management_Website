const express = require("express");
const fileUpload = require("express-fileupload");
const {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  importProducts,
  checkProductByBarcode,
} = require("../controllers/productController");

const router = express.Router();

router.get("/", getAllProducts);
router.get("/low-stock", getLowStockProducts); // New route
router.get("/:id", getProductById);
router.get("/check-product/:barcode", checkProductByBarcode);

router.post("/", addProduct);
router.post("/import", importProducts);

router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
