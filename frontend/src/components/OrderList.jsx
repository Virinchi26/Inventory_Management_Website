import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import { Visibility, ExpandMore, ExpandLess } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

const OrderList = ({ storeUrl, consumerKey, consumerSecret }) => {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  useEffect(() => {
    axios
      .post("http://localhost:5000/api/woocommerce/woo/get-orders", {
        store_url: storeUrl,
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
      })
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Failed to fetch orders:", err));
  }, [storeUrl, consumerKey, consumerSecret]);

  const toggleExpand = (orderId) => {
    setExpandedOrderId(orderId === expandedOrderId ? null : orderId);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
    <TableContainer component={Paper}>
      <Table aria-label="order table">
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Order</strong>
            </TableCell>
            <TableCell>
              <strong>Date</strong>
            </TableCell>
            <TableCell>
              <strong>Status</strong>
            </TableCell>
            <TableCell>
              <strong>Total</strong>
            </TableCell>
            <TableCell>
              <strong>Origin</strong>
            </TableCell>
            <TableCell align="center">
              <strong>Details</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const customerName = `${order.billing.first_name} ${order.billing.last_name}`;

            return (
              <React.Fragment key={order.id}>
                <TableRow>
                  <TableCell>
                    #{order.id} — {customerName}
                  </TableCell>
                  <TableCell>
                    {new Date(order.date_created).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>₹{order.total}</TableCell>
                  <TableCell>{order.billing.city || "N/A"}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => toggleExpand(order.id)}>
                      {isExpanded ? <ExpandLess /> : <Visibility />}
                    </IconButton>
                  </TableCell>
                </TableRow>

                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                          bgcolor: isDarkMode ? "#1e1e1e" : "#f5f5f5",
                          color: isDarkMode ? "#fff" : "#000",
                          p: 2,
                          borderRadius: 1,
                        }}
                      >
                        <Box>
                          <Typography variant="h6">Products</Typography>
                          <ul>
                            {order.line_items.map((item) => (
                              <li key={item.id}>
                                {item.name} — SKU: {item.sku || "N/A"} — Qty:{" "}
                                {item.quantity}
                              </li>
                            ))}
                          </ul>
                        </Box>

                        <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          <Box sx={{ flex: 1, minWidth: 250 }}>
                            <Typography variant="h6">Billing Info</Typography>
                            <Typography>{customerName}</Typography>
                            <Typography>
                              Email: {order.billing.email}
                            </Typography>
                            <Typography>
                              Phone: {order.billing.phone}
                            </Typography>
                          </Box>

                          <Box sx={{ flex: 1, minWidth: 250 }}>
                            <Typography variant="h6">
                              Shipping Address
                            </Typography>
                            <Typography>
                              {order.shipping.first_name}{" "}
                              {order.shipping.last_name}
                              <br />
                              {order.shipping.address_1}
                              <br />
                              {order.shipping.city}, {order.shipping.state}{" "}
                              {order.shipping.postcode}
                              <br />
                              {order.shipping.country}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
    </Box>
  );
};

export default OrderList;
