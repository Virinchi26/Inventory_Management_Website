import { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Divider,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Chip from "@mui/material/Chip";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import StoreIcon from "@mui/icons-material/Store";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentIcon from "@mui/icons-material/Payment";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PrintIcon from "@mui/icons-material/Print";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import {
  getRemainingStock,
  insertSale,
  insertSaleItems,
} from "../../services/point_of_sale_api";

const POSPage = () => {
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [cart, setCart] = useState([]);
  const [mode, setMode] = useState("on-site");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showDropdown, setShowDropdown] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const fetchStock = async () => {
      const res = await getRemainingStock();
      if (res.success) setProducts(res.data);
    };
    fetchStock();
  }, []);

  const filteredProducts = searchText
    ? products.filter(
        (item) =>
          item.item_name.toLowerCase().includes(searchText.toLowerCase()) ||
          item.barcode.includes(searchText)
      )
    : products;

  const handleAddToCart = (product) => {
    const existing = cart.find((i) => i.productId === product.id);
    const basePrice = parseFloat(product.sales_price);
    const taxPercent = product.tax || 0;

    // Use existing discount if product already in cart
    const discountPercent = existing
      ? existing.discount
      : product.discount || 0;

    const finalPrice =
      basePrice +
      (basePrice * taxPercent) / 100 -
      (basePrice * discountPercent) / 100;

    if (existing) {
      // Update the cart when the item is already in the cart
      setCart((prev) =>
        prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * finalPrice,
              }
            : item
        )
      );
    } else {
      // Add new item to the cart
      setCart((prev) => [
        ...prev,
        {
          productId: product.id,
          item_name: product.item_name,
          barcode: product.barcode,
          quantity: 1,
          salePrice: basePrice,
          discount: discountPercent,
          tax: taxPercent,
          subtotal: finalPrice,
        },
      ]);
    }

    setSearchText(""); // Clear the search field
    setShowDropdown(false); // Hide the dropdown
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setQuantity(item.quantity);
    setDiscount(item.discount);
    setEditDialogOpen(true);
  };

  const clearCart = () => {
    setCart([]);
    setSearchText("");
    setShowDropdown(false);
    setCustomerName("");
    setCustomerPhone("");
    setPaymentMethod("cash");
    setMode("on-site");
    setInvoiceDialogOpen(false);
    setEditingItem(null);
    setEditDialogOpen(false);
    setQuantity(1);
    setDiscount(0);
    setCartItems([]);
  };

  const handleSaveEdit = () => {
    const basePrice = editingItem.salePrice;
    const taxPercent = editingItem.tax || 0;
    const finalPrice =
      basePrice + (basePrice * taxPercent) / 100 - (basePrice * discount) / 100;

    setCart((prev) =>
      prev.map((item) =>
        item.productId === editingItem.productId
          ? {
              ...item,
              quantity,
              discount,
              subtotal: quantity * finalPrice,
            }
          : item
      )
    );
    setEditDialogOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const saveSaleToDB = async () => {
    try {
      const saleRes = await insertSale({
        customerName: customerName.trim() || "N/A",
        customerPhone:
          (mode === "delivery" ? customerPhone.trim() : "") || "N/A",
        totalAmount,
        paymentMethod,
      });

      if (saleRes.success && saleRes.saleId) {
        await insertSaleItems(saleRes.saleId, cart);
        return true; // sale saved successfully
      } else {
        alert("Failed to save sale.");
        return false;
      }
    } catch (err) {
      console.error(err);
      alert("Error saving sale.");
      return false;
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSubmit = () => {
    if (cart.length === 0) return alert("Cart is empty.");
    if (mode === "delivery" && customerPhone.length !== 10) {
      return alert("Phone number must be 10 digits.");
    }
    setInvoiceDialogOpen(true); // show invoice options
  };

  const generatePDFInvoice = () => {
    const invoiceHTML = `
    <html>
      <head>
        <title>Invoice</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f4f4f4; }
        </style>
      </head>
      <body>
        <h2>🧾 Invoice</h2>
        <p>Date: ${new Date().toLocaleString()}</p>
        <p>Customer: ${customerName || "N/A"}</p>
        <p>Phone: ${customerPhone || "N/A"}</p>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Barcode</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Tax</th>
              <th>Discount</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${cart
              .map(
                (item) => `
              <tr>
                <td>${item.item_name}</td>
                <td>${item.barcode}</td>
                <td>${item.quantity}</td>
                <td>₹${item.salePrice.toFixed(2)}</td>
                <td>${item.tax}%</td>
                <td>${item.discount}%</td>
                <td>₹${item.subtotal.toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
            <tr>
              <td colspan="6" style="text-align:right; font-weight:bold;">Total:</td>
              <td style="font-weight:bold;">₹${totalAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        <p>Payment Method: ${paymentMethod}</p>
      </body>
    </html>
  `;

    const invoiceWindow = window.open("", "_blank", "width=800,height=600");
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
    invoiceWindow.focus();
    invoiceWindow.print();
    invoiceWindow.close();
  };

  const generateThermalInvoice = () => {
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    const taxAmount = cart.reduce((sum, item) => {
      const tax = (item.salePrice * item.tax) / 100;
      return sum + tax * item.quantity;
    }, 0);

    const line = "----------------------------";

    const printContent =
      `Customer: ${customerName || "N/A"}\n` +
      `Phone   : ${customerPhone || "N/A"}\n\n` +
      `Payment Method: ${paymentMethod}\n` +
      `${line}\n` +
      `Item       Qty  Price  Amt\n` +
      `${line}\n` +
      cart
        .map((item) => {
          const name =
            item.item_name.length > 10
              ? item.item_name.slice(0, 10)
              : item.item_name;
          const amt = item.subtotal.toFixed(2);
          return `${name.padEnd(10)} ${String(item.quantity).padStart(
            3
          )}  ₹${item.salePrice.toFixed(2).padStart(5)} ₹${amt.padStart(6)}`;
        })
        .join("\n") +
      `\n${line}\n` +
      `Subtotal   : ${totalQty} items\n` +
      `Amount     : ₹${totalAmount.toFixed(2)}\n` +
      `${line}\n` +
      `Tax Total  : ₹${taxAmount.toFixed(2)}\n` +
      `${line}\n` +
      `Total Amt  : ₹${(totalAmount + taxAmount).toFixed(2)}\n` +
      `${line}\n\n` +
      `Thank you for shopping!`;

    const style = `
    <style>
      @media print {
        body {
          width: 58mm;
          margin: 0;
          font-family: monospace;
          font-size: 12px;
        }
        pre {
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      }
      body {
        margin: 0;
        padding: 10px;
        font-family: monospace;
        font-size: 12px;
        width: 58mm;
      }
    </style>
  `;

    const html = `
    <html>
      <head>
        <title>Thermal Invoice</title>
        ${style}
      </head>
      <body>
        <pre>${printContent}</pre>
      </body>
    </html>
  `;

    const printWindow = window.open("", "_blank", "width=300,height=600");
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 4,
        padding: 5,
        // background: isDarkMode
        //   ? "linear-gradient(145deg, #121212, #1e1e1e)"
        //   : "linear-gradient(145deg, #f0f4f8, #e8f0f8)",
        minHeight: "100vh",
      }}
    >
      {/* Left Panel */}
      <Paper
        elevation={6}
        sx={{
          flex: "1 1 60%",
          minWidth: "340px",
          padding: 4,
          borderRadius: "16px",
          bgcolor: theme.palette.background.paper,
          transition: "all 0.3s ease",
          boxShadow: isDarkMode
            ? "0 8px 32px rgba(0, 0, 0, 0.3)"
            : "0 8px 32px rgba(0, 105, 217, 0.08)",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: isDarkMode
              ? "0 12px 40px rgba(0, 0, 0, 0.4)"
              : "0 12px 40px rgba(0, 105, 217, 0.12)",
          },
        }}
        className="fade-in"
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: isDarkMode ? "#fff" : "#1a2138",
            display: "flex",
            alignItems: "center",
            mb: 3,
            "& svg": {
              mr: 1,
              color: isDarkMode ? "#fff" : "#1a2138",
            },
          }}
        >
          <SearchIcon fontSize="large" /> Search Product
        </Typography>

        <TextField
          fullWidth
          value={searchText}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search by name or barcode"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color={isDarkMode ? "white" : "primary"} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              bgcolor: isDarkMode
                ? "rgba(66, 66, 66, 0.8)"
                : "rgba(255, 255, 255, 0.9)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              "&:hover fieldset": { borderColor: theme.palette.primary.main },
              "&.Mui-focused fieldset": {
                borderWidth: 2,
                borderColor: theme.palette.primary.main,
              },
            },
          }}
        />

        {showDropdown && (
          <Paper
            elevation={3}
            sx={{
              maxHeight: "250px",
              overflowY: "auto",
              borderRadius: "12px",
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.default,
              mt: 1,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              zIndex: 10,
              position: "relative",
            }}
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Box
                  key={product.id}
                  onMouseDown={() => handleAddToCart(product)}
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    transition: "background 0.2s ease",
                    "&:hover": {
                      bgcolor: isDarkMode
                        ? "rgba(80, 80, 80, 0.5)"
                        : "rgba(33, 150, 243, 0.08)",
                    },
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    "&:last-child": {
                      borderBottom: "none",
                    },
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {product.item_name}{" "}
                    <span
                      style={{
                        color: isDarkMode ? "#aaa" : "#666",
                        fontSize: "0.85em",
                      }}
                    >
                      ({product.barcode})
                    </span>
                  </Typography>
                </Box>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  No products found
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        <Divider
          sx={{
            my: 4,
            borderColor: isDarkMode
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.08)",
            "&::before, &::after": {
              borderColor: isDarkMode
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.08)",
            },
          }}
        >
          <Chip
            label="Cart Items"
            color={isDarkMode ? "white" : "primary"}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Divider>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: isDarkMode ? "#fff" : "#1a2138",
            display: "flex",
            alignItems: "center",
            mb: 3,
            "& svg": {
              mr: 1,
              color: isDarkMode ? "white" : theme.palette.primary.main,
            },
          }}
        >
          <ShoppingCartIcon fontSize="large" /> Cart{" "}
          {cart.length > 0 && (
            <Chip
              label={cart.length}
              color={isDarkMode ? "white" : "black"}
              size="small"
              sx={{
                ml: 1,
                fontWeight: "bold",
                animation: cart.length > 0 ? "pulse 1.5s infinite" : "none",
                "@keyframes pulse": {
                  "0%": { transform: "scale(1)" },
                  "50%": { transform: "scale(1.1)" },
                  "100%": { transform: "scale(1)" },
                },
              }}
            />
          )}
        </Typography>

        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            mt: 2,
            borderRadius: "12px",
            bgcolor: isDarkMode ? "rgba(42, 42, 42, 0.8)" : "#fff",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: isDarkMode
                    ? theme.palette.primary.dark
                    : theme.palette.primary.light,
                }}
              >
                {[
                  "Product",
                  "Barcode",
                  "Qty",
                  "Price",
                  "Tax",
                  "Discount",
                  "Subtotal",
                  "Action",
                ].map((head) => (
                  <TableCell
                    key={head}
                    sx={{
                      fontWeight: 700,
                      color: isDarkMode ? "#fff" : "white",
                      py: 1.5,
                    }}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {cart.length > 0 ? (
                <>
                  {cart.map((item, index) => (
                    <TableRow
                      key={item.productId}
                      sx={{
                        bgcolor:
                          index % 2 === 0
                            ? isDarkMode
                              ? "rgba(50, 50, 50, 0.4)"
                              : "rgba(240, 247, 255, 0.5)"
                            : isDarkMode
                            ? "rgba(40, 40, 40, 0.2)"
                            : "rgba(248, 250, 252, 0.5)",
                        "&:hover": {
                          bgcolor: isDarkMode
                            ? "rgba(60, 60, 60, 0.6)"
                            : "rgba(230, 242, 255, 0.7)",
                          transition: "background-color 0.2s ease",
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          color: isDarkMode ? "#fff" : "#333",
                          fontWeight: 500,
                        }}
                      >
                        {item.item_name}
                      </TableCell>
                      <TableCell sx={{ color: isDarkMode ? "#ccc" : "#666" }}>
                        {item.barcode}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: isDarkMode ? "#fff" : "#333",
                          fontWeight: 500,
                        }}
                      >
                        {item.quantity}
                      </TableCell>
                      <TableCell sx={{ color: isDarkMode ? "#fff" : "#333" }}>
                        ₹{item.salePrice}
                      </TableCell>
                      <TableCell sx={{ color: isDarkMode ? "#fff" : "#333" }}>
                        {item.tax}%
                      </TableCell>
                      <TableCell sx={{ color: isDarkMode ? "#fff" : "#333" }}>
                        {item.discount}%
                      </TableCell>
                      <TableCell
                        sx={{
                          color: isDarkMode ? "#fff" : "#333",
                          fontWeight: 600,
                        }}
                      >
                        ₹{item.subtotal.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleEditItem(item)}
                          size="small"
                          sx={{
                            color: theme.palette.primary.main,
                            "&:hover": {
                              bgcolor: isDarkMode
                                ? "rgba(30, 136, 229, 0.2)"
                                : "rgba(33, 150, 243, 0.1)",
                              transform: "scale(1.1)",
                            },
                            transition: "all 0.2s ease",
                            mr: 1,
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteItem(item.productId)}
                          size="small"
                          sx={{
                            color: theme.palette.error.main,
                            "&:hover": {
                              bgcolor: isDarkMode
                                ? "rgba(229, 57, 53, 0.2)"
                                : "rgba(244, 67, 54, 0.1)",
                              transform: "scale(1.1)",
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow
                    sx={{
                      bgcolor: isDarkMode
                        ? "rgba(25, 118, 210, 0.15)"
                        : "rgba(33, 150, 243, 0.08)",
                    }}
                  >
                    <TableCell
                      colSpan={6}
                      align="right"
                      sx={{
                        fontWeight: 700,
                        color: isDarkMode ? "#fff" : "#1a2138",
                        fontSize: "1.05rem",
                      }}
                    >
                      Total:
                    </TableCell>
                    <TableCell
                      colSpan={2}
                      sx={{
                        fontWeight: 700,
                        color: isDarkMode ? "#fff" : "#1a2138",
                        fontSize: "1.05rem",
                      }}
                    >
                      ₹{totalAmount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: "center", py: 4 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        opacity: 0.7,
                      }}
                    >
                      <ShoppingCartIcon
                        sx={{
                          fontSize: 48,
                          color: theme.palette.text.secondary,
                          mb: 1,
                        }}
                      />
                      <Typography color="text.secondary">
                        Cart is empty
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Search products above to add them to cart
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit Item Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "16px",
            bgcolor: isDarkMode ? "#2a2a2a" : "#fff",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: isDarkMode ? "#fff" : "#1a2138",
            textAlign: "center",
            py: 3,
            bgcolor: isDarkMode
              ? "rgba(30, 136, 229, 0.1)"
              : "rgba(33, 150, 243, 0.05)",
          }}
        >
          Edit Cart Item
        </DialogTitle>
        <DialogContent sx={{ py: 3, px: 3, overflow: "visible" }}>
          <Stack spacing={3}>
            <TextField
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              fullWidth
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Discount (%)"
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
              fullWidth
              inputProps={{ min: 0, max: 100 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setEditDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: "10px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            sx={{
              borderRadius: "10px",
              fontWeight: 600,
              background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              "&:hover": {
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {/* Right Panel */}
      <Paper
        elevation={6}
        sx={{
          flex: "1 1 35%",
          minWidth: "300px",
          padding: 4,
          borderRadius: "16px",
          bgcolor: theme.palette.background.paper,
          transition: "all 0.3s ease",
          boxShadow: isDarkMode
            ? "0 8px 32px rgba(0, 0, 0, 0.3)"
            : "0 8px 32px rgba(0, 105, 217, 0.08)",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: isDarkMode
              ? "0 12px 40px rgba(0, 0, 0, 0.4)"
              : "0 12px 40px rgba(0, 105, 217, 0.12)",
          },
        }}
        className="fade-in"
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: isDarkMode ? "#fff" : "#1a2138",
            display: "flex",
            alignItems: "center",
            mb: 3,
            "& svg": {
              mr: 1,
              color: isDarkMode ? "white" : theme.palette.primary.main,
            },
          }}
        >
          <PersonIcon fontSize="large" /> Customer Info
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 3,
            borderRadius: "12px",
            bgcolor: isDarkMode
              ? "rgba(66, 66, 66, 0.4)"
              : "rgba(245, 250, 255, 0.8)",
            border: `1px solid ${
              isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"
            }`,
          }}
        >
          <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 1 }}>
            <FormControlLabel
              control={
                <Radio
                  checked={mode === "on-site"}
                  onChange={() => setMode("on-site")}
                  sx={{
                    color: isDarkMode ? "white" : theme.palette.primary.main,
                    "&.Mui-checked": {
                      color: isDarkMode ? "white" : theme.palette.primary.main,
                    },
                  }}
                />
              }
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <StoreIcon
                    fontSize="small"
                    color={isDarkMode ? "white" : "black"}
                  />
                  <Typography sx={{ fontWeight: 500 }}>On-Site</Typography>
                </Stack>
              }
            />
            <FormControlLabel
              control={
                <Radio
                  checked={mode === "delivery"}
                  onChange={() => setMode("delivery")}
                  sx={{
                    color: isDarkMode ? "white" : theme.palette.primary.main,
                    "&.Mui-checked": {
                      color: isDarkMode ? "white" : theme.palette.primary.main,
                    },
                  }}
                />
              }
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <LocalShippingIcon
                    fontSize="small"
                    color={isDarkMode ? "white" : "black"}
                  />
                  <Typography sx={{ fontWeight: 500 }}>Delivery</Typography>
                </Stack>
              }
            />
          </Stack>
        </Paper>

        <TextField
          label="Customer Name"
          fullWidth
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon
                  color={isDarkMode ? "white" : theme.palette.primary.main}
                />
              </InputAdornment>
            ),
          }}
          sx={{
            mt: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              bgcolor: isDarkMode
                ? "rgba(66, 66, 66, 0.8)"
                : "rgba(255, 255, 255, 0.9)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              "&:hover fieldset": { borderColor: theme.palette.primary.main },
              "&.Mui-focused fieldset": {
                borderWidth: 2,
                borderColor: theme.palette.primary.main,
              },
            },
          }}
        />

        <TextField
          label={
            mode === "delivery"
              ? "Phone Number (Required)"
              : "Phone Number (Optional)"
          }
          fullWidth
          value={customerPhone}
          onChange={(e) =>
            setCustomerPhone(e.target.value.replace(/[^0-9]/g, ""))
          }
          inputProps={{ maxLength: 10 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneIcon
                  color={isDarkMode ? "white" : theme.palette.primary.main}
                />
              </InputAdornment>
            ),
          }}
          sx={{
            mt: 3,
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              bgcolor: isDarkMode
                ? "rgba(66, 66, 66, 0.8)"
                : "rgba(255, 255, 255, 0.9)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              "&:hover fieldset": { borderColor: theme.palette.primary.main },
              "&.Mui-focused fieldset": {
                borderWidth: 2,
                borderColor: theme.palette.primary.main,
              },
            },
          }}
        />

        <Divider
          sx={{
            my: 4,
            borderColor: isDarkMode
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.08)",
            "&::before, &::after": {
              borderColor: isDarkMode
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.08)",
            },
          }}
        >
          <Chip
            label="Payment"
            color={isDarkMode ? "white" : "primary"}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Divider>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: isDarkMode ? "#fff" : "#1a2138",
            display: "flex",
            alignItems: "center",
            mb: 3,
            "& svg": {
              mr: 1,
              color: isDarkMode ? "white" : theme.palette.primary.main,
            },
          }}
        >
          <PaymentIcon fontSize="large" /> Payment Method
        </Typography>

        <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
          <InputLabel
            id="payment-method-label"
            color={isDarkMode ? "white" : theme.palette.primary.main}
          >
            Select Payment Method
          </InputLabel>
          <Select
            labelId="payment-method-label"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            label="Select Payment Method"
            sx={{
              borderRadius: "12px",
              bgcolor: isDarkMode
                ? "rgba(66, 66, 66, 0.8)"
                : "rgba(255, 255, 255, 0.9)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: isDarkMode
                  ? "rgba(255,255,255,0.15)"
                  : "rgba(0,0,0,0.1)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.primary.main,
              },
            }}
          >
            <MenuItem value="cash">
              <Stack direction="row" alignItems="center" spacing={1}>
                <MonetizationOnIcon
                  color={isDarkMode ? "white" : theme.palette.primary.main}
                />
                <Typography>Cash</Typography>
              </Stack>
            </MenuItem>
            <MenuItem value="credit">
              <Stack direction="row" alignItems="center" spacing={1}>
                <CreditCardIcon
                  color={isDarkMode ? "white" : theme.palette.primary.main}
                />
                <Typography>Credit Card</Typography>
              </Stack>
            </MenuItem>
            <MenuItem value="multiple">
              <Stack direction="row" alignItems="center" spacing={1}>
                <AccountBalanceWalletIcon
                  color={isDarkMode ? "white" : theme.palette.primary.main}
                />
                <Typography>Multiple Methods</Typography>
              </Stack>
            </MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          fullWidth
          startIcon={<PrintIcon />}
          sx={{
            mt: 4,
            py: 1.5,
            borderRadius: "12px",
            textTransform: "none",
            fontSize: "1.1rem",
            fontWeight: 600,
            background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
            boxShadow: `0 4px 20px ${
              isDarkMode ? "rgba(30, 136, 229, 0.4)" : "rgba(33, 150, 243, 0.3)"
            }`,
            "&:hover": {
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              transform: "translateY(-3px)",
              boxShadow: `0 6px 24px ${
                isDarkMode
                  ? "rgba(30, 136, 229, 0.5)"
                  : "rgba(33, 150, 243, 0.4)"
              }`,
            },
            transition: "all 0.3s ease",
          }}
          onClick={handleSubmit}
        >
          Print & Save
        </Button>
      </Paper>

      {/* Dialogs */}
      <Dialog
        open={invoiceDialogOpen}
        onClose={() => setInvoiceDialogOpen(false)}
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "16px",
            bgcolor: isDarkMode ? "#2a2a2a" : "#fff",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: isDarkMode ? "#fff" : "#1a2138",
            textAlign: "center",
            py: 3,
            bgcolor: isDarkMode
              ? "rgba(30, 136, 229, 0.1)"
              : "rgba(33, 150, 243, 0.05)",
          }}
        >
          <ReceiptIcon
            sx={{ fontSize: "2rem", color: theme.palette.primary.main, mb: 1 }}
          />
          <Typography variant="h5">Select Invoice Type</Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 4, px: 3 }}>
          <Typography
            sx={{
              color: isDarkMode ? "#ddd" : "#333",
              textAlign: "center",
              mb: 2,
            }}
          >
            Choose how you'd like to print the invoice:
          </Typography>

          <Stack
            direction="row"
            spacing={3}
            justifyContent="center"
            sx={{ mt: 3 }}
          >
            <Button
              onClick={async () => {
                const success = await saveSaleToDB();
                if (success) {
                  setInvoiceDialogOpen(false);
                  generatePDFInvoice();
                  clearCart();
                }
              }}
              variant="contained"
              startIcon={<PictureAsPdfIcon />}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600,
                py: 1.5,
                px: 3,
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                "&:hover": {
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                },
                transition: "all 0.3s ease",
              }}
            >
              PDF Invoice
            </Button>
            <Button
              onClick={async () => {
                const success = await saveSaleToDB();
                if (success) {
                  setInvoiceDialogOpen(false);
                  generateThermalInvoice();
                  clearCart();
                }
              }}
              variant="contained"
              startIcon={<ReceiptIcon />}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600,
                py: 1.5,
                px: 3,
                bgcolor: theme.palette.grey[800],
                color: "#fff",
                "&:hover": {
                  bgcolor: theme.palette.grey[900],
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Thermal Invoice
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
export default POSPage;
