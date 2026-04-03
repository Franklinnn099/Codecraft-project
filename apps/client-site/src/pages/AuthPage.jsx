import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { User, Mail, Lock, LogIn, UserPlus, KeyRound, ArrowLeft, Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import "../Auth.css";
import CompanyLogo from "../assets/Company logo.png";

export default function AuthPage() {
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Login Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register Form State
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Forgot Password State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  // Password Visibility State
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  useEffect(() => {
    // Check if we should default to signup
    if (location.pathname === "/signup") {
      setIsActive(true);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log('Login attempt with:', loginEmail);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      toast.success('🎉 Login Successful! Welcome back.', {
        duration: 3000,
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });

      // Check if admin
      const { data: adminData } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      setTimeout(() => {
        if (adminData && (adminData.role === "admin" || adminData.role === "super_admin")) {
          window.location.href = "https://expertofficefurnish.com/admin"; // Redirect to admin dashboard
        } else {
          navigate("/");
        }
      }, 1500);
    } catch (error) {
      console.error('Caught error:', error);
      toast.error(error.message || "Login failed. Please check your credentials.", {
        duration: 5000,
        style: {
          borderRadius: "10px",
          background: "#ef4444",
          color: "#fff",
          fontWeight: "500",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success(
        <div className="flex flex-col items-center">
          <span className="font-bold text-lg">Reset Email Sent!</span>
          <span className="text-sm">Check your inbox for the reset link.</span>
        </div>,
        {
          icon: "📧",
          duration: 5000,
          style: {
            borderRadius: "15px",
            background: "rgba(31, 41, 55, 0.9)",
            color: "#fff",
            border: "1px solid #22c55e",
            backdropFilter: "blur(10px)",
            padding: "16px",
          },
        }
      );
      
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error) {
      toast.error(error.message || "Failed to send reset email", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Starting registration for:', regEmail);
      
      // Add timeout to prevent infinite loading (increased to 60s for slow connections/SMTP retries)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout - please check your internet connection')), 60000)
      );
      
      const signupPromise = supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: {
            name: regUsername,
            role: "customer",
          },
        },
      });
      
      const { data, error } = await Promise.race([signupPromise, timeoutPromise]);

      console.log('Signup response:', { data, error });

      if (error) {
        // Handle "already registered" error specially
        if (error.message.includes("already registered") || error.message.includes("already exists")) {
          toast.error(
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg">Email Already Registered</span>
              <span className="text-sm">Try logging in instead, or use forgot password.</span>
            </div>,
            {
              icon: "⚠️",
              duration: 5000,
              style: {
                borderRadius: "15px",
                background: "rgba(31, 41, 55, 0.9)",
                color: "#fff",
                border: "1px solid #f59e0b",
                backdropFilter: "blur(10px)",
                padding: "16px",
              },
            }
          );
          // Switch to login view
          setLoading(false);
          setTimeout(() => {
            setIsActive(false);
          }, 1500);
          return;
        }
        throw error;
      }

      // Check if user was actually created (Supabase returns user even if email exists in some configs)
      if (data?.user?.identities?.length === 0) {
        toast.error(
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg">Email Already Registered</span>
            <span className="text-sm">Please try logging in instead.</span>
          </div>,
          {
            icon: "⚠️",
            duration: 5000,
            style: {
              borderRadius: "15px",
              background: "rgba(31, 41, 55, 0.9)",
              color: "#fff",
              border: "1px solid #f59e0b",
              backdropFilter: "blur(10px)",
              padding: "16px",
            },
          }
        );
        setLoading(false);
        setTimeout(() => {
          setIsActive(false);
        }, 1500);
        return;
      }

      console.log('User created successfully');

      // Show Success Message IMMEDIATELY
      toast.success('✅ Account Created! Welcome to Expert Office Furnish!', {
        duration: 5000,
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });

      // Send Welcome Email via Backend API (fire and forget)
      fetch('http://localhost:5050/api/email/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, name: regUsername }),
      }).then(res => res.json())
        .then(data => console.log('Welcome email sent:', data))
        .catch(err => console.warn('Email error:', err));
      
      // Switch to login view shortly after
      setTimeout(() => {
        setIsActive(false);
        setRegEmail("");
        setRegPassword("");
        setRegUsername("");
      }, 2000);

    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body">
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        containerStyle={{
          zIndex: 99999,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      <div className={`auth-container ${isActive ? "active" : ""}`}>
        <div className="curved-shape"></div>
        <div className="curved-shape2"></div>

        {/* Login Form */}
        <div className="form-box Login">
          <div className="flex justify-center mb-4 animation" style={{ "--S": 0, "--D": 21 }}>
             <img src={CompanyLogo} alt="Logo" className="w-24 h-auto drop-shadow-lg" />
          </div>
          <h2 className="animation" style={{ "--S": 0, "--D": 21 }}>
            Login
          </h2>
          <form onSubmit={handleLogin}>
            <div className="input-box animation" style={{ "--S": 1, "--D": 22 }}>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              <label>Email</label>
              <Mail className="icon" />
            </div>
            <div className="input-box animation" style={{ "--S": 2, "--D": 23 }}>
              <input
                type={showLoginPassword ? "text" : "password"}
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <label>Password</label>
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="password-toggle"
                style={{ position: 'absolute', right: '45px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '5px', color: '#888' }}
              >
                {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <Lock className="icon" />
            </div>
            <div className="input-box animation" style={{ "--S": 3, "--D": 24 }}>
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? "Loading..." : "Login"}
              </button>
            </div>
            <div className="regi-link animation" style={{ "--S": 4, "--D": 25 }}>
              <p>
                <a href="#" onClick={(e) => { e.preventDefault(); setShowForgotPassword(true); }} className="text-yellow-500 hover:text-yellow-400">
                  Forgot Password?
                </a>
              </p>
            </div>
            <div className="regi-link animation" style={{ "--S": 5, "--D": 26 }}>
              <p>
                Don't have an account?{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); setIsActive(true); }}>
                  Sign Up
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* Login Info (Right Side) */}
        <div className="info-content Login">
          <h2 className="animation" style={{ "--S": 0, "--D": 20 }}>
            Welcome Back!
          </h2>
          <p className="animation" style={{ "--S": 1, "--D": 21 }}>
            Expert Office Furnish - Premium furniture for your workspace.
          </p>
        </div>

        {/* Register Form */}
        <div className="form-box Register">
          <div className="flex justify-center mb-4 animation" style={{ "--S": 17, "--D": 0 }}>
             <img src={CompanyLogo} alt="Logo" className="w-24 h-auto drop-shadow-lg" />
          </div>
          <h2 className="animation" style={{ "--S": 17, "--D": 0 }}>
            Sign Up
          </h2>
          <form onSubmit={handleRegister}>
            <div className="input-box animation" style={{ "--S": 18, "--D": 1 }}>
              <input
                type="text"
                required
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
              />
              <label>Username</label>
              <User className="icon" />
            </div>
            <div className="input-box animation" style={{ "--S": 19, "--D": 2 }}>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
              <label>Email</label>
              <Mail className="icon" />
            </div>
            <div className="input-box animation" style={{ "--S": 20, "--D": 3 }}>
              <input
                type={showRegPassword ? "text" : "password"}
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
              <label>Password</label>
              <button
                type="button"
                onClick={() => setShowRegPassword(!showRegPassword)}
                className="password-toggle"
                style={{ position: 'absolute', right: '45px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '5px', color: '#888' }}
              >
                {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <Lock className="icon" />
            </div>
            <div className="input-box animation" style={{ "--S": 21, "--D": 4 }}>
              <button className="auth-btn" type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                {loading ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '3px solid rgba(255,255,255,0.3)',
                      borderTop: '3px solid #fff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    <span>Creating Account...</span>
                  </>
                ) : "Register"}
              </button>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
            <div className="regi-link animation" style={{ "--S": 22, "--D": 5 }}>
              <p>
                Already have an account?{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); setIsActive(false); }}>
                  Login
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* Register Info (Left Side) */}
        <div className="info-content Register">
          <h2 className="animation" style={{ "--S": 17, "--D": 0 }}>
            Join Us!
          </h2>
          <p className="animation" style={{ "--S": 18, "--D": 1 }}>
            Create an account to shop exclusive deals and track your orders.
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => { setShowForgotPassword(false); setResetEmail(""); }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleForgotPassword}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <KeyRound size={18} />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
              Remember your password?{" "}
              <button
                onClick={() => { setShowForgotPassword(false); setResetEmail(""); }}
                className="text-yellow-600 hover:text-yellow-700 font-medium"
              >
                Back to Login
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
