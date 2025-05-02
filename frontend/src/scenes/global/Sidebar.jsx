import { useState, useEffect } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";

// Icons
import AddIcon from "@mui/icons-material/Add";
import AddLocationIcon from "@mui/icons-material/AddLocation";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PieChartOutlineOutlinedIcon from "@mui/icons-material/PieChartOutlineOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import DashboardIcon from "@mui/icons-material/Dashboard";
import IosShareIcon from "@mui/icons-material/IosShare";
import PageviewIcon from "@mui/icons-material/Pageview";
import { ShopOutlined, ShoppingCart, ShopRounded, WifiChannel } from "@mui/icons-material";

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <MenuItem
      active={selected === title}
      style={{ color: colors.grey[100] }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const location = useLocation();

  // Map route pathnames to sidebar item titles
  const pathToTitleMap = {
    "/": "Dashboard",
    "/stock-audit": "Stock Audit",
    "/warehouse-stock": "Wearhouse Stock",
    "/add-product-location": "Add Product Location",
    "/add-locations": "Add Locations",
    "/transfer-stock": "Transfer Stock",
    "/low-stock": "Low Stock",
    "/products": "Product List",
    "/form": "Add Product",
    "/invoices": "Invoices Balances",
    "/faq": "FAQ Page",
    "/bar": "Bar Chart",
    "/pie": "Pie Chart",
    "/line": "Line Chart",
    "/geography": "Geography Chart",
    "/point-of-sale": "Point of Sale",
    "/channels": "Channels",
  };

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState(
    pathToTitleMap[location.pathname] || "Dashboard"
  );

  // Update selected menu on route change
  useEffect(() => {
    const currentTitle = pathToTitleMap[location.pathname];
    if (currentTitle) setSelected(currentTitle);
  }, [location.pathname]);

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
      height="164vh"
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h4" color={colors.grey[100]}>
                  Gristip Software
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="100px"
                  height="100px"
                  src={`../../assets/user.png`}
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  Gristip
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  Admin
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/dashboard"
              icon={<DashboardIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Stock Audit"
              to="/stock-audit"
              icon={<PageviewIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Point of Sale"
              to="/point-of-sale"
              icon={<ShoppingCart />}
              selected={selected}
              setSelected={setSelected}

            />
            <Item
              title="Channels"
              to="/channels"
              icon={<ShopRounded />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Wearhouse
            </Typography>
            <Item
              title="Wearhouse Stock"
              to="/warehouse-stock"
              icon={<InventoryIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Add Product Location"
              to="/add-product-location"
              icon={<AddLocationIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Add Locations"
              to="/add-locations"
              icon={<AddLocationIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Transfer Stock"
              to="/transfer-stock"
              icon={<IosShareIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Data
            </Typography>
            <Item
              title="Low Stock"
              to="/low-stock"
              icon={<TrendingDownIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Product List"
              to="/products"
              icon={<InventoryIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Add Product"
              to="/form"
              icon={<AddIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Invoices Balances"
              to="/invoices"
              icon={<ReceiptOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Pages
            </Typography>
            <Item
              title="FAQ Page"
              to="/faq"
              icon={<HelpOutlineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Charts
            </Typography>
            <Item
              title="Bar Chart"
              to="/bar"
              icon={<BarChartOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Pie Chart"
              to="/pie"
              icon={<PieChartOutlineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Line Chart"
              to="/line"
              icon={<TimelineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Geography Chart"
              to="/geography"
              icon={<MapOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
