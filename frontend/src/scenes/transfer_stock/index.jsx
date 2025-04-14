import {
  Box,
  Button,
  TextField,
  Grid,
  IconButton,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import ProductDropdown from "../../components/ProductDropdown";
import { getWarehouseStock, transferStock } from "../../services/wearhouse_api";
import { useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const TransferStock = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [fromLocations, setFromLocations] = useState([]);
  const [productList, setProductList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  // New: Track selected from/to locations
  const [selectedFromLocation, setSelectedFromLocation] = useState("");
  const [selectedToLocation, setSelectedToLocation] = useState("");

  useEffect(() => {
    const loadWarehouseData = async () => {
      const data = await getWarehouseStock();
      setWarehouseStock(data);

      const allLocations = [
        ...new Set(data.map((item) => item.location_name.trim())),
      ];
      setFromLocations(allLocations);
    };
    loadWarehouseData();
  }, []);

  const handleProductSelection = (selectedProduct, setFieldValue) => {
    if (!selectedProduct) return;
    setFieldValue("barcode", selectedProduct.barcode);
    setFieldValue("product_name", selectedProduct.product_name);
  };

  const addOrUpdateProduct = (values, resetForm) => {
    const newProduct = { ...values };

    if (
      newProduct.from_location.trim().toLowerCase() ===
      newProduct.to_location.trim().toLowerCase()
    ) {
      alert("❌ From and To locations cannot be the same.");
      return;
    }

    if (editIndex !== null) {
      const updatedList = [...productList];
      updatedList[editIndex] = newProduct;
      setProductList(updatedList);
      setEditIndex(null);
    } else {
      setProductList([...productList, newProduct]);
    }

    resetForm();
  };

  const handleEdit = (index) => {
    const product = productList[index];
    setEditIndex(index);
    setSelectedFromLocation(product.from_location);
    setSelectedToLocation(product.to_location);
  };

  const handleDelete = (index) => {
    const updatedList = [...productList];
    updatedList.splice(index, 1);
    setProductList(updatedList);
  };

  const handleTransfer = async () => {
    for (const product of productList) {
      const fromLocation = product.from_location.trim().toLowerCase();
      const stockItem = warehouseStock.find(
        (item) =>
          String(item.barcode).trim() === String(product.barcode).trim() &&
          item.location_name.trim().toLowerCase() === fromLocation
      );

      if (!stockItem || stockItem.stock_quantity <= 0) {
        alert(
          `❌ No stock available for ${product.product_name} at ${product.from_location}`
        );
        return;
      }

      if (
        product.from_location.trim().toLowerCase() ===
        product.to_location.trim().toLowerCase()
      ) {
        alert(
          `❌ From and To locations cannot be the same for ${product.product_name}`
        );
        return;
      }

      if (stockItem.stock_quantity < product.transfer_quantity) {
        const confirmed = window.confirm(
          `⚠️ Only ${stockItem.stock_quantity} stock(s) available for ${product.product_name} at ${product.from_location}. Transfer available quantity?`
        );
        if (!confirmed) return;
        product.transfer_quantity = stockItem.stock_quantity;
      }
    }

    for (const product of productList) {
      await transferStock(product);
    }

    alert("✅ All stocks transferred successfully!");
    setProductList([]);
    setSelectedFromLocation("");
    setSelectedToLocation("");
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
        onSubmit={(values, helpers) =>
          addOrUpdateProduct(values, helpers.resetForm)
        }
        initialValues={{
          product_name: "",
          barcode: "",
          from_location: selectedFromLocation,
          to_location: selectedToLocation,
          transfer_quantity: "",
        }}
        validationSchema={yup.object().shape({
          product_name: yup.string().required("Product name is required"),
          barcode: yup.string().required("Barcode is required"),
          from_location: yup.string().required("Source location is required"),
          to_location: yup
            .string()
            .required("Destination location is required")
            .notOneOf(
              [yup.ref("from_location")],
              "From and To locations must be different"
            ),
          transfer_quantity: yup
            .number()
            .required("Quantity is required")
            .positive("Quantity must be greater than zero"),
        })}
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

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="filled">
                  <InputLabel>From Location</InputLabel>
                  <Select
                    name="from_location"
                    value={values.from_location}
                    onChange={(e) => {
                      setFieldValue("from_location", e.target.value);
                      setSelectedFromLocation(e.target.value);
                    }}
                    onBlur={handleBlur}
                    error={!!touched.from_location && !!errors.from_location}
                  >
                    {fromLocations.map((loc, index) => (
                      <MenuItem key={index} value={loc}>
                        {loc}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="filled">
                  <InputLabel>To Location</InputLabel>
                  <Select
                    name="to_location"
                    value={values.to_location}
                    onChange={(e) => {
                      setFieldValue("to_location", e.target.value);
                      setSelectedToLocation(e.target.value);
                    }}
                    onBlur={handleBlur}
                    error={!!touched.to_location && !!errors.to_location}
                  >
                    {uniqueLocations.map((loc, index) => (
                      <MenuItem key={index} value={loc}>
                        {loc.charAt(0).toUpperCase() +
                          loc.slice(1).toLowerCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

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

            <Box display="flex" justifyContent="space-between" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                {editIndex !== null ? "Update Product" : "Add Product"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setProductList([]);
                  setSelectedFromLocation("");
                  setSelectedToLocation("");
                }}
              >
                Reset
              </Button>
            </Box>
          </form>
        )}
      </Formik>

      <Box mt="30px">
        {productList.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Products to Transfer:
            </Typography>
            {productList.map((prod, idx) => (
              <Box
                key={idx}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={2}
                border="1px solid #ccc"
                borderRadius={2}
                mb={2}
              >
                <Box>
                  <Typography>{prod.product_name}</Typography>
                  <Typography variant="body2">
                    From: {prod.from_location} → To: {prod.to_location} | Qty:{" "}
                    {prod.transfer_quantity}
                  </Typography>
                </Box>
                <Box>
                  <IconButton onClick={() => handleEdit(idx)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(idx)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
            <Button
              color="secondary"
              variant="contained"
              onClick={handleTransfer}
            >
              Transfer Stock
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default TransferStock;
