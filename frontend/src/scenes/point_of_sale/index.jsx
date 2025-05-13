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
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, padding: 3 }}>
      {/* Left Panel */}
      <Paper
        elevation={3}
        sx={{
          flex: "1 1 60%",
          minWidth: "340px",
          padding: 3,
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Typography variant="h6" gutterBottom>
          🔍 Search Product
        </Typography>
        <TextField
          fullWidth
          value={searchText}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search by name or barcode"
          variant="outlined"
          sx={{ mb: 2 }}
        />

        {showDropdown && (
          <Paper
            elevation={2}
            sx={{
              maxHeight: "200px",
              overflowY: "auto",
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.default,
            }}
          >
            {filteredProducts.map((product) => (
              <Box
                key={product.id}
                onMouseDown={() => handleAddToCart(product)}
                sx={{
                  p: 1,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: isDarkMode ? "#444" : "#f1f1f1",
                  },
                }}
              >
                {product.item_name} ({product.barcode})
              </Box>
            ))}
          </Paper>
        )}

        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">🛒 Cart</Typography>

        <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
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
                  <TableCell key={head} sx={{ fontWeight: "bold" }}>
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {cart.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell>{item.item_name}</TableCell>
                  <TableCell>{item.barcode}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>₹{item.salePrice}</TableCell>
                  <TableCell>{item.tax}%</TableCell>
                  <TableCell>{item.discount}%</TableCell>
                  <TableCell>₹{item.subtotal.toFixed(2)}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEditItem(item)}
                      color="primary"
                    >
                      <EditIcon
                        style={{ color: isDarkMode ? "#fff" : "#000" }}
                      ></EditIcon>
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteItem(item.productId)}
                      color="error"
                    >
                      <DeleteIcon></DeleteIcon>
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {cart.length > 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="right"
                    sx={{ fontWeight: "bold" }}
                  >
                    Total:
                  </TableCell>
                  <TableCell colSpan={2} sx={{ fontWeight: "bold" }}>
                    ₹{totalAmount.toFixed(2)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Right Panel */}
      <Paper
        elevation={3}
        sx={{
          flex: "1 1 35%",
          minWidth: "300px",
          padding: 3,
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Typography variant="h6" gutterBottom>
          👤 Customer Info
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <label>
            <input
              type="radio"
              checked={mode === "on-site"}
              onChange={() => setMode("on-site")}
            />{" "}
            On-Site
          </label>
          <label>
            <input
              type="radio"
              checked={mode === "delivery"}
              onChange={() => setMode("delivery")}
            />{" "}
            Delivery
          </label>
        </Stack>

        <TextField
          label="Customer Name (Optional)"
          fullWidth
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          sx={{ mt: 2 }}
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
          sx={{ mt: 2 }}
        />

        <Typography variant="h6" sx={{ mt: 3 }}>
          💳 Payment Method
        </Typography>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "10px",
            borderRadius: "4px",
            backgroundColor: isDarkMode ? "#333" : "#fff",
            color: isDarkMode ? "#fff" : "#000",
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <option value="cash">Cash</option>
          <option value="credit">Credit</option>
          <option value="multiple">Multiple</option>
        </select>

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3, py: 1.5 }}
          onClick={handleSubmit}
        >
          🖨️ Print & Save
        </Button>
      </Paper>

      {/* Dialogs */}
      <Dialog
        open={invoiceDialogOpen}
        onClose={() => setInvoiceDialogOpen(false)}
      >
        <DialogTitle>Select Invoice Type</DialogTitle>
        <DialogContent>
          <Typography>Choose how you'd like to print the invoice:</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={async () => {
              const success = await saveSaleToDB();
              if (success) {
                setInvoiceDialogOpen(false);
                generatePDFInvoice();
                setTimeout(() => window.location.reload(), 1000);
              }
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
                setTimeout(() => window.location.reload(), 1000);
              }
            }}
          >
            Thermal Invoice
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default POSPage;
