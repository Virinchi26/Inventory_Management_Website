import React, { useState } from "react";
import { Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import * as XLSX from "xlsx";
import { importProducts } from "../services/api";

const ImportButton = () => {
  const [file, setFile] = useState(null);
  const [open, setOpen] = useState(false);
  const [updateExisting, setUpdateExisting] = useState(false); // Checkbox state

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      setOpen(true); // Open popup when file is selected
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0]; // Get the first sheet
      const sheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" }); // Convert to JSON
      console.log("🔹 JSON Data:", JSON.stringify(jsonData, null, 2));

      // Send JSON data to backend
      try {
        const response = await importProducts(jsonData, updateExisting); // Pass checkbox value
        console.log("✅ Data successfully uploaded:", response);
        alert("Data imported successfully!");

        window.location.reload(); // Refresh page
      } catch (error) {
        console.error("❌ Error importing data:", error);
        alert("Error importing data! Check console for details.");
      }
    };

    reader.readAsArrayBuffer(file);
    setOpen(false); // Close popup after import
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
        <Button variant="contained" component="span" color="secondary" startIcon={<UploadFileIcon />}>
          Upload File
        </Button>
      </label>

      {/* ✅ Popup for selecting update method */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Import Options</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={<Checkbox checked={updateExisting} onChange={(e) => setUpdateExisting(e.target.checked)} />}
            label="Replace existing products completely (Unchecked: Only update and add stock)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">Cancel</Button>
          <Button onClick={handleImport} color="secondary">Import</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImportButton;
