const db = require("../db");

// ✅ Get all warehouse stock with product details
exports.getWarehouseStock = async (req, res) => {
  try {
    const query = `
      SELECT w.id, p.item_name, p.sku, p.barcode, w.location_name, w.stock_quantity
      FROM warehouse w
      JOIN products p ON w.product_id = p.id
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching warehouse stock:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Add new stock or update existing stock
exports.addWarehouseStock = async (req, res) => {
  let { product_id, location_name, stock_quantity } = req.body;

  try {
    // Convert location to lowercase to avoid duplication due to case differences
    location_name = location_name.trim().toLowerCase();

    // ✅ Check if stock already exists at the given location
    const checkQuery = `
      SELECT id, stock_quantity 
      FROM warehouse 
      WHERE product_id = ? AND LOWER(location_name) = LOWER(?)
    `;
    const [existingStock] = await db.query(checkQuery, [
      product_id,
      location_name,
    ]);

    if (existingStock.length > 0) {
      // ✅ If product already exists at the location, update stock quantity
      const updateQuery = `
        UPDATE warehouse 
        SET stock_quantity = stock_quantity + ? 
        WHERE product_id = ? AND LOWER(location_name) = LOWER(?)
      `;
      await db.query(updateQuery, [stock_quantity, product_id, location_name]);
      return res.json({ message: "Stock updated successfully!" });
    } else {
      // ✅ If product does not exist at the location, insert a new record
      const insertQuery = `
        INSERT INTO warehouse (product_id, location_name, stock_quantity) 
        VALUES (?, ?, ?)
      `;
      await db.query(insertQuery, [product_id, location_name, stock_quantity]);
      return res.json({ message: "Stock added successfully!" });
    }
  } catch (error) {
    console.error("Error managing stock:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Transfer stock between locations
exports.transferStock = async (req, res) => {
  const { product_id, from_location, to_location, quantity } = req.body;

  try {
    // Check if stock is available at the source location
    const checkStockQuery = `SELECT stock_quantity FROM warehouse WHERE product_id = ? AND location_name = ?`;
    const [fromStock] = await db.query(checkStockQuery, [
      product_id,
      from_location,
    ]);

    if (fromStock.length === 0 || fromStock[0].stock_quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock available!" });
    }

    // Reduce stock from source location
    const reduceStockQuery = `UPDATE warehouse SET stock_quantity = stock_quantity - ? WHERE product_id = ? AND location_name = ?`;
    await db.query(reduceStockQuery, [quantity, product_id, from_location]);

    // Add stock to destination location (insert if not exists)
    const checkDestinationQuery = `SELECT * FROM warehouse WHERE product_id = ? AND location_name = ?`;
    const [toStock] = await db.query(checkDestinationQuery, [
      product_id,
      to_location,
    ]);

    if (toStock.length === 0) {
      const addNewLocationQuery = `INSERT INTO warehouse (product_id, location_name, stock_quantity) VALUES (?, ?, ?)`;
      await db.query(addNewLocationQuery, [product_id, to_location, quantity]);
    } else {
      const increaseStockQuery = `UPDATE warehouse SET stock_quantity = stock_quantity + ? WHERE product_id = ? AND location_name = ?`;
      await db.query(increaseStockQuery, [quantity, product_id, to_location]);
    }

    res.json({ message: "Stock transferred successfully!" });
  } catch (error) {
    console.error("Error transferring stock:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
