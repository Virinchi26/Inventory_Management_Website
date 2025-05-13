import {
  Box,
  useTheme,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useEffect, useState } from "react";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { fetchProducts, fetchLowStockProducts } from "../../services/api";
import { getAllLocations } from "../../services/location_api";
import { getWarehouseStock } from "../../services/wearhouse_api";

import InventoryIcon from "@mui/icons-material/Inventory";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WarningIcon from "@mui/icons-material/Warning";
import StoreIcon from "@mui/icons-material/Store";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [warehouseStock, setWarehouseStock] = useState([]);

  const [prevProductsCount, setPrevProductsCount] = useState(0);
  const [prevLocationsCount, setPrevLocationsCount] = useState(0);
  const [prevLowStockCount, setPrevLowStockCount] = useState(0);

  useEffect(() => {
    const prevProducts = Number(localStorage.getItem("prevProductsCount")) || 0;
    const prevLocations =
      Number(localStorage.getItem("prevLocationsCount")) || 0;
    const prevLowStock = Number(localStorage.getItem("prevLowStockCount")) || 0;

    setPrevProductsCount(prevProducts);
    setPrevLocationsCount(prevLocations);
    setPrevLowStockCount(prevLowStock);
  }, []);

  useEffect(() => {
    localStorage.setItem("prevProductsCount", products.length);
    localStorage.setItem("prevLocationsCount", locations.length);
    localStorage.setItem("prevLowStockCount", lowStockProducts.length);
  }, [products.length, locations.length, lowStockProducts.length]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsData = await fetchProducts();
        const locationsData = await getAllLocations();
        const lowStockData = await fetchLowStockProducts();
        const warehouseData = await getWarehouseStock();

        const normalizedLocations = locationsData.map((location) => ({
          ...location,
          location_name: location.location_name.toLowerCase(),
        }));

        const normalizedWarehouseStock = warehouseData.map((stock) => ({
          ...stock,
          location_name: stock.location_name.toLowerCase(),
        }));

        setProducts(productsData);
        setLocations(normalizedLocations);
        setLowStockProducts(lowStockData);
        setWarehouseStock(normalizedWarehouseStock);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const previousStockPerLocation = [];

  const stockPerLocation = locations.map((location) => {
    const locationStock = warehouseStock.filter(
      (stock) => stock.location_name === location.location_name
    );
    const totalStock = locationStock.reduce(
      (sum, stock) => sum + stock.stock_quantity,
      0
    );

    const prev = previousStockPerLocation.find(
      (l) => l.location === location.location_name
    );
    const previousStock = prev ? prev.totalStock : 0;

    const diff = totalStock - previousStock;
    const increase = diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : "0";

    return {
      location: location.location_name,
      totalStock,
      increase,
    };
  });

  const productStockData = products.map((product) => {
    const stockByLocation = locations.map((location) => {
      const stock = warehouseStock.find(
        (item) =>
          item.product_name === product.item_name &&
          item.location_name.toLowerCase() ===
            location.location_name.toLowerCase()
      );
      return {
        location: location.location_name,
        stock: stock ? stock.stock_quantity : 0,
      };
    });
    return { productName: product.item_name, stockByLocation };
  });

  const productDiff = products.length - prevProductsCount;
  const locationDiff = locations.length - prevLocationsCount;
  const lowStockDiff = lowStockProducts.length - prevLowStockCount;

  const productIncrease =
    productDiff > 0 ? `+${productDiff}` : `${productDiff}`;
  const locationIncrease =
    locationDiff > 0 ? `+${locationDiff}` : `${locationDiff}`;
  const lowStockIncrease =
    lowStockDiff > 0 ? `+${lowStockDiff}` : `${lowStockDiff}`;

  const renderCard = (title, value, increase, IconComponent) => (
    <Card
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: 100,
        backgroundColor: colors.primary[400],
        color: colors.grey[100],
        borderRadius: 2,
        p: 2,
        boxShadow: 3,
      }}
    >
      <Box>
        <Typography variant="h4" fontWeight="bold" lineHeight={1.2}>
          {value}
        </Typography>
        <Typography variant="h5" fontWeight="medium">
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ mt: 0.5 }}
          color={colors.greenAccent[400]}
        >
          {increase} from last time
        </Typography>
      </Box>
      <IconComponent sx={{ fontSize: 32, color: colors.greenAccent[400] }} />
    </Card>
  );

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
      </Box>

      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
        gap="20px"
        mt={2}
      >
        {renderCard(
          "Total Products",
          products.length,
          productIncrease,
          InventoryIcon
        )}
        {renderCard(
          "Total Locations",
          locations.length,
          locationIncrease,
          LocationOnIcon
        )}
        {renderCard(
          "Low Stock Products",
          lowStockProducts.length,
          lowStockIncrease,
          WarningIcon
        )}

        {stockPerLocation.map((locationData) =>
          renderCard(
            `Stock at ${locationData.location}`,
            locationData.totalStock,
            locationData.increase,
            StoreIcon
          )
        )}
      </Box>

      <Box
        mt="30px"
        backgroundColor={colors.primary[400]}
        p="20px"
        borderRadius="8px"
        boxShadow={2}
      >
        <Header
          title="Product Stock by Location"
          subtitle="Detailed stock data for each product"
        />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ fontWeight: "bold", color: colors.greenAccent[400] }}
              >
                Product Name
              </TableCell>
              {locations.map((location, index) => (
                <TableCell
                  key={index}
                  sx={{ fontWeight: "bold", color: colors.greenAccent[400] }}
                >
                  {location.location_name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {productStockData.map((product, index) => (
              <TableRow key={index}>
                <TableCell>{product.productName}</TableCell>
                {product.stockByLocation.map((stock, idx) => (
                  <TableCell key={idx}>{stock.stock}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

export default Dashboard;
