import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { User, Mail, Lock, LogIn, UserPlus } from "lucide-react";
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

  useEffect(() => {
    // Check if we should default to signup
    if (location.pathname === "/signup") {
      setIsActive(true);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      toast.success(
        <div className="flex flex-col items-center">
          <span className="font-bold text-lg">Login Successful!</span>
          <span className="text-sm">Welcome back to Expert Office Furnish</span>
        </div>, 
        {
          icon: "🎉",
          style: {
            borderRadius: "15px",
            background: "rgba(31, 41, 55, 0.9)",
            color: "#fff",
            border: "1px solid #22c55e",
            backdropFilter: "blur(10px)",
            padding: "16px",
          },
          duration: 2000,
        }
      );

      // Check if admin
      const { data: adminData } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      setTimeout(() => {
        if (adminData && adminData.role === "admin") {
          window.location.href = "http://localhost:5000"; // Redirect to admin dashboard
        } else {
          navigate("/");
        }
      }, 1500);
    } catch (error) {
      toast.error(error.message || "Login failed", {
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
      const { data, error } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: {
            name: regUsername,
            role: "customer",
          },
        },
      });

      if (error) throw error;

      toast.success(
        <div className="flex flex-col items-center">
          <span className="font-bold text-lg">Account Created!</span>
          <span className="text-sm">Please check your email to verify.</span>
        </div>,
        {
          icon: "✉️",
          duration: 5000,
          style: {
            borderRadius: "15px",
            background: "rgba(31, 41, 55, 0.9)",
            color: "#fff",
            border: "1px solid #eab308",
            backdropFilter: "blur(10px)",
            padding: "16px",
          },
        }
      );
      
      // Optional: Switch to login view
      setTimeout(() => {
        setIsActive(false);
      }, 2000);

    } catch (error) {
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
      <Toaster position="top-center" reverseOrder={false} />
      
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
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <label>Password</label>
              <Lock className="icon" />
            </div>
            <div className="input-box animation" style={{ "--S": 3, "--D": 24 }}>
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? "Loading..." : "Login"}
              </button>
            </div>
            <div className="regi-link animation" style={{ "--S": 4, "--D": 25 }}>
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
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
              <label>Password</label>
              <Lock className="icon" />
            </div>
            <div className="input-box animation" style={{ "--S": 21, "--D": 4 }}>
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? "Loading..." : "Register"}
              </button>
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
    </div>
  );
}
