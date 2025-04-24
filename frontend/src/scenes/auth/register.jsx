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
import { register } from "../../services/auth_api";
import logo from "../../../public/assets/gristipLogo.png";

const SignUpPage = () => {
  const theme = useTheme();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();

  const handleSignUp = async (values) => {
    const result = await register(values);
    if (result.success) {
      alert("✅ Registration successful!");
      navigate("/login");
    } else {
      alert(`❌ ${result.message}`);
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
                label="Email"
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.username && !!errors.username}
                helperText={touched.username && errors.username}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Mobile Number"
                name="mobile"
                value={values.mobile}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.mobile && !!errors.mobile}
                helperText={touched.mobile && errors.mobile}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.password && !!errors.password}
                helperText={touched.password && errors.password}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.confirmPassword && !!errors.confirmPassword}
                helperText={touched.confirmPassword && errors.confirmPassword}
                sx={{ mb: 3 }}
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

const signupSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  username: yup.string().required("Username is required"),
  mobile: yup
    .string()
    .matches(/^\d{10}$/, "Mobile must be 10 digits")
    .required("Mobile number is required"),
  password: yup.string().min(6).required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

const initialValues = {
  email: "",
  username: "",
  mobile: "",
  password: "",
  confirmPassword: "",
};

export default SignUpPage;
