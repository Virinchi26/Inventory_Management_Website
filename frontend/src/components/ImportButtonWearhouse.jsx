import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Autocomplete,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { importWarehouseProducts } from "../services/wearhouse_api";
import { getAllLocations } from "../services/location_api"; // Fetch locations API

const ImportButtonWearhouse = () => {
  const [file, setFile] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null); // Store selected location
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [notAddedProducts, setNotAddedProducts] = useState([]); // Store products that were not added
  const [loading, setLoading] = useState(false);

  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      const data = await getAllLocations();
      setLocations(data);
    };
    fetchLocations();
  }, []);

  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setIsFileUploaded(true);
    }
  };

  // Handle file upload
  const handleImport = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }
    if (!selectedLocation) {
      alert("Please select a location!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("location_name", selectedLocation.location_name); // Pass location name

    try {
      setLoading(true);
      const response = await importWarehouseProducts(formData);
      alert(response.message);
      setLoading(false);

      if (response.notAddedProducts?.length > 0) {
        setNotAddedProducts(response.notAddedProducts); // Store unadded products
      } else {
        setNotAddedProducts([]); // Reset if all products were added
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      alert("❌ Failed to import products!");
    }
  };

  // Define DataGrid Columns
  const columns = [
    { field: "product_id", headerName: "Product ID", width: 150 },
    { field: "product_name", headerName: "Product Name", width: 250 },
    { field: "barcode", headerName: "Barcode", width: 200 },
  ];

  return (
    <Box p="20px">
      {/* File Input */}
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
        style={{ marginBottom: "10px" }}
      />

      {/* Import Button */}
      <Button
        variant="contained"
        color="secondary"
        onClick={handleImport}
        sx={{ ml: 2 }}
        disabled={loading}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Import File"
        )}
      </Button>

      {/* Select Location (Autocomplete) */}
      <Box mt="20px">
        <Typography variant="h6">Select Location</Typography>
        <Autocomplete
          fullWidth
          options={locations}
          getOptionLabel={(option) => option.location_name}
          filterOptions={(options, state) =>
            options.filter((option) =>
              option.location_name
                .toLowerCase()
                .includes(state.inputValue.toLowerCase())
            )
          }
          value={selectedLocation}
          onChange={(event, newValue) => setSelectedLocation(newValue)}
          disabled={!isFileUploaded} // Disable if file is not uploaded
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search & Select Location"
              variant="filled"
              fullWidth
            />
          )}
        />
      </Box>

      {/* DataGrid for Not Added Products */}
      {notAddedProducts.length > 0 && (
        <Box mt="20px">
          <Typography variant="h6" color="error">
            ⚠️ Products Not Added to Warehouse
          </Typography>
          <Box height="400px" mt="10px">
            <DataGrid
              rows={notAddedProducts.map((product, index) => ({
                id: index + 1, // Unique row ID for DataGrid
                product_id: product.product_id,
                product_name: product.product_name,
                barcode: product.barcode,
              }))}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ImportButtonWearhouse;
