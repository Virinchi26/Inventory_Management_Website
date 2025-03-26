const db = require("../db");

// ✅ Get all warehouse stock with product details

exports.getWarehouseStock = async (req, res) => {
  try {
    // ✅ Fetch all warehouse stock details
    const [stockData] = await db.query(`
      SELECT id,product_id, product_name,barcode, location_name, stock_quantity 
      FROM warehouse
    `);

    // ✅ Check if data exists
    if (stockData.length === 0) {
      return res.status(404).json({ message: "❌ No stock found!" });
    }

    return res.json(stockData); // ✅ Return warehouse stock data
  } catch (error) {
    console.error("❌ Error fetching warehouse stock:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.addWarehouseStock = async (req, res) => {
  let { product_name, barcode, location_name, stock_quantity } = req.body;

  try {
    // ✅ Get product ID using `sku`
    const [productData] = await db.query(
      `SELECT id FROM products WHERE barcode = ?`,
      [barcode]
    );

    if (productData.length === 0) {
      return res.status(404).json({ message: "❌ Product not found!" });
    }

    const product_id = productData[0].id;
    location_name = location_name.trim().toLowerCase(); // Normalize location name

    // ✅ Check if stock already exists in the same location with the same `sku`
    const [existingStock] = await db.query(
      `SELECT id, stock_quantity FROM warehouse WHERE product_id = ? AND barcode = ? AND LOWER(location_name) = LOWER(?)`,
      [product_id, barcode, location_name]
    );

    if (existingStock.length > 0) {
      // ✅ Update stock quantity if product exists at location
      await db.query(
        `UPDATE warehouse SET stock_quantity = stock_quantity + ? WHERE product_id = ? AND barcode = ? AND LOWER(location_name) = LOWER(?)`,
        [stock_quantity, product_id, barcode, location_name]
      );
      return res.json({ message: "✅ Stock updated successfully!" });
    } else {
      // ✅ Insert new stock entry
      await db.query(
        `INSERT INTO warehouse (product_id, product_name, barcode, location_name, stock_quantity) VALUES (?, ?, ?, ?, ?)`,
        [product_id, product_name, barcode, location_name, stock_quantity]
      );
      return res.json({ message: "✅ Stock added successfully!" });
    }
  } catch (error) {
    console.error("❌ Error managing stock:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Transfer stock between locations
exports.transferStock = async (req, res) => {
  const { barcode, from_location, to_location, transfer_quantity } = req.body;

  try {
    // ✅ Convert location names to lowercase for consistency
    const fromLocation = from_location.trim().toLowerCase();
    const toLocation = to_location.trim().toLowerCase();

    // ✅ Get product details using `sku`
    const [productData] = await db.query(
      `SELECT id, item_name FROM products WHERE barcode = ?`,
      [barcode]
    );

    if (productData.length === 0) {
      return res.status(404).json({ message: "❌ Product not found!" });
    }

    const product_id = productData[0].id;
    const product_name = productData[0].item_name;

    // ✅ Check if enough stock is available at `from_location`
    const [sourceStock] = await db.query(
      `SELECT stock_quantity FROM warehouse WHERE product_id = ? AND barcode = ? AND LOWER(location_name) = LOWER(?)`,
      [product_id, barcode, fromLocation]
    );

    if (
      sourceStock.length === 0 ||
      sourceStock[0].stock_quantity < transfer_quantity
    ) {
      return res
        .status(400)
        .json({ message: "❌ Not enough stock at source location!" });
    }

    // ✅ Reduce stock from `from_location`
    await db.query(
      `UPDATE warehouse SET stock_quantity = stock_quantity - ? WHERE product_id = ? AND barcode = ? AND LOWER(location_name) = LOWER(?)`,
      [transfer_quantity, product_id, barcode, fromLocation]
    );

    // ✅ Check if stock already exists at `to_location`
    const [destinationStock] = await db.query(
      `SELECT stock_quantity FROM warehouse WHERE product_id = ? AND barcode = ? AND LOWER(location_name) = LOWER(?)`,
      [product_id, barcode, toLocation]
    );

    if (destinationStock.length > 0) {
      // ✅ If stock exists, update the quantity
      await db.query(
        `UPDATE warehouse SET stock_quantity = stock_quantity + ? WHERE product_id = ? AND barcode = ? AND LOWER(location_name) = LOWER(?)`,
        [transfer_quantity, product_id, barcode, toLocation]
      );
    } else {
      // ✅ If stock does not exist, insert a new record
      await db.query(
        `INSERT INTO warehouse (product_id, product_name, barcode, location_name, stock_quantity) VALUES (?, ?, ?, ?, ?)`,
        [product_id, product_name, barcode, toLocation, transfer_quantity]
      );
    }

    return res.json({ message: "✅ Stock transferred successfully!" });
  } catch (error) {
    console.error("❌ Error transferring stock:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
