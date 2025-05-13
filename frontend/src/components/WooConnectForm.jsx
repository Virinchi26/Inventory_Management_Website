import React, { useState } from "react";
import axios from "axios";
import OrderList from "../scenes/channels/OrderList";
import {
  TextField,
  Button,
  Box,
  Paper,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Storefront,
  VpnKey,
  Lock,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

const WooConnectForm = () => {
  const theme = useTheme();
  const [storeUrl, setStoreUrl] = useState("");
  const [consumerKey, setConsumerKey] = useState("");
  const [consumerSecret, setConsumerSecret] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showOrders, setShowOrders] = useState(false);

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

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
    <Box sx={{ mt: 4, mb: 4, p: 2 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          bgcolor:
            theme.palette.mode === "dark"
              ? theme.palette.background.default
              : "#f9f9f9",
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}
        >
          Connect WooCommerce Store
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Store URL"
              variant="filled"
              fullWidth
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Storefront color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Consumer Key"
              variant="filled"
              fullWidth
              value={consumerKey}
              onChange={(e) => setConsumerKey(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKey color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Consumer Secret"
              variant="filled"
              fullWidth
              type={showPassword ? "text" : "password"}
              value={consumerSecret}
              onChange={(e) => setConsumerSecret(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" size="large">
              Connect
            </Button>
          </Box>
        </form>
      </Paper>

      {showOrders && (
        <Box sx={{ mt: 4 }}>
          <OrderList
            storeUrl={storeUrl}
            consumerKey={consumerKey}
            consumerSecret={consumerSecret}
          />
        </Box>
      )}
    </Box>
  );
};

export default WooConnectForm;
