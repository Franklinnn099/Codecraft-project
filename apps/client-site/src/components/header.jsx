import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Search,
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  Star,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { supabase } from "../supabase/supabaseClient";
import debounce from "lodash.debounce";
import ThemeToggle from "./ThemeToggle";

export default function Header({ forceOpaque = false }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("");
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { cartItems } = useCart();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    // Initialize scroll state based on current position or forceOpaque
    if (forceOpaque) {
      setIsScrolled(true);
    } else {
      setIsScrolled(window.scrollY > 20);
      window.addEventListener("scroll", handleScroll);
    }
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [forceOpaque]);

  // Fetch current user on mount
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data?.user || null;
      setUser(currentUser);
      setEmailConfirmed(currentUser?.email_confirmed_at !== null);
      setRole(currentUser?.user_metadata?.role || "Customer");

      // Fetch user's name from the database
      if (currentUser) {
        // First try to get from users table (admin)
        const { data: adminData } = await supabase
          .from("users")
          .select("name, role")
          .eq("id", currentUser.id)
          .single();

        if (adminData) {
          setUserName(
            adminData.name || currentUser.email?.split("@")[0] || "User"
          );
          setRole(adminData.role || "Admin");
        } else {
          // Try customers table
          try {
            const { data: customerData, error } = await supabase
              .from("customers")
              .select("name")
              .eq("id", currentUser.id)
              .maybeSingle(); // Use maybeSingle instead of single to handle missing records

            if (!error && customerData) {
              setUserName(
                customerData.name || currentUser.email?.split("@")[0] || "User"
              );
              setRole("Customer");
            } else {
              // Fallback if customer doesn't exist
              setUserName(currentUser.email?.split("@")[0] || "User");
              setRole("Customer");
            }
          } catch (err) {
            console.warn("Customer lookup failed:", err);
            setUserName(currentUser.email?.split("@")[0] || "User");
            setRole("Customer");
          }
        }
      }
    };
    getUser();

    // Listen for auth state changes
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          setEmailConfirmed(session.user?.email_confirmed_at !== null);
          setRole(session.user?.user_metadata?.role || "Customer");

          // Fetch updated user name
          // First try to get from users table (admin)
          const { data: adminData } = await supabase
            .from("users")
            .select("name, role")
            .eq("id", session.user.id)
            .single();

          if (adminData) {
            setUserName(
              adminData.name || session.user.email?.split("@")[0] || "User"
            );
            setRole(adminData.role || "Admin");
          } else {
            // Try customers table
            try {
              const { data: customerData, error } = await supabase
                .from("customers")
                .select("name")
                .eq("id", session.user.id)
                .maybeSingle(); // Use maybeSingle instead of single

              if (!error && customerData) {
                setUserName(
                  customerData.name ||
                    session.user.email?.split("@")[0] ||
                    "User"
                );
                setRole("Customer");
              } else {
                // Fallback if customer doesn't exist
                setUserName(session.user.email?.split("@")[0] || "User");
                setRole("Customer");
              }
            } catch (err) {
              console.warn("Customer lookup failed:", err);
              setUserName(session.user.email?.split("@")[0] || "User");
              setRole("Customer");
            }
          }
        } else {
          setUser(null);
          setUserName("");
          setRole("");
        }
      }
    );

    return () => {
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  // Logout
  const handleLogout = async () => {
    console.log('Logout initiated...');
    
    // Clear state immediately for better UX
    setUser(null);
    setUserName("");
    setRole("");
    setEmailConfirmed(false);
    setShowDropdown(false);
    
    try {
      await supabase.auth.signOut();
      console.log('Supabase signOut successful');
    } catch (err) {
      console.error('Logout error (continuing anyway):', err);
    }
    
    // Force redirect using window.location for guaranteed navigation
    window.location.href = "/login";
  };

  // Debounced global search (products & blogs)
  const handleSearch = debounce(async (term) => {
    if (!term.trim()) return setSearchResults([]);
    const { data: products } = await supabase
      .from("products")
      .select("id, name")
      .ilike("name", `%${term}%`);

    const { data: blogs } = await supabase
      .from("blogs")
      .select("id, title")
      .ilike("title", `%${term}%`);

    setSearchResults([
      ...products.map((p) => ({ id: p.id, label: p.name, type: "product" })),
      ...blogs.map((b) => ({ id: b.id, label: b.title, type: "blog" })),
    ]);
  }, 400);

  useEffect(() => {
    handleSearch(searchTerm);
  }, [searchTerm]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-lg shadow-xl border-b border-green-100/50"
          : "bg-black/20 backdrop-blur-md"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Enhanced Logo */}
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <img
                src="/Logo.png"
                alt="Expert Office Logo"
                className="h-10 sm:h-12 transition-all duration-300 group-hover:scale-105 drop-shadow-lg"
              />
              <div className="absolute -inset-3 bg-gradient-to-r from-green-400/20 to-yellow-400/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="ml-3 hidden sm:block">
              <h1
                className={`text-xl font-bold transition-all duration-300 ${
                  isScrolled
                    ? "bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent"
                    : "text-white drop-shadow-lg"
                }`}
              >
                Expert Office Furnish
              </h1>
              <p
                className={`text-xs font-medium transition-all duration-300 ${
                  isScrolled ? "text-gray-500" : "text-white/80 drop-shadow-md"
                }`}
              >
                Premium Furniture
              </p>
            </div>
          </Link>

          {/* Desktop Navigation - Interactive Hover Reveal */}
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { name: "Home", path: "/home" },
              { name: "Products", path: "/shop" },
              { name: "Gallery", path: "/gallery" },
              { name: "Our Services", path: "/services" },
              { name: "Blog", path: "/blog" },
            ].map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="group relative h-8 overflow-hidden"
              >
                <div className="flex flex-col transition-transform duration-300 group-hover:-translate-y-8">
                  <span
                    className={`h-8 flex items-center font-bold text-sm tracking-wide ${
                      isScrolled ? "text-gray-800" : "text-white"
                    }`}
                  >
                    {item.name}
                  </span>
                  <span className="h-8 flex items-center font-bold text-sm tracking-wide text-green-500">
                    {item.name}
                  </span>
                </div>
                <span
                  className={`absolute bottom-0 left-0 w-full h-0.5 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${
                    isScrolled ? "bg-green-500" : "bg-yellow-400"
                  }`}
                ></span>
              </Link>
            ))}
          </nav>

          {/* Right-side icons */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Modern Search */}
            <div className="relative">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-105 border ${
                  isScrolled
                    ? "bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-600 border-gray-200 hover:border-green-300"
                    : "bg-white/10 text-white hover:bg-white/20 hover:text-yellow-200 border-white/20 hover:border-white/40 drop-shadow-lg"
                }`}
              >
                <Search className="w-5 h-5" />
              </button>

              {showSearch && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white/95 backdrop-blur-lg text-gray-800 p-4 rounded-2xl shadow-2xl border border-green-100 animate-fadeIn">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products or blogs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-3 text-sm border border-green-200 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                    />
                    <Search className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" />
                  </div>
                  {searchResults.length > 0 && (
                    <div className="mt-3 max-h-60 overflow-y-auto">
                      {searchResults.map((result) => (
                        <div
                          key={`${result.type}-${result.id}`}
                          onClick={() => {
                            navigate(`/${result.type}/${result.id}`);
                            setSearchTerm("");
                            setShowSearch(false);
                          }}
                          className="flex items-center justify-between p-3 hover:bg-green-50 cursor-pointer rounded-xl transition-all duration-300 group"
                        >
                          <span className="text-gray-700 group-hover:text-green-600 font-medium">
                            {result.label}
                          </span>
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">
                            {result.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Modern Cart */}
            <Link to="/cart" className="relative group">
              <div
                className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-105 border ${
                  isScrolled
                    ? "bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-600 border-gray-200 hover:border-green-300"
                    : "bg-white/10 text-white hover:bg-white/20 hover:text-yellow-200 border-white/20 hover:border-white/40 drop-shadow-lg"
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItems.length > 0 && (
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                    {cartItems.length}
                  </div>
                )}
              </div>
            </Link>

            {/* Modern User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-105 border ${
                  isScrolled
                    ? "bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-600 border-gray-200 hover:border-green-300"
                    : "bg-white/10 text-white hover:bg-white/20 hover:text-yellow-200 border-white/20 hover:border-white/40 drop-shadow-lg"
                }`}
              >
                <User className="w-5 h-5" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-lg text-gray-800 rounded-2xl shadow-2xl border border-green-100 overflow-hidden animate-fadeIn">
                  {user ? (
                    <>
                      {/* Username Section */}
                      <div className="px-4 py-4 border-b border-green-100 bg-gradient-to-r from-green-50 to-yellow-50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
                              {userName.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                              <Sparkles size={8} className="text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-800">
                              {userName}
                            </div>
                            <div className="text-xs text-gray-600">
                              {user.email}
                            </div>
                          </div>
                          {emailConfirmed && (
                            <CheckCircle2
                              className="text-green-500"
                              size={18}
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-xs text-gray-600 font-medium">
                            {role}
                          </span>
                        </div>
                      </div>

                      {/* Profile Link */}
                      <Link
                        to="/profile"
                        className="w-full block px-4 py-3 hover:bg-green-50 transition-colors duration-200"
                        onClick={() => setShowDropdown(false)}
                      >
                        <div className="flex items-center gap-3">
                          <User size={18} className="text-green-600" />
                          <span className="text-gray-700 font-medium">
                            Profile
                          </span>
                        </div>
                      </Link>

                      {/* Logout Button */}
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors duration-200 flex items-center gap-3 text-red-600 border-t border-gray-100"
                      >
                        <LogOut size={18} />
                        <span className="font-medium">Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-3 hover:bg-green-50 transition-colors duration-200 text-gray-700 font-medium"
                        onClick={() => setShowDropdown(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        className="block px-4 py-3 hover:bg-green-50 transition-colors duration-200 text-gray-700 font-medium"
                        onClick={() => setShowDropdown(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Modern Contact Button */}
            <Link to="/contact">
              <button
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  isScrolled
                    ? "bg-gradient-to-r from-green-500 to-yellow-500 text-white hover:from-green-600 hover:to-yellow-600 border border-green-400"
                    : "bg-gradient-to-r from-green-400 to-yellow-400 text-white hover:from-green-500 hover:to-yellow-500 border border-white/30 drop-shadow-lg"
                }`}
              >
                <span className="hidden sm:inline">Contact Us</span>
                <span className="sm:hidden">Call</span>
              </button>
            </Link>

            {/* Modern Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`lg:hidden p-2.5 rounded-xl transition-all duration-300 hover:scale-105 border ${
                isScrolled
                  ? "bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-600 border-gray-200 hover:border-green-300"
                  : "bg-white/10 text-white hover:bg-white/20 hover:text-yellow-200 border-white/20 hover:border-white/40 drop-shadow-lg"
              }`}
            >
              {showMobileMenu ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden bg-white/95 backdrop-blur-lg border-t border-green-100 animate-slideDown">
            <div className="py-4 space-y-2">
              <Link
                to="/home"
                className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200 font-medium rounded-xl mx-2"
                onClick={() => setShowMobileMenu(false)}
              >
                Home
              </Link>
              <Link
                to="/shop"
                className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200 font-medium rounded-xl mx-2"
                onClick={() => setShowMobileMenu(false)}
              >
                Products
              </Link>
              <Link
                to="/gallery"
                className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200 font-medium rounded-xl mx-2"
                onClick={() => setShowMobileMenu(false)}
              >
                Gallery
              </Link>
              <Link
                to="/services"
                className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200 font-medium rounded-xl mx-2"
                onClick={() => setShowMobileMenu(false)}
              >
                Our Services
              </Link>
              <Link
                to="/blog"
                className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200 font-medium rounded-xl mx-2"
                onClick={() => setShowMobileMenu(false)}
              >
                Blog
              </Link>

              {/* Profile Link for Mobile - only show if user is logged in */}
              {user && (
                <Link
                  to="/profile"
                  className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200 font-medium rounded-xl mx-2 border-t border-gray-200 mt-2 pt-4"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-green-600" />
                    Profile ({userName})
                  </div>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
