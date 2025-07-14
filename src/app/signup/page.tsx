"use client";

import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { CheckCircle, XCircle, Eye, EyeClosed, Loader2 } from "lucide-react";
import AnimatedPage from "@/app/components/AnimatedPage";
import { API } from "@/lib/api";

type SignupForm = {
  email: string;
  password: string;
  confirmPassword: string;
};

const passwordChecks = [
  {
    label: "At least 8 characters",
    check: (pw: string) => pw.length >= 8,
  },
  {
    label: "At least 2 special characters (!@#$%^&*)",
    check: (pw: string) => (pw.match(/[!@#$%^&*]/g) || []).length >= 2,
  },
  {
    label: "At least 2 numbers",
    check: (pw: string) => (pw.match(/\d/g) || []).length >= 2,
  },
  {
    label: "At least 1 uppercase letter",
    check: (pw: string) => /[A-Z]/.test(pw),
  },
];

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupForm>();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Email validation
  const [emailStatus, setEmailStatus] = useState<
    null | "checking" | "available" | "exists" | "error"
  >(null);

  const router = useRouter();
  const password = watch("password") || "";
  const confirmPassword = watch("confirmPassword") || "";
  const email = watch("email") || "";

  // Password validation logic
  const passwordStatus = passwordChecks.map(({ check }) => check(password));
  const allSatisfied = passwordStatus.every(Boolean);
  const passwordsMatch =
    password && confirmPassword && password === confirmPassword;

  // Success toast effect
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  // --- Email existence check (debounced) ---
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    // Only run if there is some email and it is valid format
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailStatus(null);
      return;
    }
    setEmailStatus("checking");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        // Your backend API to check email existence. (Adjust endpoint as per your API.)
        const res = await axios.get(API.AUTH.CHECK_EMAIL(email));
        if (res.data.exists) setEmailStatus("exists");
        else setEmailStatus("available");
      } catch {
        setEmailStatus("error");
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [email]);

  // --- Submission ---
  const onSubmit = async (data: SignupForm) => {
    if (!allSatisfied || !passwordsMatch || emailStatus !== "available") return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.post(API.AUTH.SIGNUP, {
        email: data.email,
        password: data.password,
        role: "sales",
      });
      const { accessToken } = res.data;
      Cookies.set("token", accessToken, { expires: 1 });
      localStorage.setItem("token", accessToken);
      setSuccess(true);
    } catch (err: unknown) {
      let errorMsg = "Signup failed";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.message || errorMsg;
      }
      setErrorMsg(errorMsg);
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
              Create an Account
            </CardTitle>
            <p className="mt-1 text-muted-foreground text-sm">
              Signup as a Sales User
            </p>
          </CardHeader>
          <CardContent>
            {/* Toast message */}
            {success && (
              <div className="fixed top-6 left-0 right-0 mx-auto flex justify-center z-50">
                <div className="bg-green-100 border border-green-300 text-green-700 px-6 py-3 rounded-xl shadow-xl font-medium animate-fade-in">
                  Account created successfully!
                </div>
              </div>
            )}
            {errorMsg && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder="you@example.com"
                    {...register("email", { required: true })}
                    disabled={loading}
                  />
                  {/* Status icon/label right side */}
                  {email && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {emailStatus === "checking" && (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      )}
                      {emailStatus === "available" && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      {emailStatus === "exists" && (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                      {emailStatus === "error" && (
                        <XCircle className="w-4 h-4 text-orange-500" />
                      )}
                    </span>
                  )}
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">Email is required</p>
                )}
                {emailStatus === "exists" && (
                  <p className="text-sm text-destructive">
                    Email already exists
                  </p>
                )}
                {emailStatus === "available" && (
                  <p className="text-sm text-green-600">
                    Email can be registered
                  </p>
                )}
                {emailStatus === "error" && (
                  <p className="text-sm text-orange-600">
                    Could not validate email
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2 relative">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    {...register("password", { required: true })}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-primary"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeClosed className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {/* Password requirements */}
                <div className="mt-2 space-y-1 text-[13px]">
                  {passwordChecks.map(({ label }, i) => (
                    <div key={label} className="flex items-center gap-2">
                      {passwordStatus[i] ? (
                        <CheckCircle className="text-green-600 w-4 h-4" />
                      ) : (
                        <XCircle className="text-destructive w-4 h-4" />
                      )}
                      <span
                        className={
                          passwordStatus[i]
                            ? "text-green-700"
                            : "text-destructive"
                        }
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                  {allSatisfied && password && (
                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircle className="text-green-600 w-5 h-5" />
                      <span className="font-semibold text-green-700">
                        All password conditions satisfied!
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2 relative">
                <Label htmlFor="confirmPassword">Retype Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    {...register("confirmPassword", { required: true })}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-primary"
                    tabIndex={-1}
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    {showConfirm ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeClosed className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-sm text-destructive">
                    Passwords do not match
                  </p>
                )}
                {confirmPassword && passwordsMatch && allSatisfied && (
                  <p className="text-green-600 text-sm flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Passwords match!
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  loading ||
                  !allSatisfied ||
                  !passwordsMatch ||
                  emailStatus !== "available"
                }
              >
                {loading ? "Creating..." : "Sign Up"}
              </Button>
            </form>

            <p className="text-center pt-2 text-sm text-muted-foreground">
              Already have an account?{" "}
              <a href="/login" className="text-primary hover:text-primary/80">
                Log in
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
}
