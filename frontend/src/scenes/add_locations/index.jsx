import { Box, Button, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { addLocation, getAllLocations } from "../../services/location_api";

const AddLocation = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [locations, setLocations] = useState([]); // State to store fetched locations

  // Fetch locations from API
  const fetchLocations = async () => {
    try {
      const data = await getAllLocations();
      setLocations(data);
    } catch (error) {
      console.error("❌ Error fetching locations:", error);
    }
  };

  useEffect(() => {
    fetchLocations(); // Fetch locations on component mount
  }, []);

  // Handle form submission
  const handleFormSubmit = async (values, { resetForm }) => {
    try {
      const response = await addLocation(values);
      alert(response.message);
      resetForm();
      fetchLocations(); // Refresh locations after adding a new one
    } catch (error) {
      console.error("❌ Error adding location:", error);
      alert("❌ Failed to add location!");
    }
  };

  // Define DataGrid columns
  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "location_name", headerName: "Location Name", width: 300 },
  ];

  return (
    <Box m="20px">
      <Header title="Add Location" subtitle="Add a new storage location" />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={locationSchema}
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
              gap="20px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              {/* 🔽 Location Input Field */}
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
                sx={{ gridColumn: "span 4" }}
              />
            </Box>

            {/* 🔽 Submit Button */}
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Add Location
              </Button>
            </Box>
          </form>
        )}
      </Formik>

      {/* 🔽 Locations Table */}
      <Box mt="40px">
        <Header title="Locations List" subtitle="All stored locations" />
        <Box height="400px">
          <DataGrid
            rows={locations}
            columns={columns}
            pageSize={50} // Show 50 locations per page
            rowsPerPageOptions={[50]}
          />
        </Box>
      </Box>
    </Box>
  );
};

// 📌 Validation Schema
const locationSchema = yup.object().shape({
  location_name: yup.string().required("❌ Location name is required!"),
});

// 📌 Initial Values
const initialValues = {
  location_name: "",
};

export default AddLocation;
