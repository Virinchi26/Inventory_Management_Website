const API_URL = "http://localhost:5000/api/warehouse";

export const getWarehouseStock = async () => {
  try {
    const response = await fetch(`${API_URL}/warehouse-stock`);

    if (!response.ok) {
      throw new Error("Failed to fetch warehouse stock");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching warehouse stock:", error);
    return [];
  }
};

// 🔽 Add stock to warehouse (product name is stored as `product_name` in warehouse)
export const addWarehouseStock = async (stockData) => {
  try {
    const response = await fetch(`${API_URL}/add-warehouse-stock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stockData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error adding warehouse stock:", error);
    throw error;
  }
};

// ✅ Transfer stock
export const transferStock = async (data) => {
  try {
    const response = await fetch(`${API_URL}/transfer-stock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return await response.json();
  } catch (error) {
    console.error("Error transferring stock:", error);
    return { success: false, message: "Error transferring stock" };
  }
};

export const importWarehouseProducts = async (formData) => {
  try {
    const response = await fetch(`${API_URL}/import-warehouse-products`, {
      method: "POST",
      body: formData, // FormData for file upload
    });

    return await response.json();
  } catch (error) {
    console.error("Error importing warehouse products:", error);
    throw error;
  }
};
