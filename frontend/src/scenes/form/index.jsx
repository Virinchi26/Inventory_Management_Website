import { Box, Button, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import { addProduct } from "../../services/api";

const Form = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");

  // const handleFormSubmit = async (values, { resetForm }) => {
  //   try {
  //     console.log("Submitting form data:", values); // ✅ Debugging log

  //     const response = await fetch("http://localhost:5000/api/products", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(values), // ✅ Convert values to JSON
  //     });

  //     const data = await response.json();
  //     console.log("Server response:", data); // ✅ Debugging log

  //     if (response.ok) {
  //       alert("Product added successfully!");
  //       resetForm(); // ✅ Clear form after submission
  //     } else {
  //       alert("Error: " + data.message);
  //     }
  //   } catch (error) {
  //     console.error("Error:", error);
  //     alert("Something went wrong!");
  //   }
  // };

  const handleFormSubmit = async (values, { resetForm }) => {
    try {
      await addProduct(values); // Call API to add product
      alert("Product added successfully!");
      resetForm(); // Reset form after submission
    } catch (error) {
      console.log(error);
      alert("Failed to add product. Please try again.");
    }
  };

  return (
    <Box m="20px">
      <Header title="Add Product" subtitle="Add Product in Inventory" />

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
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Item name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.item_name}
                name="item_name"
                error={!!touched.item_name && !!errors.item_name}
                helperText={touched.item_name && errors.item_name}
                sx={{ gridColumn: "span 1" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Category Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.category_name}
                name="category_name"
                error={!!touched.category_name && !!errors.category_name}
                helperText={touched.category_name && errors.category_name}
                sx={{ gridColumn: "span 1" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="SKU"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.SKU}
                name="sku"
                error={!!touched.SKU && !!errors.SKU}
                helperText={touched.SKU && errors.SKU}
                sx={{ gridColumn: "span 1" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="HSN"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.HSN}
                name="hsn"
                error={!!touched.HSN && !!errors.HSN}
                helperText={touched.HSN && errors.HSN}
                sx={{ gridColumn: "span 1" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Unit Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.unit_name}
                name="unit_name"
                error={!!touched.unit_name && !!errors.unit_name}
                helperText={touched.unit_name && errors.unit_name}
                sx={{ gridColumn: "span 1" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Alert Quantity"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.alert_quantity}
                name="alert_quantity"
                error={!!touched.alert_quantity && !!errors.alert_quantity}
                helperText={touched.alert_quantity && errors.alert_quantity}
                sx={{ gridColumn: "span 1" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Brand Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.brand_name}
                name="brand_name"
                error={!!touched.brand_name && !!errors.brand_name}
                helperText={touched.brand_name && errors.brand_name}
                sx={{ gridColumn: "span 1" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Lot Number"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.lot_number}
                name="lot_number"
                error={!!touched.lot_number && !!errors.lot_number}
                helperText={touched.lot_number && errors.lot_number}
                sx={{ gridColumn: "span 1" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="date"
                label="Expire Date"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.expire_date}
                name="expire_date"
                error={!!touched.expire_date && !!errors.expire_date}
                helperText={touched.expire_date && errors.expire_date}
                sx={{ gridColumn: "span 1" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Regular Price"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.regular_price}
                name="regular_price"
                error={!!touched.regular_price && !!errors.regular_price}
                helperText={touched.regular_price && errors.regular_price}
                sx={{ gridColumn: "span 1" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Purchase Price"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.purchase_price}
                name="purchase_price"
                error={!!touched.purchase_price && !!errors.purchase_price}
                helperText={touched.purchase_price && errors.purchase_price}
                sx={{ gridColumn: "span 1" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Tax Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.tax_name}
                name="tax_name"
                error={!!touched.tax_name && !!errors.tax_name}
                helperText={touched.tax_name && errors.tax_name}
                sx={{ gridColumn: "span 1" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Tax Value"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.tax_value}
                name="tax_value"
                error={!!touched.tax_value && !!errors.tax_value}
                helperText={touched.tax_value && errors.tax_value}
                sx={{ gridColumn: "span 1" }}
              />

              {/* <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Tax Type"
                placeholder="Inclusive or Exclusive"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.tax_type}
                name="tax_type"
                error={!!touched.tax_type && !!errors.tax_type}
                helperText={touched.tax_type && errors.tax_type}
                sx={{ gridColumn: "span 1" }}
              /> */}
              <FormControl
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 1" }}
              >
                <InputLabel>Tax Type</InputLabel>
                <Select
                  value={values.tax_type}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="tax_type"
                  error={!!touched.tax_type && !!errors.tax_type}
                >
                  <MenuItem value="Inclusive">Inclusive</MenuItem>
                  <MenuItem value="Exclusive">Exclusive</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Sales Price"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.sales_price}
                name="sales_price"
                error={!!touched.sales_price && !!errors.sales_price}
                helperText={touched.sales_price && errors.sales_price}
                sx={{ gridColumn: "span 1" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Opening Stock"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.opening_stock}
                name="opening_stock"
                error={!!touched.opening_stock && !!errors.opening_stock}
                helperText={touched.opening_stock && errors.opening_stock}
                sx={{ gridColumn: "span 1" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Barcode"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.barcode}
                name="barcode"
                error={!!touched.barcode && !!errors.barcode}
                helperText={touched.barcode && errors.barcode}
                sx={{ gridColumn: "span 1" }}
              />
              {/* 
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Discount Type"
                placeholder="Percentage or Fixed"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.discount_type}
                name="discount_type"
                error={!!touched.discount_type && !!errors.discount_type}
                helperText={touched.discount_type && errors.discount_type}
                sx={{ gridColumn: "span 1" }}
              /> */}
              <FormControl
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 1" }}
              >
                <InputLabel>Discount Type</InputLabel>
                <Select
                  value={values.discount_type}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="discount_type"
                  error={!!touched.discount_type && !!errors.discount_type}
                >
                  <MenuItem value="Percentage">Percentage</MenuItem>
                  <MenuItem value="Fixed">Fixed</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Discount"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.discount}
                name="discount"
                error={!!touched.discount && !!errors.discount}
                helperText={touched.discount && errors.discount}
                sx={{ gridColumn: "span 1" }}
              />
            </Box>
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

const checkoutSchema = yup.object().shape({
  item_name: yup.string().required("required"),
  category_name: yup.string().required("required"),
  sku: yup.string(),
  hsn: yup.string(),
  unit_name: yup.string().required("required"),
  alert_quantity: yup.number(),
  brand_name: yup.string(),
  lot_number: yup.number(),
  expire_date: yup.date(),
  regular_price: yup.number().required("required"),
  purchase_price: yup.number().required("required"),
  tax_name: yup.string().required("required"),
  tax_value: yup.number().required("required"),
  tax_type: yup.string().required("required"),
  sales_price: yup.number().required("required"),
  opening_stock: yup.number().required("required"),
  barcode: yup.number(),
  discount_type: yup.string(),
  discount: yup.number(),
});
const initialValues = {
  item_name: "",
  category_name: "",
  sku: "",
  hsn: "",
  unit_name: "",
  alert_quantity: 0,
  brand_name: "",
  lot_number: 0,
  expire_date: "",
  regular_price: 0,
  purchase_price: 0,
  tax_name: "",
  tax_value: 0,
  tax_type: "",
  sales_price: 0,
  opening_stock: 0,
  barcode: 0,
  discount_type: "",
  discount: 0,
};

export default Form;

// const phoneRegExp =
//   /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;
