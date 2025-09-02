"use client";

import { FormProvider, useForm } from "react-hook-form";
import {
  Box,
  Alert,
  Button,
  CircularProgress,
  Typography,
  Link,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import NameField from "@/app/signup/components/NameField";
import EmailField from "@/app/signup/components/EmailField";
import PasswordField from "@/app/signup/components/PasswordField";
import ConfirmPasswordField from "@/app/signup/components/ConfirmPasswordField";
import PasswordStrength from "@/app/signup/components/PasswordStrength";
import { API } from "@/common/lib/api";

export type SignupFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignupForm() {
  const methods = useForm<SignupFormData>({ mode: "onChange" });
  const {
    handleSubmit,
    watch,
    formState: { isValid },
  } = methods;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.post(API.AUTH.SIGNUP, {
        name: data.name,
        email: data.email,
        password: data.password,
        role: "SALES",
      });
      const { accessToken } = res.data;
      Cookies.set("token", accessToken, { expires: 1 });
      localStorage.setItem("token", accessToken);
      setSuccess(true);
    } catch (err) {
      let msg = "Signup failed";
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message || msg;
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  return (
    <FormProvider {...methods}>
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Account created successfully! Redirecting to login...
        </Alert>
      )}
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Box display="flex" flexDirection="column" gap={3} p={3}>
          <NameField disabled={loading} />
          <EmailField disabled={loading} />
          <PasswordField disabled={loading} />
          <PasswordStrength password={password} />
          <ConfirmPasswordField disabled={loading} />
          <Box>
            <Button
              type="submit"
              variant="outlined"
              size="large"
              fullWidth
              disabled={loading || !isValid || password !== confirmPassword}
              sx={() => {
                const mainBlue = "#1877F2";

                return {
                  textTransform: "none",
                  fontWeight: 600,
                  borderWidth: 2,
                  borderColor: mainBlue,
                  color: mainBlue,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "#0d47a1",
                    color: "#ffffff",
                    borderColor: mainBlue,
                  },
                };
              }}
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "REGISTER"
              )}
            </Button>

            <Typography variant="body2" align="center" mt={1}>
              Already have an account?{" "}
              <Link href="/login" underline="hover" color="primary">
                Log in
              </Link>
            </Typography>
          </Box>
        </Box>
      </form>
    </FormProvider>
  );
}
