import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  User,
  Shield,
  RefreshCw,
} from "lucide-react";
import Header from "../components/header";
import Footer from "../components/footer";
import { createMissingCustomerRecord } from "../utils/authUtils";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setShowRecovery(false);

    const startTime = Date.now();

    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) {
        console.error("Login error:", error);

        // Check if it's an invalid credentials error
        if (error.message.includes("Invalid login credentials")) {
          setErrorMessage(
            "Invalid email or password. Please check your credentials and try again."
          );
        } else {
          setErrorMessage(error.message);
        }

        return;
      }

      const loginTime = Date.now() - startTime;
      console.log(`Login completed in ${loginTime}ms`);

      // Show success message briefly before redirect
      setErrorMessage("");

      // Check user role and redirect accordingly
      try {
        console.log("Checking user role for redirect...");

        // Check if user is an admin
        const { data: adminData, error: adminError } = await supabase
          .from("users")
          .select("role, name")
          .eq("id", data.user.id)
          .single();

        if (adminData && adminData.role === "admin") {
          console.log("Admin user detected, redirecting to admin dashboard...");
          setErrorMessage("Welcome Admin! Redirecting to dashboard...");

          // Get the current session
          const { data: sessionData } = await supabase.auth.getSession();
          const accessToken = sessionData?.session?.access_token;
          const refreshToken = sessionData?.session?.refresh_token;

          setTimeout(() => {
            // Pass tokens as URL parameters for auto-login
            const adminUrl = `http://localhost:5000/?access_token=${encodeURIComponent(
              accessToken
            )}&refresh_token=${encodeURIComponent(
              refreshToken
            )}&type=admin_login`;
            window.location.href = adminUrl;
          }, 1000);
        } else {
          console.log("Customer user detected, redirecting to client site...");
          setTimeout(() => {
            navigate("/"); // Client site
          }, 200);
        }
      } catch (roleCheckError) {
        console.error("Error checking user role:", roleCheckError);
        // Fallback to client site if role check fails
        setTimeout(() => {
          navigate("/");
        }, 200);
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverAccount = async () => {
    if (!form.email) {
      setErrorMessage("Please enter your email first");
      return;
    }

    setRecoveryLoading(true);
    setErrorMessage("");

    try {
      // Try to sign in first to verify auth record exists
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });

      if (authError) {
        setErrorMessage(
          "Invalid credentials. Please check your email and password."
        );
        return;
      }

      // Auth successful, now create missing customer record
      const success = await createMissingCustomerRecord(authData.user);

      if (success) {
        setErrorMessage("");
        setShowRecovery(false);

        // Check user role and redirect accordingly (same logic as main login)
        try {
          const { data: adminData } = await supabase
            .from("users")
            .select("role")
            .eq("id", authData.user.id)
            .single();

          if (adminData && adminData.role === "admin") {
            // Get session for admin redirect
            const { data: sessionData } = await supabase.auth.getSession();
            const accessToken = sessionData?.session?.access_token;
            const refreshToken = sessionData?.session?.refresh_token;

            setTimeout(() => {
              const adminUrl = `http://localhost:5000/?access_token=${encodeURIComponent(
                accessToken
              )}&refresh_token=${encodeURIComponent(
                refreshToken
              )}&type=admin_login`;
              window.location.href = adminUrl;
            }, 500);
          } else {
            setTimeout(() => {
              navigate("/"); // Client site
            }, 200);
          }
        } catch (roleCheckError) {
          // Fallback to client site
          setTimeout(() => {
            navigate("/");
          }, 200);
        }
      } else {
        setErrorMessage("Failed to recover account. Please contact support.");
      }
    } catch (err) {
      console.error("Recovery error:", err);
      setErrorMessage("Recovery failed. Please try again or contact support.");
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 text-gray-900 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-green-400 to-yellow-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 right-20 w-40 h-40 bg-gradient-to-r from-yellow-400 to-green-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-gradient-to-r from-green-300 to-yellow-300 rounded-full blur-2xl animate-bounce"></div>
      </div>

      <Header />
      <main
        className={`relative z-10 flex items-center justify-center px-4 py-20 transition-all duration-700 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-100 p-8 relative overflow-hidden">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-yellow-500 rounded-2xl mb-4">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">
                Sign in to your Expert Office Furnish account
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-6 flex items-center gap-3 text-red-600 font-medium p-4 bg-red-50 rounded-2xl border border-red-200 animate-fadeIn">
                <AlertCircle className="w-5 h-5" />
                {errorMessage}
              </div>
            )}

            {/* Recovery Option */}
            {showRecovery && (
              <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <p className="text-sm text-blue-700 mb-3">
                  Your account exists but is missing profile data. Click below
                  to recover your account:
                </p>
                <button
                  type="button"
                  onClick={handleRecoverAccount}
                  disabled={recoveryLoading}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {recoveryLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Recovering Account...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Recover Account
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Mail className="w-4 h-4 mr-2 text-green-600" />
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:outline-none transition-all duration-300 bg-white/70 hover:bg-white/90 focus:bg-white disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Lock className="w-4 h-4 mr-2 text-green-600" />
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:outline-none transition-all duration-300 bg-white/70 hover:bg-white/90 focus:bg-white disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full group relative px-8 py-4 bg-gradient-to-r from-green-600 to-yellow-600 text-white rounded-2xl font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                      Sign In
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-yellow-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-green-600 hover:text-green-700 font-semibold hover:underline transition-colors"
                >
                  Create one now
                </Link>
              </p>
            </div>

            {/* Account Types Info */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-2xl">
                <User className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-green-700">
                  Customer Account
                </p>
                <p className="text-xs text-gray-600">Shop & Browse</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-2xl">
                <Shield className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-yellow-700">
                  Admin Account
                </p>
                <p className="text-xs text-gray-600">Dashboard Access</p>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-green-200 to-yellow-200 rounded-full opacity-50"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-yellow-200 to-green-200 rounded-full opacity-50"></div>
          </div>

          {/* Benefits Section */}
          <div className="mt-8 text-center">
            <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
              <div>
                <Sparkles className="w-4 h-4 mx-auto mb-1 text-green-500" />
                <p>Premium Experience</p>
              </div>
              <div>
                <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                <p>Secure & Trusted</p>
              </div>
              <div>
                <ArrowRight className="w-4 h-4 mx-auto mb-1 text-green-500" />
                <p>Easy Access</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
