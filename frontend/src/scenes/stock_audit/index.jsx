import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../components/Header";
import ProductDropdown from "../../components/ProductDropdown";
import LocationDropdown from "../../components/LocationDropdown";
import { submitStockAudit } from "../../services/stock_audit_api";

const StockAuditForm = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [locationLocked, setLocationLocked] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [auditList, setAuditList] = useState([]);
  const [auditResponses, setAuditResponses] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedQty, setEditedQty] = useState(0);

  const initialValues = {
    product_name: "",
    barcode: "",
    location_name: "",
  };

  const stockSchema = yup.object().shape({
    product_name: yup.string().required("Required"),
    barcode: yup.string().required("Required"),
    location_name: yup.string().required("Required"),
  });

  const addOrUpdateAuditItem = (values, setFieldValue) => {
    const existingIndex = auditList.findIndex(
      (item) =>
        item.barcode === values.barcode &&
        item.location_name === values.location_name
    );

    if (existingIndex !== -1) {
      const updatedList = [...auditList];
      updatedList[existingIndex].physical_stock += 1;
      setAuditList(updatedList);
    } else {
      const newItem = {
        product_name: values.product_name,
        barcode: values.barcode,
        location_name: values.location_name,
        physical_stock: 1,
      };
      setAuditList((prev) => [...prev, newItem]);
    }

    // Reset only relevant fields
    setFieldValue("product_name", "");
    setFieldValue("barcode", "");

    if (!locationLocked) {
      setLocationLocked(true);
      setLocationName(values.location_name);
    }
  };

  const handleStockAudit = async () => {
    const results = [];

    for (const item of auditList) {
      try {
        const res = await submitStockAudit(item);

        if (res.success) {
          alert(`✅ Successfully audited ${item.product_name}`);
          results.push({
            location_name: item.location_name,
            product_name: item.product_name,
            barcode: item.barcode,
            previous_stock: res.previous_stock,
            updated_stock: res.updated_stock,
            difference: res.updated_stock - res.previous_stock,
          });
        } else {
          alert(`❌ Error auditing ${item.product_name}: ${res.message}`);
        }
      } catch (error) {
        alert(`❌ Unexpected error auditing ${item.barcode}`);
      }
    }

    setAuditResponses(results); // Now this will contain the data to display
    setAuditList([]);
    setLocationLocked(false);
    setLocationName("");
  };

  const handleReset = () => {
    setAuditList([]);
    setAuditResponses([]);
    setLocationLocked(false);
    setLocationName("");
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditedQty(auditList[index].physical_stock);
  };

  const handleSaveEdit = (index) => {
    const updatedList = [...auditList];
    updatedList[index].physical_stock = editedQty;
    setAuditList(updatedList);
    setEditingIndex(null);
  };

  return (
    <Box m="20px">
      <Header title="Stock Audit" subtitle="Manage Stock Audit" />

      <Formik
        initialValues={initialValues}
        validationSchema={stockSchema}
        onSubmit={() => {}}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          setFieldValue,
        }) => {
          const formValuesRef = useRef({});

          useEffect(() => {
            const { product_name, barcode, location_name } = values;
            const prev = formValuesRef.current;

            const allFieldsFilled = product_name && barcode && location_name;

            const hasChanged =
              product_name !== prev.product_name ||
              barcode !== prev.barcode ||
              location_name !== prev.location_name;

           if (
             allFieldsFilled &&
             (!formValuesRef.current.timestamp ||
               Date.now() - formValuesRef.current.timestamp > 300)
           ) {
             addOrUpdateAuditItem(values, setFieldValue);
             formValuesRef.current = { ...values, timestamp: Date.now() };
           }

          }, [values, setFieldValue]);


          return (
            <form>
              <Box
                display="grid"
                gap="20px"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                sx={{
                  "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                }}
              >
                {/* Product Dropdown */}
                <ProductDropdown
                  values={values}
                  setFieldValue={(field, value) => {
                    setFieldValue(field, value);
                  }}
                  handleBlur={handleBlur}
                  touched={touched}
                  errors={errors}
                />

                {/* Barcode */}
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Barcode"
                  value={values.barcode}
                  name="barcode"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  sx={{ gridColumn: "span 2" }}
                />

                {/* Location */}
                {locationLocked ? (
                  <TextField
                    fullWidth
                    variant="filled"
                    label="Location"
                    value={locationName}
                    name="location_name"
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{ gridColumn: "span 2" }}
                  />
                ) : (
                  <LocationDropdown
                    values={values}
                    setFieldValue={(field, value) => {
                      setFieldValue(field, value);
                      setLocationName(value);
                    }}
                    handleBlur={handleBlur}
                    touched={touched}
                    errors={errors}
                  />
                )}
              </Box>

              {/* Button to Add or Update Audit Item */}
              {/* <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={
                    !values.product_name ||
                    !values.barcode ||
                    !values.location_name 
                  }
                  onClick={() => addOrUpdateAuditItem(values, setFieldValue)}
                >
                  Add/Update Audit Item
                </Button>
              </Box> */}
            </form>
          );
        }}
      </Formik>

      {/* Display Products Added to Audit List */}
      {auditList.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6">📝 Stocks to be Audited</Typography>
          <table style={{ width: "100%", marginTop: "10px" }} border="1">
            <thead>
              <tr>
                <th>Product</th>
                <th>Barcode</th>
                <th>Location</th>
                <th>Physical Qty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {auditList.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.product_name}</td>
                  <td>{item.barcode}</td>
                  <td>{item.location_name}</td>
                  <td>
                    {editingIndex === idx ? (
                      <TextField
                        type="number"
                        size="small"
                        value={editedQty}
                        onChange={(e) => setEditedQty(Number(e.target.value))}
                      />
                    ) : (
                      item.physical_stock
                    )}
                  </td>
                  <td>
                    {editingIndex === idx ? (
                      <IconButton onClick={() => handleSaveEdit(idx)}>
                        <SaveIcon />
                      </IconButton>
                    ) : (
                      <IconButton onClick={() => handleEditClick(idx)}>
                        <EditIcon />
                      </IconButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}

      {/* Submit + Reset Buttons */}
      <Box display="flex" gap="10px" mt="20px">
        <Button
          variant="contained"
          color="primary"
          disabled={auditList.length === 0}
          onClick={handleStockAudit}
        >
          Stock Audit
        </Button>

        <Button variant="outlined" color="warning" onClick={handleReset}>
          Reset
        </Button>
      </Box>

      {/* Display Audit Results */}
      {auditResponses.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6">📋 Audit Results</Typography>
          <table style={{ width: "100%", marginTop: "10px" }} border="1">
            <thead>
              <tr>
                <th>Location</th>
                <th>Product</th>
                <th>Barcode</th>
                <th>Previous Stock</th>
                <th>Updated Stock</th>
                <th>Difference</th>
              </tr>
            </thead>
            <tbody>
              {auditResponses.map((res, idx) => (
                <tr key={idx}>
                  <td>{res.location_name}</td>
                  <td>{res.product_name}</td>
                  <td>{res.barcode}</td>
                  <td>{res.previous_stock}</td>
                  <td>{res.updated_stock}</td>
                  <td>{res.difference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}
    </Box>
  );
};

export default StockAuditForm;
