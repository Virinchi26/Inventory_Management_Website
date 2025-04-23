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
import logo from "../../../public/assets/gristipLogo.png";

const SignUpPage = () => {
  const theme = useTheme();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();

  const handleSignUp = async (values) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        alert("✅ Registration successful!");
        navigate("/login");
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("❌ Signup failed. Please try again.");
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
            Sign Up
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Create your account
          </Typography>
        </Box>

        <Formik
          initialValues={initialValues}
          validationSchema={signupSchema}
          onSubmit={handleSignUp}
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
                label="Email"
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={textFieldSx(theme)}
              />

              <TextField
                fullWidth
                variant="outlined"
                label="Name"
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.name && !!errors.name}
                helperText={touched.name && errors.name}
                sx={textFieldSx(theme)}
              />

              <TextField
                fullWidth
                variant="outlined"
                label="Mobile Number"
                name="mobile"
                value={values.mobile}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.mobile && !!errors.mobile}
                helperText={touched.mobile && errors.mobile}
                sx={textFieldSx(theme)}
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
                sx={textFieldSx(theme, true)}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="secondary"
                size="large"
              >
                Sign Up
              </Button>

              <Typography
                variant="body2"
                align="center"
                mt={2}
                sx={{ cursor: "pointer", color: "textSecondary" }}
                onClick={() => navigate("/login")}
              >
                Already have an account? Login
              </Typography>
            </form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

// Validation Schema
const signupSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  name: yup.string().required("Name is required"),
  mobile: yup
    .string()
    .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits")
    .required("Mobile number is required"),
  password: yup.string().min(6).required("Password is required"),
});

// Initial Form Values
const initialValues = {
  email: "",
  name: "",
  mobile: "",
  password: "",
};

// Custom TextField Styling
const textFieldSx = (theme, isLast = false) => ({
  mb: isLast ? 3 : 2,
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
});

export default SignUpPage;
