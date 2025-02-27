import axios from "axios";
const API_URL = "http://localhost:5000/api/products";

// Fetch all products
export const fetchProducts = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

// Fetch product by ID
export const fetchProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

// Function to fetch low-stock products
export const fetchLowStockProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/low-stock`);
    return Array.isArray(response.data) ? response.data : []; // Ensure response is an array
  } catch (error) {
    console.error("Error fetching low-stock products:", error);
    return []; // Return empty array on error
  }
};

// ✅ Add a new product
export const addProduct = async (productData) => {
  try {
    const response = await axios.post(`${API_URL}`, productData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data; // Return the response
  } catch (error) {
    console.error("Error adding product:", error);
    throw error.response ? error.response.data : error.message;
  }
};

// Update product
export const updateProduct = async (id, productData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, productData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a product by ID
export const deleteProduct = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete product");
    }

    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, message: "Error deleting product" };
  }
};
