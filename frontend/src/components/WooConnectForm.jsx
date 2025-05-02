import React, { useState } from "react";
import axios from "axios";
import OrderList from "./OrderList";
import { TextField, Button, Box } from "@mui/material";

const WooConnectForm = () => {
  const [storeUrl, setStoreUrl] = useState("");
  const [consumerKey, setConsumerKey] = useState("");
  const [consumerSecret, setConsumerSecret] = useState("");
  const [showOrders, setShowOrders] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/woocommerce/woo/save-config", {
      store_url: storeUrl,
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
    });
    setShowOrders(true);
  };

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Store URL"
            variant="outlined"
            fullWidth
            value={storeUrl}
            onChange={(e) => setStoreUrl(e.target.value)}
            required
          />
          <TextField
            label="Consumer Key"
            variant="outlined"
            fullWidth
            value={consumerKey}
            onChange={(e) => setConsumerKey(e.target.value)}
            required
          />
          <TextField
            label="Consumer Secret"
            variant="outlined"
            fullWidth
            value={consumerSecret}
            onChange={(e) => setConsumerSecret(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="primary">
            Connect
          </Button>
        </Box>
      </form>

      {showOrders && (
        <OrderList
          storeUrl={storeUrl}
          consumerKey={consumerKey}
          consumerSecret={consumerSecret}
        />
      )}
    </Box>
  );
};

export default WooConnectForm;
