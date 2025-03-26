import { Box, Button, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
// import { MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import ProductDropdown from "../../components/ProductDropdown";
import { addWarehouseStock } from "../../services/wearhouse_api";

const WearhouseHandle = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const handleFormSubmit = async (values, { resetForm }) => {
    try {
      // Call API to add stock to warehouse
      const response = await addWarehouseStock(values);
      alert(response.message);
      resetForm();
    } catch (error) {
      console.error("Error adding stock:", error);
      alert("❌ Failed to add stock!");
    }
  };

  return (
    <Box m="20px">
      <Header title="Add Product" subtitle="Add Product in Wearhouse" />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
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
            <Box
              display="grid"
              gap="20px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              {/* 🔽 Product Dropdown (Fetches `item_name`, stores as `product_name`) */}
              <ProductDropdown
                values={values}
                setFieldValue={setFieldValue} // To update SKU when product is selected
                handleBlur={handleBlur}
                touched={touched}
                errors={errors}
              />

              {/* 🔽 Location Input */}
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Location Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.location_name}
                name="location_name"
                error={!!touched.location_name && !!errors.location_name}
                helperText={touched.location_name && errors.location_name}
                sx={{ gridColumn: "span 2" }}
              />

              {/* 🔽 Stock Quantity Input */}
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Stock Quantity"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.stock_quantity}
                name="stock_quantity"
                error={!!touched.stock_quantity && !!errors.stock_quantity}
                helperText={touched.stock_quantity && errors.stock_quantity}
                sx={{ gridColumn: "span 1" }}
              />
            </Box>

            {/* 🔽 Submit Button */}
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Add Item
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

// 📌 Validation Schema
const checkoutSchema = yup.object().shape({
  product_name: yup.string().required("Required"),
  barcode: yup.number().required("Required"), // Hidden field, auto-filled
  location_name: yup.string().required("Required"),
  stock_quantity: yup
    .number()
    .min(1, "Stock must be at least 1")
    .required("Required"),
});

// 📌 Initial Values
const initialValues = {
  product_name: "",
  barcode: 0,
  location_name: "",
  stock_quantity: 0,
};

export default WearhouseHandle;
