import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Star,
  BookOpen,
  Calendar,
  ChevronRight,
  X,
  Gift,
  Mail,
  Percent,
  Clock,
} from "lucide-react";
import { supabase } from "../supabase/supabaseClient";
import dataCache, { CACHE_KEYS } from "../utils/dataCache";
import NewsletterToast from "../components/NewsletterToast";

import heroImage from "../assets/chairs1.jpg";
import VisionMission from "../assets/Vision-Mission.jpg";
import BgVision from "../assets/Bg-Vision.jpg";
import productsBackground from "../assets/ExpertOffice.jpg";
import Header from "../components/header";
import Footer from "../components/footer";

export default function Homepage() {
  const [products, setProducts] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlogLoading, setIsBlogLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  // Exit-intent popup states
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [exitIntentTriggered, setExitIntentTriggered] = useState(false);
  const [popupSubmitted, setPopupSubmitted] = useState(false);

  // Regular newsletter signup state
  const [regularNewsletterEmail, setRegularNewsletterEmail] = useState("");

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Refs for intersection observer
  const heroRef = useRef(null);
  const commitmentRef = useRef(null);
  const productsRef = useRef(null);
  const blogRef = useRef(null);
  const testimonialsRef = useRef(null);

  // Animation states
  const [visibleSections, setVisibleSections] = useState({
    hero: false,
    commitments: false,
    products: false,
    blog: false,
    testimonials: false,
  });

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionName = entry.target.getAttribute("data-section");
          setVisibleSections((prev) => ({ ...prev, [sectionName]: true }));
        }
      });
    }, observerOptions);

    const sections = [
      heroRef,
      commitmentRef,
      productsRef,
      blogRef,
      testimonialsRef,
    ];
    sections.forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setIsBlogLoading(true);

      try {
        // Check cache first for instant loading
        const cachedProducts = dataCache.get(CACHE_KEYS.HOME_PRODUCTS);
        const cachedBlogs = dataCache.get(CACHE_KEYS.HOME_BLOGS);

        if (cachedProducts && cachedBlogs) {
          // Instant load from cache
          setProducts(cachedProducts);
          setBlogPosts(cachedBlogs);
          setIsLoading(false);
          setIsBlogLoading(false);
          return;
        }

        // Add timeout protection for database queries
        const createTimeoutPromise = (name, timeoutMs = 10000) =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`${name} timeout`)), timeoutMs)
          );

        // Fetch products and blogs in parallel with reasonable timeout
        const [productsResult, blogsResult] = await Promise.all([
          cachedProducts
            ? Promise.resolve({ data: cachedProducts, error: null })
            : Promise.race([
                supabase
                  .from("products")
                  .select(
                    "id, name, price, image_url, category_id, description"
                  )
                  .eq("status", "active")
                  .limit(4),
                createTimeoutPromise("Products", 15000), // Increased timeout to 15 seconds
              ]).catch((error) => ({ data: null, error })),
          cachedBlogs
            ? Promise.resolve({ data: cachedBlogs, error: null })
            : Promise.race([
                supabase
                  .from("blog_posts")
                  .select("id, title, excerpt, created_at, image_url, tags")
                  .eq("status", "Published")
                  .order("created_at", { ascending: false })
                  .limit(3),
                createTimeoutPromise("Blogs", 15000), // Increased timeout to 15 seconds
              ]).catch((error) => ({ data: null, error })),
        ]);

        // Handle products with better error recovery
        if (productsResult.error || !productsResult.data) {
          console.error(
            "Failed to fetch products:",
            productsResult.error || "No data"
          );
          // Set fallback products
          const fallbackProducts = [
            {
              id: 1,
              name: "Executive Office Chair",
              image_url: null,
              description: "Premium ergonomic chair for executive offices",
            },
            {
              id: 2,
              name: "Modern Office Desk",
              image_url: null,
              description: "Sleek and functional desk for modern workspaces",
            },
            {
              id: 3,
              name: "Conference Table",
              image_url: null,
              description: "Professional table for meetings and presentations",
            },
            {
              id: 4,
              name: "Storage Cabinet",
              image_url: null,
              description: "Secure storage solution for office documents",
            },
          ];
          setProducts(fallbackProducts);
          dataCache.set(CACHE_KEYS.HOME_PRODUCTS, fallbackProducts);
        } else {
          const productsData = productsResult.data || [];
          setProducts(productsData);
          // Cache for future loads
          if (!cachedProducts) {
            dataCache.set(CACHE_KEYS.HOME_PRODUCTS, productsData);
          }
        }

        // Handle blogs
        if (blogsResult.error) {
          console.error("Failed to fetch blog posts:", blogsResult.error);
          // Set dummy blog posts if table doesn't exist or no published posts
          const fallbackBlogs = [
            {
              id: 1,
              title: "Creating the Perfect Ergonomic Office Setup",
              excerpt:
                "Discover how to design a workspace that promotes health, productivity, and comfort with our expert tips.",
              created_at: "2024-08-01",
              image_url: null,
            },
            {
              id: 2,
              title: "2024 Office Design Trends: Green & Sustainable",
              excerpt:
                "Explore the latest trends in eco-friendly office furniture and sustainable workplace design.",
              created_at: "2024-07-28",
              image_url: null,
            },
            {
              id: 3,
              title: "Maximizing Productivity with the Right Furniture",
              excerpt:
                "Learn how choosing the right office furniture can significantly boost your work performance.",
              created_at: "2024-07-25",
              image_url: null,
            },
          ];
          setBlogPosts(fallbackBlogs);
          dataCache.set(CACHE_KEYS.HOME_BLOGS, fallbackBlogs);
        } else {
          const blogsData = blogsResult.data || [];
          setBlogPosts(blogsData);
          // Cache for future loads
          if (!cachedBlogs) {
            dataCache.set(CACHE_KEYS.HOME_BLOGS, blogsData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // Set fallback data
        setProducts([]);
        const fallbackBlogs = [
          {
            id: 1,
            title: "Creating the Perfect Ergonomic Office Setup",
            excerpt:
              "Discover how to design a workspace that promotes health, productivity, and comfort with our expert tips.",
            created_at: "2024-08-01",
            image_url: null,
          },
          {
            id: 2,
            title: "2024 Office Design Trends: Green & Sustainable",
            excerpt:
              "Explore the latest trends in eco-friendly office furniture and sustainable workplace design.",
            created_at: "2024-07-28",
            image_url: null,
          },
          {
            id: 3,
            title: "Maximizing Productivity with the Right Furniture",
            excerpt:
              "Learn how choosing the right office furniture can significantly boost your work performance.",
            created_at: "2024-07-25",
            image_url: null,
          },
        ];
        setBlogPosts(fallbackBlogs);
      } finally {
        // Remove artificial delays for instant loading
        setIsLoading(false);
        setIsBlogLoading(false);
      }
    };

    fetchData();
  }, []);

  // Exit-intent detection
  useEffect(() => {
    const handleMouseLeave = (e) => {
      // Check if mouse is leaving from the top of the viewport
      if (
        e.clientY <= 0 &&
        !exitIntentTriggered &&
        !popupSubmitted &&
        !showExitPopup
      ) {
        setExitIntentTriggered(true);
        setShowExitPopup(true);
      }
    };

    // Also trigger after 45 seconds of browsing as backup
    const timer = setTimeout(() => {
      if (!exitIntentTriggered && !popupSubmitted && !showExitPopup) {
        setExitIntentTriggered(true);
        setShowExitPopup(true);
      }
    }, 45000); // 45 seconds

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(timer);
    };
  }, [exitIntentTriggered, popupSubmitted, showExitPopup]);

  // Newsletter subscription handler
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();

    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      // Check if email already exists
      const { data: existingSubscriber, error: checkError } = await supabase
        .from("subscribers")
        .select("id, email")
        .eq("email", newsletterEmail.toLowerCase().trim())
        .single();

      if (existingSubscriber) {
        showNewsletterConfirmation(
          "You're already subscribed! Here's your 15% discount code: WELCOME15. Save this for your first purchase!",
          "discount"
        );
        setPopupSubmitted(true);
        setShowExitPopup(false);
        setNewsletterEmail("");
        return;
      }

      // Insert new subscriber
      const { data, error } = await supabase.from("subscribers").insert([
        {
          email: newsletterEmail.toLowerCase().trim(),
          source: "exit_intent_popup",
          status: "active",
          subscribed_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.log("Database insert error:", error);
        // Show success message even if there's a database error
        showNewsletterConfirmation(
          "Thank you for subscribing! 🎉 Your 15% discount code is: WELCOME15. Use this code for your first purchase!",
          "discount"
        );
      } else {
        // Show success message for successful subscription
        showNewsletterConfirmation(
          "Welcome to our newsletter! 🎉 Your exclusive 15% discount code is: WELCOME15. Save this code for your first purchase and enjoy free shipping!",
          "discount"
        );
      }

      setPopupSubmitted(true);
      setShowExitPopup(false);
      setNewsletterEmail("");
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      showNewsletterConfirmation(
        "Thank you for subscribing! 🎉 Your 15% discount code is: WELCOME15. Use this code for your first purchase!",
        "discount"
      );
      setPopupSubmitted(true);
      setShowExitPopup(false);
      setNewsletterEmail("");
    }
  };

  // Regular newsletter subscription handler
  const handleRegularNewsletterSubmit = async (e) => {
    e.preventDefault();

    if (!regularNewsletterEmail || !regularNewsletterEmail.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      // Check if email already exists
      const { data: existingSubscriber, error: checkError } = await supabase
        .from("subscribers")
        .select("id, email")
        .eq("email", regularNewsletterEmail.toLowerCase().trim())
        .single();

      if (existingSubscriber) {
        // Show success message for existing subscribers
        showNewsletterConfirmation(
          "You're already subscribed! Thank you for your continued interest in our updates."
        );
        setRegularNewsletterEmail("");
        return;
      }

      // Insert new subscriber
      const { data, error } = await supabase.from("subscribers").insert([
        {
          email: regularNewsletterEmail.toLowerCase().trim(),
          source: "newsletter_form",
          status: "active",
          subscribed_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.log("Database insert error:", error);
        // Show success message even if there's a database error
        showNewsletterConfirmation(
          "Thank you for subscribing! We'll keep you updated with our latest news and exclusive offers."
        );
      } else {
        // Show success message for successful subscription
        showNewsletterConfirmation(
          "Welcome to our newsletter! 🎉 You'll receive exclusive updates, special offers, and design tips directly in your inbox."
        );
      }

      setRegularNewsletterEmail("");
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      // Show success message even if there's an error
      showNewsletterConfirmation(
        "Thank you for subscribing! We'll keep you updated with our latest news and exclusive offers."
      );
      setRegularNewsletterEmail("");
    }
  };

  // Newsletter confirmation message function
  const showNewsletterConfirmation = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const filteredProducts = searchTerm
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  return (
    <div className="bg-white text-gray-900 overflow-hidden">
      {/* Header Component */}
      <Header />

      {/* Floating Elements Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-2 h-2 bg-yellow-500 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-green-500 rounded-full animate-bounce opacity-40"></div>
        <div className="absolute top-60 left-1/4 w-1 h-1 bg-yellow-400 rounded-full animate-ping opacity-50"></div>
        <div className="absolute bottom-40 right-1/3 w-2 h-2 bg-green-400 rounded-full animate-pulse opacity-30"></div>
      </div>

      {/* Hero Section */}
      <section
        ref={heroRef}
        data-section="hero"
        className="relative h-screen bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroImage})`,
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      >
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-green-900/30 to-black/90 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent animate-pulse"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col justify-center h-full px-6 sm:px-16">
          <div
            className={`transform transition-all duration-1000 ${
              visibleSections.hero
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-green-500/20 rounded-full mb-6 backdrop-blur-sm border border-yellow-500/30">
              <Star className="w-4 h-4 text-yellow-500 mr-2" />
              <span className="text-sm text-white font-medium">
                Work Smart,Sit Safe
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white max-w-4xl leading-tight mb-6 drop-shadow-2xl">
              Transform Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-green-500 animate-pulse">
                Office Space
              </span>
              with Style & Comfort
            </h1>

            <p className="text-xl text-gray-200 max-w-2xl mb-8 leading-relaxed">
              Premium ergonomic furniture designed for health, productivity, and
              modern aesthetics. Experience the perfect blend of comfort and
              style.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/shop">
                <button className="group bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black px-8 py-4 rounded-full font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center">
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>

              <Link to="/gallery">
                <button className="group border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-black transform hover:scale-105 transition-all duration-300 flex items-center justify-center">
                  View Gallery
                  <Sparkles className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-ping"></div>
          </div>
        </div>
      </section>

      {/* Commitments Section */}
      <section
        ref={commitmentRef}
        data-section="commitments"
        className="py-24 text-center bg-gradient-to-br from-gray-50 to-white relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-40 h-40 bg-yellow-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-green-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div
            className={`transform transition-all duration-1000 delay-200 ${
              visibleSections.commitments
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Why Choose
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-green-600">
                {" "}
                Us?
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-16 text-lg">
              Experience the difference with our commitment to quality,
              sustainability, and customer retention
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 max-w-7xl mx-auto">
            {[
              {
                title: "Eco-Friendly Materials",
                desc: "We prioritize sustainable, responsibly sourced materials for a better tomorrow.",
                color: "from-green-500 to-green-700",
                delay: "delay-300",
              },
              {
                title: "Ergonomic Comfort",
                desc: "Furniture designed to support posture and reduce strain for optimal productivity.",
                color: "from-yellow-500 to-yellow-700",
                delay: "delay-500",
              },
              {
                title: "Flexible Policies",
                desc: "Enjoy comprehensive warranties, and express deliveries.",
                color: "from-green-600 to-yellow-600",
                delay: "delay-700",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`group transform transition-all duration-1000 ${
                  item.delay
                } ${
                  visibleSections.commitments
                    ? "translate-y-0 opacity-100"
                    : "translate-y-20 opacity-0"
                }`}
              >
                <div className="bg-white shadow-xl hover:shadow-2xl transition-all duration-500 p-8 rounded-2xl border border-gray-100 group-hover:border-gray-200 transform group-hover:-translate-y-2 relative overflow-hidden">
                  {/* Background gradient on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  ></div>

                  <div className="relative z-10">
                    <div
                      className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}
                    >
                      <CheckCircle2 className="text-white w-8 h-8" />
                    </div>

                    <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-gray-900 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission Banner */}
      <section
        className="flex justify-center py-16 bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: `url(${BgVision})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 transform hover:scale-105 transition-transform duration-700">
          <img
            src={VisionMission}
            alt="Vision & Mission"
            className="max-w-5xl rounded-2xl shadow-2xl hover:shadow-3xl transition-shadow duration-500"
          />
        </div>
      </section>

      {/* Featured Products */}
      <section
        ref={productsRef}
        data-section="products"
        className="py-24 relative overflow-hidden"
        id="products"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${productsBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Enhanced Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-blue-900/20"></div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-40 left-10 w-32 h-32 bg-white rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-40 right-10 w-48 h-48 bg-yellow-300 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-green-300 rounded-full blur-xl animate-bounce"></div>
        </div>

        <div className="relative z-10">
          <div
            className={`text-center mb-16 transform transition-all duration-1000 ${
              visibleSections.products
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
              Featured
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-green-400">
                {" "}
                Products
              </span>
            </h2>
            <p className="text-gray-100 max-w-2xl mx-auto text-lg drop-shadow-md">
              Discover our handpicked selection of premium office furniture
              designed for modern workspaces
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-6 max-w-7xl mx-auto">
              {[...Array(4)].map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 shadow-lg animate-pulse"
                >
                  <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-6 max-w-7xl mx-auto">
              {filteredProducts.length ? (
                filteredProducts.map((product, idx) => (
                  <div
                    key={product.id}
                    className={`group transform transition-all duration-700 delay-${
                      idx * 100
                    } ${
                      visibleSections.products
                        ? "translate-y-0 opacity-100"
                        : "translate-y-20 opacity-0"
                    }`}
                  >
                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 transform group-hover:-translate-y-3 group-hover:rotate-1 border border-white/20 group-hover:border-white/30 relative overflow-hidden">
                      {/* Enhanced gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/15 to-yellow-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <div className="relative z-10">
                        <div className="relative overflow-hidden rounded-xl mb-4">
                          <img
                            src={product.image_url || heroImage}
                            alt={product.name}
                            className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>

                        <h4 className="font-bold text-lg text-gray-800 group-hover:text-gray-900 transition-colors mb-2">
                          {product.name}
                        </h4>

                        <div className="flex items-center justify-between">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current" />
                            ))}
                          </div>
                          <button className="bg-gradient-to-r from-green-500 to-yellow-500 text-white px-4 py-2 rounded-full text-sm font-semibold transform group-hover:scale-105 transition-transform duration-300 hover:shadow-lg">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-white/80 text-lg backdrop-blur-sm bg-black/20 rounded-lg p-4">
                    No products found.
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/shop">
              <button className="group bg-white/20 backdrop-blur-lg border border-white/30 hover:bg-white/30 text-white px-8 py-4 rounded-full font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center mx-auto">
                View All Products
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section
        ref={blogRef}
        data-section="blog"
        className="py-24 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #fefefe 0%, #f9fafb 50%, #f3f4f6 100%)`,
        }}
      >
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-green-100/30 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-gradient-to-tl from-yellow-100/25 to-transparent rounded-full blur-3xl animate-pulse delay-500"></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-r from-green-50/40 to-yellow-50/40 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10">
          <div
            className={`text-center mb-16 transform transition-all duration-1000 ${
              visibleSections.blog
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Latest
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-yellow-600">
                {" "}
                Insights
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Stay updated with expert tips, trends, and insights about office
              furniture and workspace design
            </p>
          </div>

          {isBlogLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 max-w-7xl mx-auto">
              {[...Array(3)].map((_, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 rounded-2xl p-6 shadow-lg animate-pulse"
                >
                  <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 max-w-7xl mx-auto">
              {blogPosts.map((post, idx) => (
                <article
                  key={post.id}
                  className={`group transform transition-all duration-700 delay-${
                    idx * 200
                  } ${
                    visibleSections.blog
                      ? "translate-y-0 opacity-100"
                      : "translate-y-20 opacity-0"
                  }`}
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-3 border border-gray-100 group-hover:border-gray-200 relative overflow-hidden">
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative z-10">
                      {/* Blog Image */}
                      <div className="relative overflow-hidden rounded-t-2xl">
                        {post.image_url ? (
                          <img
                            src={post.image_url}
                            alt={post.title}
                            className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-green-500 to-yellow-500 flex items-center justify-center">
                            <BookOpen className="w-16 h-16 text-white opacity-80" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>

                      <div className="p-6">
                        {/* Date and Author */}
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(post.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </div>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            <span className="text-xs">
                              Expert Office Furnish
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors mb-3 line-clamp-2">
                          {post.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.slice(0, 3).map((tag, tagIdx) => (
                              <span
                                key={tagIdx}
                                className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Read More Button */}
                        <Link
                          to={`/blog/${post.id}`}
                          className="inline-flex items-center text-green-600 hover:text-green-700 font-medium transition-colors group/link"
                        >
                          Read More
                          <ChevronRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* View All Blogs Button */}
          <div className="text-center mt-12">
            <Link to="/blog">
              <button className="group bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600 text-white px-8 py-4 rounded-full font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center mx-auto">
                View All Articles
                <BookOpen className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        ref={testimonialsRef}
        data-section="testimonials"
        className="py-24 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #ffffff 0%, #f8fafc 30%, #e2e8f0 70%, #f1f5f9 100%)`,
        }}
      >
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-bl from-yellow-100/25 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-tr from-green-100/20 to-transparent rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-gradient-to-l from-green-50/30 to-yellow-50/30 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10">
          <div
            className={`text-center mb-16 transform transition-all duration-1000 ${
              visibleSections.testimonials
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What Our
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-yellow-600">
                {" "}
                Customers Say
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Don't just take our word for it - hear from our satisfied
              customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-6 max-w-7xl mx-auto">
            {[
              {
                quote:
                  "Thank you for the kind assistance with having the sofa delivered on Saturday. We are very pleased with it. Best regards",
                author: "Jacob Agyei Twumasi",
                location: "Accra",
                rating: 4,
                delay: "delay-200",
              },
              {
                quote:
                  "Thank you! I don't think I've already said but just to let you know we are very pleased with the furniture. The clients are so happy they want to order a new sofa for their London home! Thank you for all your help.",
                author: "Ann Pokua",
                location: "London",
                rating: 5,
                delay: "delay-400",
              },
              {
                quote:
                  "Many thanks for the wonderful service. I am so happy with my new bench, also I purchased the 6 dining tables, those ones from the display showroom. Thanks again for the amazing service. Kind Regards",
                author: "Sophia Johnson",
                location: "Accra",
                rating: 5,
                delay: "delay-600",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className={`group transform transition-all duration-1000 ${
                  testimonial.delay
                } ${
                  visibleSections.testimonials
                    ? "translate-y-0 opacity-100"
                    : "translate-y-20 opacity-0"
                }`}
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-2 border border-gray-100 group-hover:border-gray-200 relative overflow-hidden">
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    {/* Stars Rating */}
                    <div className="flex text-yellow-400 mb-4">
                      {[...Array(testimonial.rating)].map((_, idx) => (
                        <Star key={idx} className="w-5 h-5 fill-current" />
                      ))}
                    </div>

                    <blockquote className="text-gray-700 mb-6 text-lg italic leading-relaxed">
                      "{testimonial.quote}"
                    </blockquote>

                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                        {testimonial.author.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">
                          {testimonial.author}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {testimonial.location}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-green-500 rounded-full blur-2xl animate-bounce"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-yellow-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-green-400 rounded-full blur-3xl animate-ping"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div className="transform hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-16 h-16 text-yellow-600 mx-auto mb-6 animate-pulse" />

            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Stay in the
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-yellow-600">
                {" "}
                Loop
              </span>
            </h2>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join our newsletter to get exclusive deals, design tips, and be
              the first to know about our latest collections
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto mb-8">
              <form
                onSubmit={handleRegularNewsletterSubmit}
                className="flex flex-col sm:flex-row gap-4 w-full"
              >
                <input
                  type="email"
                  value={regularNewsletterEmail}
                  onChange={(e) => setRegularNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-6 py-4 rounded-full border-2 border-green-400 focus:border-green-600 focus:outline-none text-gray-700 bg-white shadow-lg"
                  required
                />
                <button
                  type="submit"
                  className="group bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-full font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center"
                >
                  Subscribe
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>

            <Link to="/newsletter">
              <button className="text-green-600 hover:text-green-700 font-medium underline transition-colors">
                Learn more about our newsletter
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Exit-Intent Popup */}
      {showExitPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 relative overflow-hidden transform animate-in slide-in-from-top duration-500">
            {/* Close button */}
            <button
              onClick={() => setShowExitPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 opacity-50"></div>

            {/* Content */}
            <div className="relative p-8 text-center">
              {/* Icon */}
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Gift className="w-10 h-10 text-white" />
              </div>

              {/* Headline */}
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Wait! Don't Leave Empty-Handed! 🛑
              </h2>

              {/* Subheadline */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                Get <span className="font-bold text-green-600">15% OFF</span>{" "}
                your first order +
                <span className="font-bold text-yellow-600">
                  {" "}
                  24-Hour Design Consultation
                </span>{" "}
                worth GHC 3,200!
              </p>

              {/* Benefits list */}
              <div className="text-left bg-white/70 rounded-lg p-4 mb-6 space-y-2">
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Instant 15% discount on all products
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  24-hour design consultation offer
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Priority customer support
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Exclusive access to new collections
                </div>
              </div>

              {/* Email form */}
              <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email for instant access"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-yellow-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                >
                  <Gift className="w-5 h-5 mr-2" />
                  Claim My 15% Discount Now!
                </button>
              </form>

              {/* Timer element */}
              <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                Limited time offer - Don't miss out!
              </div>

              {/* No thanks button */}
              <button
                onClick={() => setShowExitPopup(false)}
                className="mt-3 text-gray-400 text-sm hover:text-gray-600 transition-colors"
              >
                No thanks, I'll pay full price
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      {/* Newsletter Toast Notification */}
      {showToast && (
        <NewsletterToast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
          autoClose={6000}
        />
      )}
    </div>
  );
}
