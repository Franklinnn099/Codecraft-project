// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Shield } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Auth.css';
import CompanyLogo from '../assets/Company logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      const result = await signIn(email, password);

      if (result.success) {
        toast.success("Welcome to Admin Portal", {
          position: "top-center",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          style: {
            background: "rgba(31, 41, 55, 0.95)",
            border: "1px solid #eab308",
            color: "#fff"
          }
        });
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
      toast.error(err.message, {
        position: "top-center",
        theme: "dark"
      });
    } finally {
      // Only stop loading if we are NOT navigating (success case handles navigation)
      // Actually, we should stop loading if there was an error. 
      // If success, we want to keep "Verifying..." or show "Success" until nav.
      // But the toast shows success.
      // Let's stop loading in all cases for now, or maybe keep it true on success?
      // If we set loading false on success, the button goes back to "Access Dashboard"
      // which might look weird while redirecting.
      // Let's check if we have an error.
      // If error, setLoading(false).
      // If success, we can leave it true or set it false.
      // Let's set it false to be safe, the toast covers the delay.
      setLoading(false);
    }
  };

  return (
    <div className="auth-body">
      <ToastContainer />
      <div className="auth-container">
        <div className="curved-shape"></div>
        <div className="curved-shape2"></div>

        {/* Login Form */}
        <div className="form-box Login">
          <div className="flex justify-center mb-4">
             <img src={CompanyLogo} alt="Logo" className="w-24 h-auto drop-shadow-lg" />
          </div>
          <h2>Admin Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-box">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label>Email</label>
              <Mail className="icon" />
            </div>
            <div className="input-box">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label>Password</label>
              <Lock className="icon" />
            </div>
            
            {error && (
              <div className="mt-4 text-red-400 text-sm text-center font-medium">
                {error}
              </div>
            )}

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Access Dashboard"}
            </button>
          </form>
        </div>

        {/* Info Side */}
        <div className="info-content Login">
          <h2>Admin Portal</h2>
          <p>
            Secure access for authorized personnel only.
          </p>
          <div className="mt-4 flex justify-end">
            <Shield className="w-12 h-12 text-yellow-500 opacity-80" />
          </div>
        </div>
      </div>
    </div>
  );
}
