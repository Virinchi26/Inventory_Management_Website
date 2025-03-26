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
    res.status(200).json(lowStockProducts);
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

exports.importProducts = async (req, res) => {
  try {
    const products = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ error: "Invalid file format or empty data" });
    }

    // ✅ Check if table is empty
    const [rowCount] = await db.query("SELECT COUNT(*) AS count FROM products");

    if (rowCount[0].count === 0) {
      // ✅ Reset AUTO_INCREMENT to 1
      await db.query("ALTER TABLE products AUTO_INCREMENT = 1");
    }

    let invalidProducts = [];

    for (const product of products) {
      let {
        item_name,
        category_name,
        sku,
        hsn,
        unit_name,
        alert_quantity,
        brand_name,
        lot_number,
        expire_date,
        regular_price,
        purchase_price,
        tax_name,
        tax_value,
        tax_type,
        sales_price,
        opening_stock,
        barcode,
        discount_type,
        discount,
      } = product;

      // ✅ Convert Expire Date to "YYYY-MM-DD"
      let formattedExpireDate = null;
      if (expire_date) {
        const excelDate = Number(expire_date);
        if (!isNaN(excelDate)) {
          formattedExpireDate = new Date((excelDate - 25569) * 86400 * 1000)
            .toISOString()
            .split("T")[0];
        } else if (
          new Date(expire_date) instanceof Date &&
          !isNaN(new Date(expire_date))
        ) {
          formattedExpireDate = new Date(expire_date)
            .toISOString()
            .split("T")[0];
        }
      }

      // ✅ Check if `sales_price` is greater than `regular_price`
      if (sales_price > regular_price) {
        invalidProducts.push({
          item_name,
          sku,
          message: "Sales price cannot be greater than regular price.",
        });
        continue; // Skip this product and move to the next one
      }

      // ✅ Check if the product exists by SKU or Barcode
      const [existingProduct] = await db.execute(
        "SELECT * FROM products WHERE sku = ? OR barcode = ?",
        [sku, barcode]
      );

      if (existingProduct.length > 0) {
        const existingData = existingProduct[0]; // Get existing values

        // ✅ If product exists, update it (only change non-null fields)
        await db.execute(
          `UPDATE products 
           SET item_name = ?, category_name = ?, hsn = ?, unit_name = ?, alert_quantity = ?, brand_name = ?, 
               lot_number = ?, expire_date = ?, regular_price = ?, purchase_price = ?, tax_name = ?, tax_value = ?, tax_type = ?, 
               sales_price = ?, opening_stock = ?, discount_type = ?, discount = ? 
           WHERE sku = ? OR barcode = ?`,
          [
            item_name !== null && item_name !== ""
              ? item_name
              : existingData.item_name,
            category_name !== null && category_name !== ""
              ? category_name
              : existingData.category_name,
            hsn !== null && hsn !== "" ? hsn : existingData.hsn,
            unit_name !== null && unit_name !== ""
              ? unit_name
              : existingData.unit_name,
            alert_quantity !== null && alert_quantity !== ""
              ? alert_quantity
              : existingData.alert_quantity,
            brand_name !== null && brand_name !== ""
              ? brand_name
              : existingData.brand_name,
            lot_number !== null && lot_number !== ""
              ? lot_number
              : existingData.lot_number,
            formattedExpireDate !== null && formattedExpireDate !== ""
              ? formattedExpireDate
              : existingData.expire_date,
            regular_price !== null && regular_price !== ""
              ? regular_price
              : existingData.regular_price,
            purchase_price !== null && purchase_price !== ""
              ? purchase_price
              : existingData.purchase_price,
            tax_name !== null && tax_name !== ""
              ? tax_name
              : existingData.tax_name,
            tax_value !== null && tax_value !== ""
              ? tax_value
              : existingData.tax_value,
            tax_type !== null && tax_type !== ""
              ? tax_type
              : existingData.tax_type,
            sales_price !== null && sales_price !== ""
              ? sales_price
              : existingData.sales_price,
            opening_stock !== null && opening_stock !== ""
              ? opening_stock
              : existingData.opening_stock,
            discount_type !== null && discount_type !== ""
              ? discount_type
              : existingData.discount_type,
            discount !== null && discount !== ""
              ? discount
              : existingData.discount,
            sku,
            barcode,
          ]
        );
        console.log(`✅ Updated existing product: ${item_name}`);
      } else {
        // ✅ If product does not exist, insert a new record
        await db.execute(
          `INSERT INTO products (item_name, category_name, sku, hsn, unit_name, alert_quantity, brand_name, 
          lot_number, expire_date, regular_price, purchase_price, tax_name, tax_value, tax_type, sales_price, opening_stock, 
          barcode, discount_type, discount) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item_name,
            category_name,
            sku,
            hsn,
            unit_name,
            alert_quantity,
            brand_name,
            lot_number,
            formattedExpireDate,
            regular_price,
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
        console.log(`✅ Added new product: ${item_name}`);
      }
    }

    // ✅ Send response with skipped products
    res.status(200).json({
      message: "Products imported successfully!",
      skipped_products: invalidProducts.length > 0 ? invalidProducts : null,
    });
  } catch (error) {
    console.error("❌ Error importing products:", error);
    res.status(500).json({ error: "Internal server error" });
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
      regular_price,
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
      "INSERT INTO products (item_name, category_name, sku, hsn, unit_name, alert_quantity, brand_name, lot_number, expire_date,regular_price, purchase_price, tax_name, tax_value, tax_type, sales_price, opening_stock, barcode, discount_type, discount) VALUES (?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
        regular_price,
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
      regular_price,
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
      "UPDATE products SET item_name=?, category_name=?, sku=?, hsn=?, unit_name=?, alert_quantity=?, brand_name=?, lot_number=?, expire_date=?,regular_price=?, purchase_price=?, tax_name=?, tax_value=?, tax_type=?, sales_price=?, opening_stock=?, barcode=?, discount_type=?, discount=? WHERE id=?",
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
        regular_price,
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
