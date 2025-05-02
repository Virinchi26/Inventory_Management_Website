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

module.exports = { getOrders, saveConfig };
