const pool = require("../db");
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const getOrders = async (req, res) => {
  const { store_url, consumer_key, consumer_secret } = req.body;

  try {
    const api = new WooCommerceRestApi({
      url: store_url,
      consumerKey: consumer_key,
      consumerSecret: consumer_secret,
      version: "wc/v3",
    });

    const { data } = await api.get("orders");
    res.json(data);
  } catch (err) {
    console.error("WooCommerce API Error:", err.message);
    res.status(500).send("Error fetching orders");
  }
};

const saveConfig = async (req, res) => {
  const { store_url, consumer_key, consumer_secret } = req.body;

  try {
    await pool.query(
      "INSERT INTO woo_configs (store_url, consumer_key, consumer_secret) VALUES (?, ?, ?)",
      [store_url, consumer_key, consumer_secret]
    );
    res.status(201).send("WooCommerce config saved");
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).send("Failed to save config");
  }
};
const checkOrderStockAndStatus = async (req, res) => {
  const { line_items } = req.body; // Expecting: [{ sku: 'abc123', quantity: 2 }, ...]

  try {
    const results = await Promise.all(
      line_items.map(async (item) => {
        const [rows] = await pool.query(
          "SELECT opening_stock FROM products WHERE sku = ?",
          [item.sku]
        );

        if (rows.length === 0) {
          return {
            ...item,
            status: "Out of Stock",
            current_stock: 0,
          };
        }

        const currentStock = rows[0].opening_stock;
        let status = "In Stock (Sufficient)";
        if (currentStock === 0) status = "Out of Stock";
        else if (currentStock < item.quantity)
          status = "In Stock (Insufficient)";

        return {
          ...item,
          current_stock: currentStock,
          status,
        };
      })
    );

    res.json(results);
  } catch (err) {
    console.error("Stock check error:", err.message);
    res.status(500).send("Error checking stock");
  }
};

const shipOrderItem = async (req, res) => {
  const { sku, quantity } = req.body;

  try {
    const [[product]] = await pool.query(
      "SELECT opening_stock FROM products WHERE sku = ?",
      [sku]
    );

    if (!product) return res.status(404).send("Product not found");

    if (product.opening_stock < quantity) {
      return res.status(400).send("Insufficient stock");
    }

    const newStock = product.opening_stock - quantity;

    await pool.query("UPDATE products SET opening_stock = ? WHERE sku = ?", [
      newStock,
      sku,
    ]);

    res.send("Shipped");
  } catch (err) {
    console.error("Ship error:", err.message);
    res.status(500).send("Error processing shipment");
  }
};


module.exports = {
  getOrders,
  saveConfig,
  checkOrderStockAndStatus,
  shipOrderItem,
};
