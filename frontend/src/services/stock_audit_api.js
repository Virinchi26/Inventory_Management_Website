// const API_URL = "http://localhost:5000/api/products";

export const submitStockAudit = async (data) => {
  try {
    const response = await fetch(
      "http://localhost:5000/api/stock/stock-audit",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to submit stock audit");
    }

    return await response.json(); // Expected to return { success: true, message: "..." }
  } catch (error) {
    console.error("Error submitting stock audit:", error);
    return { success: false, message: "Error submitting stock audit" };
  }
};

export const getAuditHistory = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/stock/stock-audit-history");
  
      if (!response.ok) {
        throw new Error("Failed to fetch audit history");
      }
  
      const result = await response.json();
      console.log("📦 Full audit history response:", result); // 👈 Log response here
  
      if (!result.success) {
        throw new Error(result.message || "Something went wrong");
      }
  
      return result;
    } catch (error) {
      console.error("Error fetching audit history:", error);
      return { success: false, message: error.message };
    }
  };
  
