import React, { useState } from "react";
import { Button, Box } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import * as XLSX from "xlsx";
import axios from "axios";
import { importProducts } from "../services/api";
import UpdateIcon from "@mui/icons-material/Update";

const ImportButton = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0]; // Get the first sheet
        const sheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" }); // Convert to JSON
        console.log("🔹 JSON Data:", JSON.stringify(jsonData, null, 2)); // Log formatted JSON

        // Send JSON data to backend using api.js
        try {
          const response = await importProducts(jsonData);
          console.log("✅ Data successfully uploaded:", response);
          alert("Data imported successfully!");

          // ✅ Refresh the page after successful import
          window.location.reload();
        } catch (error) {
          alert("Error importing data! Check console for details.");
        }
      };

      reader.readAsArrayBuffer(selectedFile);
    }
  };

  return (
    <Box display="flex" justifyContent="right" mt="20px">
      <input
        type="file"
        accept=".xlsx, .xls"
        style={{ display: "none" }}
        id="file-upload"
        onChange={handleFileChange}
      />
      <label htmlFor="file-upload">
        <Button
          variant="contained"
          component="span"
          color="secondary"
          startIcon={<UploadFileIcon />}
        >
          Upload File
        </Button>
      </label>
    </Box>
  );
};

export default ImportButton;
