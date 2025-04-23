import React from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import logo from "../../../public/assets/gristipLogo.png"; // ✅ Make sure logo is in src/assets folder

const LoginPage = () => {
  const theme = useTheme();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        alert("✅ Login successful!");
        navigate("/"); // 🔁 Redirect to dashboard or landing page
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("❌ Login failed. Please try again.");
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor={theme.palette.background.default}
    >
      <Paper
        elevation={6}
        sx={{
          width: isNonMobile ? "400px" : "90%",
          p: 4,
          borderRadius: "12px",
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Box textAlign="center" mb={3}>
          <img src={logo} alt="Gristip Logo" style={{ height: 60 }} />
          <Typography
            variant="h4"
            fontWeight="600"
            mt={1}
            color={theme.palette.secondary.main}
          >
            Log In
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Sign in to continue
          </Typography>
        </Box>

        <Formik
          initialValues={initialValues}
          validationSchema={loginSchema}
          onSubmit={handleLogin}
        >
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
            handleSubmit,
          }) => (
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                variant="outlined"
                label="Username"
                name="username"
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.username && !!errors.username}
                helperText={touched.username && errors.username}
                sx={{
                  mb: 2,
                  "& .MuiInputLabel-root": {
                    color: theme.palette.text.primary,
                  },
                  "& .MuiOutlinedInput-root": {
                    color: theme.palette.text.primary,
                    "& fieldset": {
                      borderColor: theme.palette.text.primary,
                    },
                    "&:hover fieldset": {
                      borderColor: theme.palette.secondary.main,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: theme.palette.secondary.main,
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                variant="outlined"
                label="Password"
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.password && !!errors.password}
                helperText={touched.password && errors.password}
                sx={{
                  mb: 2,
                  "& .MuiInputLabel-root": {
                    color: theme.palette.text.primary,
                  },
                  "& .MuiOutlinedInput-root": {
                    color: theme.palette.text.primary,
                    "& fieldset": {
                      borderColor: theme.palette.text.primary,
                    },
                    "&:hover fieldset": {
                      borderColor: theme.palette.secondary.main,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: theme.palette.secondary.main,
                    },
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="secondary"
                size="large"
              >
                Login
              </Button>

              <Typography
                variant="body2"
                align="center"
                mt={2}
                sx={{ cursor: "pointer", color: "textSecondary" }}
                onClick={() => navigate("/register")}
              >
                Don't have an account? Sign up
              </Typography>
            </form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

const loginSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
});

const initialValues = {
  username: "",
  password: "",
};

export default LoginPage;
