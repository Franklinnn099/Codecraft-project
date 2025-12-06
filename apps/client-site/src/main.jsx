import { StrictMode } from "react";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/home";
import ShopPage from "./pages/ShopPage";
import ContactPage from "./pages/ContactPage";
import AuthPage from "./pages/AuthPage";
import Profile from "./pages/Profile";
import ProfileWrapper from "./components/ProfileWrapper";
import UserManagement from "./pages/UserManagement";
import DebugAuth from "./pages/DebugAuth";
import SimpleAuth from "./pages/SimpleAuth";
import "./index.css";
import CartPage from "./pages/CartPage";
import OurServicesPage from "./pages/OurServices";
import InteriorDecor from "./pages/InteriorDecor";
import Gallery from "./pages/Gallery";
import ProductInquiry from "./pages/InquiryPage";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProductPage from "./pages/ProductPage";
import NewsletterForm from "./pages/NewsletterForm";
import BlogList from "./pages/BlogList";
import BlogDetail from "./pages/BlogDetail";
import { backgroundPrefetch } from "./utils/prefetch";
import ErrorBoundary from "./components/ErrorBoundary";
import OfflineIndicator from "./components/OfflineIndicator";
import { registerServiceWorker } from "./utils/serviceWorker";

// ProtectedRoute component
const ProtectedRoute = ({ children, showLoginPage = false }) => {
  const { user, loading } = useAuth();
  const [showQuickAccess, setShowQuickAccess] = React.useState(false);

  // Show quick access after 1 second if still loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setShowQuickAccess(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-yellow-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-4">Logging you in...</p>
          {showQuickAccess && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Taking longer than expected?
              </p>
              <div className="space-x-4">
                <a
                  href="/login"
                  className="text-green-600 hover:underline text-sm"
                >
                  Try Login Again
                </a>
                <a href="/" className="text-green-600 hover:underline text-sm">
                  Go Home
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    if (showLoginPage) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 flex items-center justify-center">
          <div className="backdrop-blur-lg bg-white/80 rounded-3xl shadow-2xl border border-white/50 p-8 text-center max-w-md">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Login Required
            </h1>
            <p className="text-gray-600 mb-8">
              You need to be logged in to access your profile.
            </p>
            <div className="space-y-4">
              <a
                href="/login"
                className="block w-full bg-gradient-to-r from-green-500 to-yellow-500 text-white py-3 px-6 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
              >
                Sign In
              </a>
              <a
                href="/signup"
                className="block w-full border-2 border-green-500 text-green-600 py-3 px-6 rounded-full font-semibold hover:bg-green-50 transition-all duration-300"
              >
                Create Account
              </a>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="text-center py-16">
        You must log in to access this page.
      </div>
    );
  }
  return children;
};

const root = createRoot(document.getElementById("root"));

// Start background prefetching for instant loading
backgroundPrefetch();

// Register service worker for offline support and caching
registerServiceWorker();

root.render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router>
            <OfflineIndicator />
            <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/home" element={<Homepage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute showLoginPage={true}>
                  <ProfileWrapper />
                </ProtectedRoute>
              }
            />
            {/* Public Route: Cart Page */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/services" element={<OurServicesPage />} />
            <Route path="/interior-decor" element={<InteriorDecor />} />
            <Route path="/inquiry" element={<ProductInquiry />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/test-product" element={<ProductPage />} />
            <Route path="/newsletter" element={<NewsletterForm />} />
            <Route path="/debug" element={<DebugAuth />} />
            <Route path="/simple-auth" element={<SimpleAuth />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <UserManagement />
                </ProtectedRoute>
              }
            />

            <Route path="/products/:id" element={<ProductPage />} />
            <Route
              path="*"
              element={
                <div className="text-center py-16">404 - Page Not Found</div>
              }
            />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  </ErrorBoundary>
  </StrictMode>
);
