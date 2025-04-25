const db = require("../db");

exports.getRemainingStock = async () => {
  const query = `SELECT id, barcode, opening_stock, regular_price, sales_price, purchase_price, item_name, discount, tax_value FROM products`;

  const [results] = await db.query(query);

  return {
    success: true,
    data: results.map((row) => ({
      ...row,
      discount: parseFloat(row.discount || 0.0),
      tax_value: parseFloat(row.tax_value || 0.0),
    })),
  };
};

exports.insertSale = async (sale) => {
    const customerName = sale.customerName || "N/A"; // 👈 Use default fallback
    const customerPhone = sale.customerPhone || "N/A";

  const query = `
    INSERT INTO sales (customerName, customerPhone, totalAmount, paymentMethod) 
    VALUES (?, ?, ?, ?)
  `;

  const [result] = await db
    .query(query, [
      customerName,
      customerPhone,
      sale.totalAmount,
      sale.paymentMethod,
    ]);

  return { success: true, saleId: result.insertId };
};

exports.insertSaleItems = async (saleId, saleItems) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    for (const item of saleItems) {
      if (
        !item.productId ||
        !item.quantity ||
        !item.salePrice ||
        !item.subtotal
      ) {
        throw new Error(
          `Missing parameters for product ID: ${item.productId || "Unknown"}`
        );
      }

      item.discount = parseFloat(item.discount || 0.0);
      item.tax = parseFloat(item.tax || 0.0);

      const [stockResult] = await connection.query(
        "SELECT COALESCE(opening_stock, 0) AS opening_stock FROM products WHERE id = ?",
        [item.productId]
      );

      const currentStock = stockResult[0]?.opening_stock || 0;
      if (currentStock < item.quantity) {
        throw new Error(`Insufficient stock for product ID: ${item.productId}`);
      }

      await connection.query(
        `INSERT INTO sales_items (saleId, productId, quantity, salePrice, discount, tax, subtotal) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          saleId,
          item.productId,
          item.quantity,
          item.salePrice,
          item.discount,
          item.tax,
          item.subtotal,
        ]
      );

      await connection.query(
        "UPDATE products SET opening_stock = GREATEST(opening_stock - ?, 0) WHERE id = ?",
        [item.quantity, item.productId]
      );
    }

    await connection.commit();
    connection.release();

    return { success: true, message: "Sale items added and stock updated" };
  } catch (error) {
    await connection.rollback();
    connection.release();
    return { success: false, message: error.message };
  }
};

exports.getSalesWithItems = async () => {
  const query = `
    SELECT 
      s.id AS saleId, s.customerName, s.customerPhone, s.totalAmount, s.paymentMethod, 
      s.saleDate, s.isInvoiced, 
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'itemId', si.id,
          'productId', si.productId,
          'item_name', p.item_name,
          'quantity', si.quantity,
          'salePrice', si.salePrice,
          'discount', COALESCE(si.discount, 0.0),
          'tax', COALESCE(si.tax, 0.0),
          'subtotal', si.subtotal
        )
      ) AS items
    FROM sales s
    LEFT JOIN sales_items si ON s.id = si.saleId
    LEFT JOIN products p ON si.productId = p.id
    GROUP BY s.id
    ORDER BY s.id DESC
  `;

  const [results] = await db.query(query);

  return {
    success: true,
    data: results.map((row) => ({
      saleId: row.saleId,
      customerName: row.customerName,
      customerPhone: row.customerPhone,
      totalAmount: row.totalAmount,
      paymentMethod: row.paymentMethod,
      saleDate: row.saleDate,
      isInvoiced: row.isInvoiced,
      items: Array.isArray(row.items) ? row.items : [],
    })),
  };

};

exports.getAllPhoneNumbers = async () => {
  const query = "SELECT DISTINCT customerPhone FROM sales";

  const [results] = await db.query(query);

  return {
    success: true,
    data: results.map((row) => row.customerPhone || ""),
  };
};
