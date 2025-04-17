const db = require("../db");

exports.performStockAudit = async (req, res) => {
  const { barcode, physical_stock, location_name, audited_by } = req.body;

  try {
    // 1. Fetch product_name using the barcode from products
    const [productData] = await db.query(
      "SELECT item_name FROM products WHERE barcode = ?",
      [barcode]
    );

    if (productData.length === 0) {
      return res
        .status(404)
        .json({ message: "Product not found with this barcode." });
    }

    const product_name = productData[0].item_name;

    // 2. Fetch system stock from warehouse using barcode and location
    const [warehouseData] = await db.query(
      `SELECT * FROM warehouse WHERE barcode = ? AND location_name = ?`,
      [parseInt(barcode), location_name]
    );

    if (warehouseData.length === 0) {
      return res.status(404).json({
        message: "Product not found in warehouse for selected location.",
      });
    }

    const system_stock = warehouseData[0].stock_quantity;
    const difference = physical_stock - system_stock;

    // 3. Insert audit record into stock_audit
    await db.query(
      `INSERT INTO stock_audit 
          (barcode, product_name, location_name, system_stock, physical_stock, difference, audited_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        barcode,
        product_name,
        location_name,
        system_stock,
        physical_stock,
        difference,
        audited_by,
      ]
    );

    // 4. Optionally update warehouse stock
    if (difference !== 0) {
      await db.query(
        "UPDATE warehouse SET stock_quantity = ? WHERE barcode = ? AND location_name = ?",
        [physical_stock, barcode, location_name]
      );
    }

    return res.json({
      message: "Stock audit completed.",
      product_name,
      barcode,
      location_name,
      previous_stock: system_stock,
      updated_stock: physical_stock,
      difference,
    });
  } catch (error) {
    console.error("Stock audit error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/stock-audit/history
exports.getAuditHistory = async (req, res) => {
  try {
    const [history] = await db.query(
      "SELECT * FROM stock_audit ORDER BY audited_at DESC"
    );
    res.json(history);
  } catch (error) {
    console.error("Fetch audit history failed:", error);
    res.status(500).json({ error: "Server error" });
  }
};
