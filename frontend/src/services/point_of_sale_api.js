import axios from "axios";

const BASE_URL = "http://localhost:5000/api/pointOfSale/sales";

// 1️⃣ Get Remaining Stock
export const getRemainingStock = async () => {
  try {
    const response = await axios.post(BASE_URL, {
      action: "getRemainingStock",
    });
    return response.data;
  } catch (error) {
    console.error("Error getting remaining stock:", error);
    return { success: false, message: "Failed to fetch stock" };
  }
};

// 2️⃣ Insert a Sale
export const insertSale = async (sale) => {
  try {
    const response = await axios.post(BASE_URL, {
      action: "insertSale",
      ...sale,
    });
    return response.data;
  } catch (error) {
    console.error("Error inserting sale:", error);
    return { success: false, message: "Failed to insert sale" };
  }
};

// 3️⃣ Insert Sale Items
export const insertSaleItems = async (saleId, items) => {
  try {
    const response = await axios.post(BASE_URL, {
      action: "insertSaleItems",
      saleId,
      items,
    });
    return response.data;
  } catch (error) {
    console.error("Error inserting sale items:", error);
    return { success: false, message: "Failed to insert sale items" };
  }
};

// 4️⃣ Get Sales With Items
export const getSalesWithItems = async () => {
  try {
    const response = await axios.post(BASE_URL, {
      action: "getSalesWithItems",
    });
    return response.data;
  } catch (error) {
    console.error("Error getting sales with items:", error);
    return { success: false, message: "Failed to fetch sales" };
  }
};

// 5️⃣ Get All Customer Phone Numbers
export const getAllPhoneNumbers = async () => {
  try {
    const response = await axios.post(BASE_URL, {
      action: "getAllPhoneNumbers",
    });
    return response.data;
  } catch (error) {
    console.error("Error getting phone numbers:", error);
    return { success: false, message: "Failed to fetch phone numbers" };
  }
};
