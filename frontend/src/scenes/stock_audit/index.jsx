// import { useState, useEffect } from "react";
import { Box, Button, TextField } from "@mui/material";
import { Formik } from "formik";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import * as yup from "yup";

import ProductDropdown from "../../components/ProductDropdown";
import LocationDropdown from "../../components/LocationDropdown";
// import { checkProductExists } from "../../services/api"; // Import the function to check product existence

import { submitStockAudit } from "../../services/stock_audit_api";

const StockAuditForm = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const handleFormSubmit = async (values, { resetForm }) => {
    try {
      const payload = {
        barcode: values.barcode,
        location_name: values.location_name,
        physical_stock: values.physical_stock,
        audited_by: values.audited_by,
      };

      const res = await submitStockAudit(payload);
      resetForm();
      if (res.success) {
        alert("✅ Stock audit submitted successfully!");
        resetForm();
      } else {
        alert(`❌ ${res.message}`);
      }
    } catch (error) {
      console.error("Error submitting stock audit:", error);
      alert("❌ Failed to submit stock audit!");
    }
  };

  return (
    <Box m="20px">
      <Header title="Stock Audit" subtitle="Manage Stock Audit" />

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

              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Physical Quantity"
                value={values.physical_stock}
                name="physical_stock"
                onChange={handleChange} // Allow manual updates
                onBlur={handleBlur}
                sx={{ gridColumn: "span 1" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Audited By"
                value={values.audited_by}
                name="audited_by"
                onChange={handleChange} // Allow manual updates
                onBlur={handleBlur}
                sx={{ gridColumn: "span 1" }}
              />
            </Box>

            {/* 🔽 Submit Button */}
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Add to Stock Audit
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
  physical_stock: yup
    .number()
    .required("Required")
    .positive("Quantity must be greater than 0"),
  audited_by: yup.string().required("Required"),
});

// 📌 Initial Values
const initialValues = {
  product_name: "",
  barcode: "",
  location_name: "",
  physical_stock: 0,
  audited_by: "",
};

export default StockAuditForm;
