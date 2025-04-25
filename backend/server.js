require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const warehouseRoutes = require("./routes/warehouseRoutes");
const locationRoutes = require("./routes/locationRoutes");
const stockAudit = require("./routes/stockAuditRoutes"); // Import stock audit route
const authRoutes = require("./routes/authRoutes");
const pointOfSaleRoutes = require("./routes/pointOfSaleRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/products", productRoutes);
app.use("/api/warehouse", warehouseRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/stock", stockAudit); // Add stock audit route
app.use("/api/auth", authRoutes);
app.use("/api/pointOfSale", pointOfSaleRoutes); // Add point of sale route

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
