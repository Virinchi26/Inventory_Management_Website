import { useState, useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { fetchProducts } from "../services/api"; // API function

const ProductDropdown = ({
  values,
  setFieldValue,
  handleBlur,
  touched,
  errors,
}) => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // Store search input

  useEffect(() => {
    const loadProducts = async () => {
      const data = await fetchProducts();
      setProducts(data);
    };
    loadProducts();
  }, []);

  return (
    <Autocomplete
      fullWidth
      options={products}
      getOptionLabel={(option) => `${option.item_name} (${option.barcode})`} // Show product with barcode
      filterOptions={(options, state) =>
        options.filter((option) =>
          option.item_name
            .toLowerCase()
            .includes(state.inputValue.toLowerCase())
        )
      }
      value={products.find((p) => p.item_name === values.product_name) || null}
      onInputChange={(event, newInputValue) => setSearchQuery(newInputValue)}
      onChange={(event, newValue) => {
        if (newValue) {
          setFieldValue("product_name", newValue.item_name); // Store product name
          setFieldValue("barcode", newValue.barcode || ""); // Auto-fill barcode
        } else {
          setFieldValue("product_name", "");
          setFieldValue("barcode", "");
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Product"
          variant="filled"
          error={!!touched.product_name && !!errors.product_name}
          onBlur={handleBlur}
          fullWidth
        />
      )}
    />
  );
};

export default ProductDropdown;
