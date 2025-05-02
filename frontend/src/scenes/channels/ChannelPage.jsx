import React from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa"; // WooCommerce icon
import { useTheme } from "@mui/material/styles"; // Import the useTheme hook
import "../../css/ChannelCard.css"; // CSS for custom styles

const ChannelCard = () => {
  // Get the theme from Material-UI
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark"; // Check if the theme is dark

  return (
    <div className="card" style={{ margin: "20px", padding: "20px", backgroundColor: isDarkMode ? "#333" : "#fff", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
      {/* Card Header with WooCommerce Icon and Name */}
      <div
        className="card-content"
        style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}
      >
        {/* WooCommerce Icon */}
        <FaShoppingCart size={30} className="icon" />

        {/* WooCommerce Name with a clickable Link */}
        <Link
          to="https://woocommerce.com"
          target="_blank"
          className="woocommerce-link"
          style={{
            color: isDarkMode ? "#fff" : "#000",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          WooCommerce
        </Link>
      </div>

      {/* Text description */}
      <p style={{ color: isDarkMode ? "#fff" : "#000", marginBottom: "15px" }}>
        Connect your WooCommerce store
      </p>

      {/* Connect Button */}
      <Link
        to="/woocommerce"
        className="connect-button"
        style={{
          padding: "10px 15px",
          backgroundColor: "#0073aa",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "5px",
          display: "inline-block",
        }}
      >
        Connect
      </Link>
    </div>
  );
};

export default ChannelCard;
