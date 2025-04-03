import { useState, useEffect } from "react";
import { Box, Button, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import ProductDropdown from "../../components/ProductDropdown";
import LocationDropdown from "../../components/LocationDropdown";
import { addWarehouseStock } from "../../services/wearhouse_api";
import { checkProductExists } from "../../services/api"; // Import the function to check product existence
import ImportButtonWearhouse from "../../components/ImportButtonWearhouse";

const WarehouseHandle = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const handleFormSubmit = async (values, { resetForm }) => {
    try {
      // Check if product exists before adding stock
      const productExists = await checkProductExists(values.barcode);

      if (!productExists) {
        alert("❌ Product not found! Please add it to the product list first.");
        return;
      }

      // Add stock to warehouse
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
      <Header
        title="Add Product to Warehouse"
        subtitle="Manage Warehouse Stock"
      />
      <ImportButtonWearhouse />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={stockSchema}
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
              {/* 🔽 Product Dropdown */}
              <ProductDropdown
                values={values}
                setFieldValue={(field, value) => {
                  setFieldValue(field, value);
                  if (field === "barcode" && value) {
                    // Auto-increment stock when barcode is detected
                    setFieldValue("stock_quantity", values.stock_quantity + 1);
                  }
                }}
                handleBlur={handleBlur}
                touched={touched}
                errors={errors}
              />

              {/* 🔽 Barcode Field (Auto-filled) */}
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Barcode"
                value={values.barcode}
                name="barcode"
                disabled
                sx={{ gridColumn: "span 2" }}
              />

              {/* 🔽 Location Dropdown */}
              <LocationDropdown
                values={values}
                setFieldValue={setFieldValue}
                handleBlur={handleBlur}
                touched={touched}
                errors={errors}
              />

              {/* 🔽 Stock Quantity (Auto-updated by Barcode Scan) */}
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Stock Quantity"
                value={values.stock_quantity}
                name="stock_quantity"
                onChange={handleChange} // Allow manual updates
                onBlur={handleBlur}
                sx={{ gridColumn: "span 1" }}
              />
            </Box>

            {/* 🔽 Submit Button */}
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Add to Warehouse
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

// 📌 Validation Schema
const stockSchema = yup.object().shape({
  product_name: yup.string().required("Required"),
  barcode: yup.string().required("Required"),
  location_name: yup.string().required("Required"),
  stock_quantity: yup
    .number()
    .required("Required")
    .positive("Quantity must be greater than 0"),
});

// 📌 Initial Values
const initialValues = {
  product_name: "",
  barcode: "",
  location_name: "",
  stock_quantity: 0,
};

export default WarehouseHandle;
