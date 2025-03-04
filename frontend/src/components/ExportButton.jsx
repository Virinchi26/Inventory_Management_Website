import React, { useState } from "react";
import { Box, Button, Menu, MenuItem } from "@mui/material";
import {
  FileDownload as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Description as ExcelIcon,
  ArrowDropDown as ArrowIcon,
} from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ Import correctly
import * as XLSX from "xlsx";

const ExportButton = ({ data }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // 🔴 Function to Download PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape", // Landscape for better fit
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(16);
    doc.text("Product List", 14, 15); // Title

    // ✅ Define table columns
    const tableColumn = [
      "ID",
      "Item Details",
      "Unit",
      "Alert Qty",
      "Brand",
      "Lot No.",
      "Expiry",
      "Regular Price",
      "Purchase Price",
      "Tax Details",
      "Sales Price",
      "Stock",
      "Barcode",
      "Discount",
    ];

    // ✅ Format the table rows
    const tableRows = data.map((item) => [
      item.id,
      `${item.item_name}\nSKU: ${item.sku}\nHSN: ${item.hsn}`, // Item Details
      item.unit_name,
      item.alert_quantity,
      item.brand_name,
      item.lot_number,
      formatDate(item.expire_date), // Format Expiry Date
      item.regular_price,
      item.purchase_price,
      `${item.tax_name}\nValue: ${item.tax_value}%\nType: ${item.tax_type}`, // Tax Details
      item.sales_price,
      item.opening_stock,
      item.barcode,
      `${item.discount_type}\nDiscount: ${item.discount}%`,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25, // Start below title
      theme: "striped", // Clean striped theme
      styles: {
        fontSize: 9,
        cellPadding: 3,
        valign: "middle", // Align text properly
      },
      headStyles: {
        fillColor: [0, 112, 192], // Blue header background
        textColor: [255, 255, 255], // White text color
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 10 }, // ID
        1: { cellWidth: 30 }, // Item Name + SKU + HSN
        2: { cellWidth: 15 }, // Unit
        3: { cellWidth: 15 }, // Alert Qty
        4: { cellWidth: 20 }, // Brand
        5: { cellWidth: 15 }, // Lot No.
        6: { cellWidth: 25 }, // Expiry Date (Smaller column)
        7: { cellWidth: 20 }, // Purchase Price
        8: { cellWidth: 30 }, // Tax Details (merged column)
        9: { cellWidth: 20 }, // Sales Price
        10: { cellWidth: 15 }, // Stock
        11: { cellWidth: 30 }, // Barcode
        12: { cellWidth: 30 }, // Barcode
      },
      margin: { left: 10, right: 10 }, // Keep table within page
    });

    doc.save("Product_List.pdf");
    handleClose();
  };

  // ✅ Format Date to "DD/MM/YYYY"
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // Converts to "DD/MM/YYYY"
  };

  // 🟢 Function to Download Excel
  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "Product_List.xlsx");
    handleClose();
  };

  return (
    <Box display="flex" justifyContent="end" mt="20px">
      <Button
        color="primary"
        variant="contained"
        endIcon={<ArrowIcon />}
        onClick={handleClick}
      >
        <DownloadIcon sx={{ mr: 1 }} />
        Export Data
      </Button>

      {/* Dropdown Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleDownloadPDF}>
          <PdfIcon sx={{ mr: 1, color: "red" }} /> Download as PDF
        </MenuItem>
        <MenuItem onClick={handleDownloadExcel}>
          <ExcelIcon sx={{ mr: 1, color: "green" }} /> Download as Excel
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ExportButton;
