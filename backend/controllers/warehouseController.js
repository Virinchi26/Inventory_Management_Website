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
        // ✅ Extract only necessary columns
        const product_id = row["id"];
        const product_name = row["item_name"];
        const barcode = row["barcode"];

        // ❌ Skip rows that don't have required data
        if (!product_id || !product_name || !barcode) continue;

        // ✅ Check if the product exists in the `products` table
        const [existingProducts] = await db.query(
          "SELECT * FROM products WHERE id = ? AND barcode = ?",
          [product_id, barcode]
        );

        if (existingProducts.length > 0) {
          // ✅ Check if the product is already in the warehouse at the given location
          const [existingStock] = await db.query(
            `SELECT * FROM warehouse WHERE product_id = ? AND location_name = ?`,
            [product_id, location_name]
          );

          if (existingStock.length > 0) {
            // 🔄 Update stock quantity if product already exists in warehouse
            await db.query(
              `UPDATE warehouse
               SET stock_quantity = stock_quantity + 1 
               WHERE product_id = ? AND location_name = ?`,
              [product_id, location_name]
            );
          } else {
            // ➕ Insert new entry if product is not in warehouse
            await db.query(
              `INSERT INTO warehouse (product_id, product_name, barcode, location_name, stock_quantity) 
               VALUES (?, ?, ?, ?, 1)`,
              [product_id, product_name, barcode, location_name]
            );
          }
        } else {
          notAddedProducts.push({ product_id, product_name, barcode }); // Track products not found
        }
      }

      // ✅ Send response with products that were not added
      if (notAddedProducts.length > 0) {
        return res.json({
          message: "Some products were not added.",
          notAddedProducts,
        });
      } else {
        return res.json({ message: "All products added successfully!" });
      }
    } catch (error) {
      console.error("Error processing file:", error);
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
  const { barcode, from_location, to_location } = req.body;

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

    // // ✅ Check if enough stock is available at `from_location`
    // const [sourceStock] = await db.query(
    //   `SELECT stock_quantity FROM warehouse WHERE product_id = ? AND barcode = ? AND LOWER(location_name) = LOWER(?)`,
    //   [product_id, barcode, fromLocation]
    // );

    // if (
    //   sourceStock.length === 0 ||
    //   sourceStock[0].stock_quantity < transfer_quantity
    // ) {
    //   return res
    //     .status(400)
    //     .json({ message: "❌ Not enough stock at source location!" });
    // }

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

///////////////////////////////////////////////////////////////////
