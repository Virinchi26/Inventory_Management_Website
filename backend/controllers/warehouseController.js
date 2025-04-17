const db = require("../db");
const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store files in "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  },
});

const upload = multer({ storage }).single("file");

// Upload and Process Excel File
exports.uploadWarehouseProducts = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: "File upload failed!" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded!" });
    }

    try {
      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      const { location_name } = req.body; // Get selected location from dropdown
      let notAddedProducts = [];

      for (const row of sheetData) {
        // ✅ Extract necessary columns
        const product_name = row["item_name"];
        const barcode = row["barcode"];

        // ❌ Skip rows missing required data
        if (!product_name || !barcode) continue;

        // ✅ Check if the product exists in the `products` table using barcode
        const [existingProducts] = await db.query(
          "SELECT id, item_name FROM products WHERE barcode = ?",
          [barcode]
        );

        if (existingProducts.length > 0) {
          const product_id = existingProducts[0].id; // ✅ Get `product_id` from products table

          // ✅ Check if the product is already in the warehouse at the given location
          const [existingStock] = await db.query(
            `SELECT * FROM warehouse WHERE barcode = ? AND location_name = ?`,
            [barcode, location_name]
          );

          if (existingStock.length > 0) {
            // 🔄 Update stock quantity if product already exists in warehouse
            await db.query(
              `UPDATE warehouse
               SET stock_quantity = stock_quantity + 1 
               WHERE barcode = ? AND location_name = ?`,
              [barcode, location_name]
            );
          } else {
            // ➕ Insert new entry with `product_id`
            await db.query(
              `INSERT INTO warehouse (product_id, product_name, barcode, location_name, stock_quantity) 
               VALUES (?, ?, ?, ?, 1)`,
              [product_id, product_name, barcode, location_name]
            );
          }
        } else {
          notAddedProducts.push({ product_name, barcode }); // Track products not found
        }
      }

      // ✅ Send response with products that were not added
      if (notAddedProducts.length > 0) {
        return res.json({
          message:
            "Some products were not added (not found in products table).",
          notAddedProducts,
        });
      } else {
        return res.json({ message: "All products added successfully!" });
      }
    } catch (error) {
      console.error("❌ Error processing file:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
};

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
      `SELECT id FROM warehouse WHERE product_id = ? AND barcode = ? AND  LOWER(location_name) = LOWER(?)`,
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
        `INSERT INTO warehouse (product_id, product_name, barcode, location_name,stock_quantity) VALUES (?, ?, ?, ?, ?)`,
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
    // Step 1: Get the stock item from source location
    const [sourceStockRows] = await db.query(
      `SELECT * FROM warehouse WHERE barcode = ? AND location_name = ?`,
      [barcode, from_location]
    );

    if (sourceStockRows.length === 0) {
      return res
        .status(400)
        .json({ message: "Source location does not have this product." });
    }

    const sourceStock = sourceStockRows[0];

    if (sourceStock.stock_quantity < transfer_quantity) {
      return res
        .status(400)
        .json({ message: "Not enough stock in source location." });
    }

    // Step 2: Reduce stock from source
    await db.query(
      `UPDATE warehouse SET stock_quantity = stock_quantity - ? WHERE id = ?`,
      [transfer_quantity, sourceStock.id]
    );

    // Step 3: Check if product exists at destination
    const [destStockRows] = await db.query(
      `SELECT * FROM warehouse WHERE barcode = ? AND location_name = ?`,
      [barcode, to_location]
    );

    if (destStockRows.length > 0) {
      // If exists, increment stock
      await db.query(
        `UPDATE warehouse SET stock_quantity = stock_quantity + ? WHERE id = ?`,
        [transfer_quantity, destStockRows[0].id]
      );
    } else {
      // If not, insert new row
      await db.query(
        `INSERT INTO warehouse (product_id, product_name, barcode, location_name, stock_quantity)
         VALUES (?, ?, ?, ?, ?)`,
        [
          sourceStock.product_id,
          sourceStock.product_name,
          sourceStock.barcode,
          to_location,
          transfer_quantity,
        ]
      );
    }

    res.json({ success: true, message: "✅ Stock transferred successfully!" });
  } catch (error) {
    console.error("Error transferring stock:", error);
    res.status(500).json({
      success: false,
      message: "❌ Server error during stock transfer.",
    });
  }
};

///////////////////////////////////////////////////////////////////

