require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const warehouseRoutes = require("./routes/warehouseRoutes");
const locationRoutes = require("./routes/locationRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/products", productRoutes);
app.use("/api/warehouse", warehouseRoutes);
app.use("/api/locations", locationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
