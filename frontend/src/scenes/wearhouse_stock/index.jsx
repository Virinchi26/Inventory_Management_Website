import { Box } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { getWarehouseStock } from "../../services/wearhouse_api";

const Products = () => {
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Products on Component Mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Function to Load Products
  const loadProducts = async () => {
    setLoading(true);
    const data = await getWarehouseStock();
    setWarehouseStock(data);
    setLoading(false);
  };

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const columns = [
    { field: "id", headerName: "ID", flex: 0.4 },

    {
      field: "product_name",
      headerName: "Product Name",
      flex: 5,
    },
    {
      field: "barcode",
      headerName: "Barcode",
      flex: 5,
    },
    {
      field: "location_name",
      headerName: "Location",
      flex: 5,
    },
    {
      field: "stock_quantity",
      headerName: "Stock Quantity",
      flex: 5,
    },
  ];

  return (
    <Box m="20px">
      <Header title="Products" subtitle="List of Wearhouse Stock" />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={warehouseStock}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          loading={loading}
          getRowId={(row) => row.id}
        />
      </Box>
    </Box>
  );
};

export default Products;
