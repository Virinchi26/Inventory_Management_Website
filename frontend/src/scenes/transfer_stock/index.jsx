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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import ProductDropdown from "../../components/ProductDropdown";
import { getWarehouseStock, transferStock } from "../../services/wearhouse_api";
import { useEffect, useState } from "react";

const TransferStock = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [fromLocations, setFromLocations] = useState([]);
  const [productList, setProductList] = useState([]);

  const [selectedFromLocation, setSelectedFromLocation] = useState("");
  const [selectedToLocation, setSelectedToLocation] = useState("");

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [editedQuantity, setEditedQuantity] = useState(1);

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

  const handleProductSelection = (selectedProduct) => {
    if (!selectedProduct) return;

    const newProduct = {
      product_name: selectedProduct.product_name,
      barcode: selectedProduct.barcode,
      from_location: selectedFromLocation,
      to_location: selectedToLocation,
      transfer_quantity: 1,
    };

    if (
      newProduct.from_location.trim().toLowerCase() ===
      newProduct.to_location.trim().toLowerCase()
    ) {
      alert("❌ From and To locations cannot be the same.");
      return;
    }

    const existingProductIndex = productList.findIndex(
      (p) =>
        p.barcode === newProduct.barcode &&
        p.from_location.trim().toLowerCase() ===
          newProduct.from_location.trim().toLowerCase() &&
        p.to_location.trim().toLowerCase() ===
          newProduct.to_location.trim().toLowerCase()
    );

    if (existingProductIndex !== -1) {
      // Increase the quantity if it already exists
      const updatedList = [...productList];
      updatedList[existingProductIndex].transfer_quantity += 1;
      setProductList(updatedList);
    } else {
      // Add new product to the list
      setProductList((prev) => [...prev, newProduct]);
    }
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

  const handleEditClick = (index) => {
    setSelectedProductIndex(index);
    setEditedQuantity(productList[index].transfer_quantity);
    setOpenDialog(true);
  };

  const handleSaveQuantity = () => {
    const updatedList = [...productList];
    updatedList[selectedProductIndex].transfer_quantity = editedQuantity;
    setProductList(updatedList);
    setOpenDialog(false);
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
        enableReinitialize
        initialValues={{
          product_name: "",
          barcode: "",
          from_location: selectedFromLocation || "",
          to_location: selectedToLocation || "",
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
        })}
        onSubmit={() => {}}
      >
        {({ values, handleBlur, setFieldValue, touched, errors }) => (
          <form>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={5}>
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
                    disabled={!!selectedFromLocation}
                  >
                    {fromLocations.map((loc, index) => (
                      <MenuItem key={index} value={loc}>
                        {loc}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={5}>
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
                    disabled={!!selectedToLocation}
                  >
                    {uniqueLocations.map((loc, index) => (
                      <MenuItem key={index} value={loc}>
                        {loc.charAt(0).toUpperCase() + loc.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={2}>
                <IconButton
                  color="secondary"
                  onClick={() => {
                    setProductList([]);
                    setSelectedFromLocation("");
                    setSelectedToLocation("");
                  }}
                >
                  <RestartAltIcon />
                </IconButton>
              </Grid>

              <Grid item xs={12} sm={6}>
                <ProductDropdown
                  values={values}
                  disabled={!selectedFromLocation || !selectedToLocation}
                  setFieldValue={(field, value) => {
                    setFieldValue(field, value);
                    if (field === "product_name") {
                      const selectedProduct = warehouseStock.find(
                        (item) => item.product_name === value
                      );
                      if (selectedProduct) {
                        setFieldValue("barcode", selectedProduct.barcode);
                        handleProductSelection(selectedProduct);
                        setTimeout(() => {
                          setFieldValue("product_name", "");
                          setFieldValue("barcode", "");
                        },300  //add timing here if you want to i.e. 300
                        );
                      }
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
            </Grid>
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
                    From: {prod.from_location} → To: {prod.to_location}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <Typography variant="body2">
                      Qty: {prod.transfer_quantity}
                    </Typography>
                    <IconButton
                      onClick={() => handleEditClick(idx)}
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <IconButton onClick={() => handleDelete(idx)}>
                  <DeleteIcon />
                </IconButton>
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

      {/* Quantity Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Edit Transfer Quantity</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Quantity"
            type="number"
            fullWidth
            variant="standard"
            value={editedQuantity}
            onChange={(e) => setEditedQuantity(Number(e.target.value))}
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            color="secondary"
            variant="contained"
            onClick={() => setOpenDialog(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveQuantity}
            color="secondary"
            autoFocus
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransferStock;
