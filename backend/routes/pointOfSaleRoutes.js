const express = require("express");
const router = express.Router();
const pointOfSaleController = require("../controllers/pointOfSaleController");

router.post("/sales", async (req, res) => {
  const { action, ...params } = req.body;

  try {
    switch (action) {
      case "getRemainingStock":
        return res.json(await pointOfSaleController.getRemainingStock());

      case "insertSale":
        const requiredFields = ["totalAmount", "paymentMethod"];
        for (const field of requiredFields) {
          if (params[field] === undefined || params[field] === "") {
            return res.json({
              success: false,
              message: `Missing parameter: ${field}`,
            });
          }
        }
        return res.json(await pointOfSaleController.insertSale(params));

      case "insertSaleItems":
        if (
          !params.saleId ||
          !Array.isArray(params.items) ||
          params.items.length === 0
        ) {
          return res.json({
            success: false,
            message: "Missing or invalid saleId and items array",
          });
        }
        return res.json(
          await pointOfSaleController.insertSaleItems(
            params.saleId,
            params.items
          )
        );

      case "getSalesWithItems":
        return res.json(await pointOfSaleController.getSalesWithItems());

      case "getAllPhoneNumbers":
        return res.json(await pointOfSaleController.getAllPhoneNumbers());

      default:
        return res.json({ success: false, message: "Invalid action" });
    }
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

module.exports = router;
