const API_URL = "http://localhost:5000/api/locations";

// ✅ Add a new location
export const addLocation = async (locationData) => {
  try {
    const response = await fetch(`${API_URL}/add-locations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(locationData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error adding location:", error);
    throw error;
  }
};

// ✅ Get all locations
export const getAllLocations = async () => {
  try {
    const response = await fetch(`${API_URL}/all-locations`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw error;
  }
};
