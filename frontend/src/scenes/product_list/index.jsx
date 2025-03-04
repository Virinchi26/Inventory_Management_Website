import { Box, Button } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchProducts, deleteProduct } from "../../services/api";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import ExportButton from "../../components/ExportButton";
import ImportButton from "../../components/ImportButton";

const Products = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Products on Component Mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Function to Load Products
  const loadProducts = async () => {
    setLoading(true);
    const data = await fetchProducts();
    setProducts(data);
    setLoading(false);
  };

  // Handle Delete Product
  const handleDelete = async (id) => {
    const result = await deleteProduct(id);
    if (result.success) {
      setProducts(products.filter((product) => product.id !== id));
    } else {
      alert("Error deleting product");
    }
  };

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const columns = [
    { field: "id", headerName: "ID", flex: 0.4 },

    {
      field: "item_name",
      headerName: "Item Name",
      flex: 5,
      renderCell: (params) => (
        <span>
          {params.row.item_name} (SKU: {params.row.sku}, HSN: {params.row.hsn})
        </span>
      ),
    },
    {
      field: "category_name",
      headerName: "Category",
      flex: 2,
    },
    {
      field: "unit_name",
      headerName: "Unit",
      flex: 2,
    },
    {
      field: "alert_quantity",
      headerName: "Alert Quantity",
      flex: 2,
    },
    {
      field: "brand_name",
      headerName: "Brand",
      flex: 2,
    },
    // {
    //   field: "lot_number",
    //   headerName: "Lot Number",
    //   flex: 2,
    // },
    // {
    //   field: "expire_date",
    //   headerName: "Expire date",
    //   flex: 2,
    // },
    {
      field: "regular_price",
      headerName: "Regular Price",
      flex: 2,
    },

    {
      field: "purchase_price",
      headerName: "Purchase Price",
      flex: 2,
    },
    {
      field: "tax_name",
      headerName: "Tax Name",
      flex: 2,
    },
    {
      field: "tax_value",
      headerName: "Tax Value",
      flex: 2,
    },
    {
      field: "tax_type",
      headerName: "Tax Type",
      flex: 2,
    },
    {
      field: "sales_price",
      headerName: "Sales Price",
      flex: 2,
    },
    // {
    //   field: "opening_stock",
    //   headerName: "Opening Stock",
    //   flex: 2,
    // },
    // {
    //   field: "barcode",
    //   headerName: "Barcode",
    //   flex: 2,
    // },
    // {
    //   field: "discount_type",
    //   headerName: "Discount Type",
    //   flex: 2,
    // },
    // {
    //   field: "dicount",
    //   headerName: "Discount",
    //   flex: 2,
    // },
    {
      field: "delete",
      headerName: "Delete Product",
      width: 100,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={() => handleDelete(params.row.id)}
        >
          <DeleteIcon />
        </Button>
      ),
    },
    {
      field: "edit",
      headerName: "Edit Product",
      width: 100,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => navigate(`/edit-product/${params.row.id}`)}
        >
          <EditIcon />
        </Button>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="Products" subtitle="List of Products" />
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
        <ExportButton data={products} />
        <ImportButton onImportSuccess={fetchProducts} />

        <DataGrid
          rows={products}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          loading={loading}
        />
      </Box>
    </Box>
  );
};

export default Products;
