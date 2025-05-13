import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Grid,
  Card,
  CardContent,
  Avatar,
  Badge,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  ExpandMore,
  LocalShipping,
  Search,
  Inventory,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

const statusColors = {
  processing: "warning",
  completed: "success",
  cancelled: "error",
  pending: "info",
};

const OrderList = ({ storeUrl, consumerKey, consumerSecret }) => {
  const [orders, setOrders] = useState([]);
  const [stockStatuses, setStockStatuses] = useState({});
  const [search, setSearch] = useState("");
  const theme = useTheme();

  useEffect(() => {
    async function fetchOrdersAndStock() {
      try {
        const { data: orders } = await axios.post(
          "http://localhost:5000/api/woocommerce/woo/get-orders",
          {
            store_url: storeUrl,
            consumer_key: consumerKey,
            consumer_secret: consumerSecret,
          }
        );
        setOrders(orders);

        const lineItems = orders.flatMap((o) =>
          o.line_items.map((item) => ({
            sku: item.sku,
            quantity: item.quantity,
          }))
        );

        const { data: stockData } = await axios.post(
          "http://localhost:5000/api/woocommerce/woo/check-stock",
          { line_items: lineItems }
        );

        const stockMap = {};
        stockData.forEach((item) => {
          stockMap[item.sku] = item;
        });

        setStockStatuses(stockMap);
      } catch (err) {
        console.error("Error loading data", err);
      }
    }

    fetchOrdersAndStock();
  }, [storeUrl, consumerKey, consumerSecret]);

  const filteredOrders = orders.filter((order) =>
    `${order.billing.first_name} ${order.billing.last_name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🛒 Orders Dashboard
      </Typography>

      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
        <TextField
          placeholder="Search by customer name"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {filteredOrders.map((order) => {
        const fullName = `${order.billing.first_name} ${order.billing.last_name}`;
        return (
          <Accordion key={order.id} sx={{ mb: 2, borderRadius: 2 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box
                sx={{ display: "flex", flexDirection: "column", width: "100%" }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="h6">
                    Order #{order.id} — {fullName}
                  </Typography>
                  <Chip
                    label={order.status}
                    color={statusColors[order.status] || "default"}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {new Date(order.date_created).toLocaleString()} • ₹
                  {order.total}
                </Typography>
              </Box>
            </AccordionSummary>

            <AccordionDetails>
              <Card elevation={1} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📦 Products
                  </Typography>
                  <List dense>
                    {order.line_items.map((item) => {
                      const stock = stockStatuses[item.sku] || {};
                      const outOfStock = stock.current_stock < item.quantity;
                      return (
                        <React.Fragment key={item.id}>
                          <ListItem
                            secondaryAction={
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                disabled={outOfStock}
                                onClick={async () => {
                                  try {
                                    await axios.post(
                                      "http://localhost:5000/api/woocommerce/woo/ship-item",
                                      {
                                        sku: item.sku,
                                        quantity: item.quantity,
                                      }
                                    );
                                    alert("Shipped successfully!");
                                  } catch (err) {
                                    alert(
                                      err.response?.data || "Shipping failed"
                                    );
                                  }
                                }}
                                startIcon={<LocalShipping />}
                              >
                                Ship
                              </Button>
                            }
                          >
                            <ListItemText
                              primary={`${item.name} (SKU: ${
                                item.sku || "N/A"
                              }) — Qty: ${item.quantity}`}
                              secondary={
                                <Typography
                                  color={outOfStock ? "error" : "success"}
                                >
                                  Stock: {stock.current_stock ?? "?"} | Status:{" "}
                                  {stock.status ?? "?"}
                                </Typography>
                              }
                            />
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      );
                    })}
                  </List>
                </CardContent>
              </Card>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card elevation={1}>
                    <CardContent>
                      <Typography variant="h6">🧾 Billing Info</Typography>
                      <Typography>{fullName}</Typography>
                      <Typography>{order.billing.email}</Typography>
                      <Typography>{order.billing.phone}</Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card elevation={1}>
                    <CardContent>
                      <Typography variant="h6">📍 Shipping Address</Typography>
                      <Typography>
                        {order.shipping.address_1}, {order.shipping.city},<br />
                        {order.shipping.state} {order.shipping.postcode}
                        <br />
                        {order.shipping.country}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default OrderList;
