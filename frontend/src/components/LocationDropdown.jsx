import { useState, useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { getAllLocations } from "../services/location_api"; // API function

const LocationDropdown = ({
  values,
  setFieldValue,
  handleBlur,
  touched,
  errors,
}) => {
  const [locations, setLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // Store search input

  useEffect(() => {
    const loadLocations = async () => {
      const data = await getAllLocations(); // Fetch available locations
      setLocations(data);
    };
    loadLocations();
  }, []);

  return (
    <Autocomplete
      fullWidth
      options={locations}
      getOptionLabel={(option) => option.location_name} // Show only location name
      filterOptions={(options, state) =>
        options.filter((option) =>
          option.location_name
            .toLowerCase()
            .includes(state.inputValue.toLowerCase())
        )
      }
      value={
        locations.find((l) => l.location_name === values.location_name) || null
      }
      onInputChange={(event, newInputValue) => setSearchQuery(newInputValue)}
      onChange={(event, newValue) => {
        setFieldValue("location_name", newValue ? newValue.location_name : "");
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select Location"
          variant="filled"
          error={!!touched.location_name && !!errors.location_name}
          onBlur={handleBlur}
          fullWidth
        />
      )}
    />
  );
};

export default LocationDropdown;
