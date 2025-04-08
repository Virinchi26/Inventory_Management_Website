import { Box, Button, TextField, Grid } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import ProductDropdown from "../../components/ProductDropdown";
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { getWarehouseStock, transferStock } from "../../services/wearhouse_api";
import { useEffect, useState } from "react";

const TransferStock = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [fromLocations, setFromLocations] = useState([]); // Stores locations for selected product

  // ✅ Load warehouse stock data
  useEffect(() => {
    const loadWarehouseData = async () => {
      const data = await getWarehouseStock(); // Fetch warehouse stock
      setWarehouseStock(data);
    };
    loadWarehouseData();
  }, []);

  // ✅ Update available locations when product is selected
  const handleProductSelection = (selectedProduct, setFieldValue) => {
    if (!selectedProduct) return;

    // 🔹 Filter locations where this product is available
    const availableLocations = warehouseStock
      .filter(
        (item) =>
          item.barcode === selectedProduct.barcode && item.stock_quantity > 0
      )
      .map((item) => item.location_name.trim());

    setFromLocations(availableLocations);
    setFieldValue("from_location", ""); // Reset selected location
    setFieldValue("barcode", selectedProduct.barcode); // Auto-fill barcode
  };

  const handleFormSubmit = async (values, { resetForm }) => {
    try {
      const fromLocation = values.from_location.trim().toLowerCase();
      const toLocation = values.to_location.trim().toLowerCase();

      if (fromLocation === toLocation) {
        alert("❌ Source and destination locations cannot be the same!");
        return;
      }

      // Find stock item at the source location
      const stockItem = warehouseStock.find(
        (item) =>
          String(item.barcode).trim() === String(values.barcode).trim() &&
          item.location_name.trim().toLowerCase() === fromLocation
      );

      if (!stockItem) {
        console.log("DEBUG INFO:");
        console.log("Submitted barcode:", values.barcode);
        console.log("Submitted from_location:", values.from_location);
        console.log("Available stock items:", warehouseStock);
        alert("❌ No stock found at selected source location!");
        return;
      }

      const availableQty = stockItem.stock_quantity;
      const requestedQty = parseInt(values.transfer_quantity, 10);

      if (requestedQty <= 0 || isNaN(requestedQty)) {
        alert("❌ Transfer quantity must be a positive number.");
        return;
      }

      let actualQtyToTransfer = requestedQty;

      // If requested is more than available, adjust
      if (requestedQty > availableQty) {
        actualQtyToTransfer = availableQty;
        alert(
          `⚠️ Only ${availableQty} stocks are available, transferring ${availableQty}.`
        );
      }

      const payload = {
        ...values,
        transfer_quantity: actualQtyToTransfer,
      };

      const response = await transferStock(payload);

      alert(response.message || "✅ Stock transferred successfully.");
      resetForm();
      setFromLocations([]); // Clear filtered locations
    } catch (error) {
      console.error("Error transferring stock:", error);
      alert("❌ Failed to transfer stock!");
    }
  };

  const uniqueLocations = [
    ...new Set(
      warehouseStock.map((item) => item.location_name.trim().toLowerCase())
    ),
  ];

  return (
    <Box m="20px">
      <Header title="Transfer Stock" subtitle="Move stock between locations" />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={transferStockSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue,
        }) => (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* 🔽 Product Dropdown */}
              <Grid item xs={12} sm={6}>
                <ProductDropdown
                  values={values}
                  setFieldValue={(field, value) => {
                    setFieldValue(field, value);
                    if (field === "product_name") {
                      const selectedProduct = warehouseStock.find(
                        (item) => item.product_name === value
                      );
                      handleProductSelection(selectedProduct, setFieldValue);
                    }
                  }}
                  handleBlur={handleBlur}
                  touched={touched}
                  errors={errors}
                />
              </Grid>

              {/* 🔽 Barcode (Read-only) */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Barcode"
                  value={values.barcode}
                  name="barcode"
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              {/* 🔽 Source Location Dropdown (Filtered) */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="filled">
                  <InputLabel>From Location</InputLabel>
                  <Select
                    name="from_location"
                    value={values.from_location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!touched.from_location && !!errors.from_location}
                    disabled={fromLocations.length === 0} // Disable if no stock
                  >
                    {fromLocations.length > 0 ? (
                      fromLocations.map((loc, index) => (
                        <MenuItem key={index} value={loc}>
                          {loc}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No stock available</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>

              {/* 🔽 Destination Location Dropdown */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="filled">
                  <InputLabel>To Location</InputLabel>
                  <Select
                    name="to_location"
                    value={values.to_location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!touched.to_location && !!errors.to_location}
                  >
                    {uniqueLocations.map((loc, index) => {
                      const displayValue =
                        loc.charAt(0).toUpperCase() + loc.slice(1);
                      return (
                        <MenuItem key={index} value={loc}>
                          {displayValue}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>

              {/* 🔽 Stock Quantity Input */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  variant="filled"
                  type="number"
                  label="Transfer Quantity"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.transfer_quantity}
                  name="transfer_quantity"
                  error={
                    !!touched.transfer_quantity && !!errors.transfer_quantity
                  }
                  helperText={
                    touched.transfer_quantity && errors.transfer_quantity
                  }
                />
              </Grid>
            </Grid>

            {/* 🔽 Submit Button */}
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Transfer Stock
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

// 🔹 Initial Form Values
const initialValues = {
  product_name: "",
  barcode: "",
  from_location: "",
  to_location: "",
  transfer_quantity: "",
};

// 🔹 Form Validation Schema
const transferStockSchema = yup.object().shape({
  product_name: yup.string().required("Product name is required"),
  barcode: yup.string().required("Barcode is required"),
  from_location: yup.string().required("Source location is required"),
  to_location: yup.string().required("Destination location is required"),
  transfer_quantity: yup
    .number()
    .required("Quantity is required")
    .positive("Quantity must be greater than zero"),
});

export default TransferStock;
