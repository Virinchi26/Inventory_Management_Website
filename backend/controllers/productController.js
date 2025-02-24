const { v4: uuidv4 } = require("uuid"); // Import UUID generator
const db = require("../db");

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLowStockProducts = async (req, res) => {
  try {
    // Fetch products where opening_stock is less than alert_quantity
    const [lowStockProducts] = await db.query(
      "SELECT * FROM products WHERE opening_stock < alert_quantity"
    );

    // If query executes but returns empty, respond properly
    if (lowStockProducts.length === 0) {
      return res
        .status(200)
        .json({ message: "All products have sufficient stock" });
    }

    // Return the low-stock products
    res.status(200).json({ lowStockProducts });
  } catch (error) {
    console.error("Database Error:", error); // Log for debugging
    res.status(500).json({ error: "Server error: " + error.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ message: "Product not found" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const {
      item_name,
      category_name,
      sku,
      hsn,
      unit_name,
      alert_quantity,
      brand_name,
      lot_number,
      expire_date,
      purchase_price,
      tax_name,
      tax_value,
      tax_type,
      sales_price,
      opening_stock,
      barcode,
      discount_type,
      discount,
    } = req.body;

    // Check for duplicate SKU/Barcode
    const [existing] = await db.query(
      "SELECT * FROM products WHERE sku = ? OR barcode = ?",
      [sku, barcode]
    );
    if (existing.length > 0) {
      return res.status(400).json({
        message: "Product with the same SKU or Barcode already exists",
      });
    }

    // Insert product
    const result = await db.query(
      "INSERT INTO products (item_name, category_name, sku, hsn, unit_name, alert_quantity, brand_name, lot_number, expire_date, purchase_price, tax_name, tax_value, tax_type, sales_price, opening_stock, barcode, discount_type, discount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        item_name,
        category_name,
        sku,
        hsn,
        unit_name,
        alert_quantity,
        brand_name,
        lot_number,
        expire_date,
        purchase_price,
        tax_name,
        tax_value,
        tax_type,
        sales_price,
        opening_stock,
        barcode,
        discount_type,
        discount,
      ]
    );

    // Check if stock is below alert level
    if (opening_stock < alert_quantity) {
      console.warn(
        `⚠️ Warning: Stock for ${item_name} (SKU: ${sku}) is below alert level!`
      );
    }

    res.status(201).json({
      message: "Product added successfully",
      productId: result[0].insertId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update product (ensure uniqueness for SKU and Barcode)
exports.updateProduct = async (req, res) => {
  try {
    const {
      item_name,
      category_name,
      sku,
      hsn,
      unit_name,
      alert_quantity,
      brand_name,
      lot_number,
      expire_date,
      purchase_price,
      tax_name,
      tax_value,
      tax_type,
      sales_price,
      opening_stock,
      barcode,
      discount_type,
      discount,
    } = req.body;
    const { id } = req.params;

    // Check if product exists
    const [existing] = await db.query("SELECT * FROM products WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0)
      return res.status(404).json({ message: "Product not found" });

    // Ensure SKU/Barcode are unique (excluding the current product)
    const [duplicates] = await db.query(
      "SELECT * FROM products WHERE (sku = ? OR barcode = ?) AND id <> ?",
      [sku, barcode, id]
    );

    if (duplicates.length > 0) {
      return res
        .status(400)
        .json({ message: "SKU or Barcode already exists for another product" });
    }

    await db.query(
      "UPDATE products SET item_name=?, category_name=?, sku=?, hsn=?, unit_name=?, alert_quantity=?, brand_name=?, lot_number=?, expire_date=?, purchase_price=?, tax_name=?, tax_value=?, tax_type=?, sales_price=?, opening_stock=?, barcode=?, discount_type=?, discount=? WHERE id=?",
      [
        item_name,
        category_name,
        sku,
        hsn,
        unit_name,
        alert_quantity,
        brand_name,
        lot_number,
        expire_date,
        purchase_price,
        tax_name,
        tax_value,
        tax_type,
        sales_price,
        opening_stock,
        barcode,
        discount_type,
        discount,
        id,
      ]
    );

    res.json({ message: "Product updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const [existing] = await db.query("SELECT * FROM products WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0)
      return res.status(404).json({ message: "Product not found" });

    await db.query("DELETE FROM products WHERE id = ?", [id]);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
