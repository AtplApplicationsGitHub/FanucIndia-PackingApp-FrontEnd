"use client";

import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import AnimatedPage from "@/app/components/AnimatedPage";
import { Eye, EyeClosed } from "lucide-react";
import { API } from "@/lib/api";

type LoginForm = {
  email: string;
  password: string;
};

function extractErrorMessage(err: any) {
  const data = err?.response?.data;
  if (!data) return "Login failed. Please try again.";
  if (typeof data === "string") return data;
  if (typeof data.message === "string") return data.message;
  if (Array.isArray(data.message)) return data.message.join(", ");
  if (data.error) return data.error;
  return "Invalid Email/Password, Please try again.";
}

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await axios.post(API.AUTH.LOGIN, data);
      const { accessToken, user } = res.data;

      Cookies.set("token", accessToken, { expires: 1 });
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") {
        window.location.replace("/admin/dashboard");
      } else if (user.role === "sales") {
        window.location.replace("/sales/dashboard");
      } else {
        setErrorMsg("Unknown user role.");
      }
    } catch (err: any) {
      setErrorMsg(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted to-background px-4">
        <Card className="w-full max-w-md shadow-xl border border-gray-200 rounded-2xl animate-fade-in">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">
              Welcome Back
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Sign in to your account
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email", { required: true })}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">Email is required</p>
                )}
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password", { required: true })}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeClosed className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">
                    Password is required
                  </p>
                )}
              </div>

              {errorMsg && (
                <p className="text-sm text-destructive text-center">
                  {errorMsg}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>

              <p className="text-xs text-center text-muted-foreground pt-2">
                Admin Demo: admin@fanuc.com / FanucAdmin123 <br /> Sales Demo:
                user1@example.com / testpass123
              </p>
            </form>
            <p className="text-center pt-2 text-sm text-muted-foreground">
              Don't have an account?{" "}
              <a href="/signup" className="text-primary hover:text-primary/80">
                Sign up
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
}
