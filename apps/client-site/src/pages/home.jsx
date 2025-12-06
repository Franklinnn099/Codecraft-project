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
  ChevronLeft,
  X,
  Gift,
  Mail,
  Percent,
  Clock,
  TrendingUp,
  Users,
  Award,
  Heart,
  Zap,
  Shield,
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
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Refs for intersection observer
  const heroRef = useRef(null);
  const commitmentRef = useRef(null);
  const productsRef = useRef(null);
  const blogRef = useRef(null);
  const testimonialsRef = useRef(null);
  const productScrollRef = useRef(null);

  // Animation states
  const [visibleSections, setVisibleSections] = useState({
    hero: false,
    commitments: false,
    products: false,
    blog: false,
    testimonials: false,
  });

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      quote:
        "Thank you for the kind assistance with having the sofa delivered on Saturday. We are very pleased with it. Best regards",
      author: "Jacob Agyei Twumasi",
      location: "Accra",
      rating: 4,
    },
    {
      id: 2,
      quote:
        "Thank you! I don't think I've already said but just to let you know we are very pleased with the furniture. The clients are so happy they want to order a new sofa for their London home! Thank you for all your help.",
      author: "Ann Pokua",
      location: "London",
      rating: 5,
    },
    {
      id: 3,
      quote:
        "Many thanks for the wonderful service. I am so happy with my new bench, also I purchased the 6 dining tables, those ones from the display showroom. Thanks again for the amazing service. Kind Regards",
      author: "Sophia Johnson",
      location: "Accra",
      rating: 5,
    },
  ];

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollProducts = (direction) => {
    if (productScrollRef.current) {
      const { current } = productScrollRef;
      const scrollAmount = direction === "left" ? -400 : 400;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
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
                    "id, name, image_url, category_id, description"
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

  // Auto-rotating testimonials
  useEffect(() => {
    const testimonialTimer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(testimonialTimer);
  }, []);

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

      {/* Hero Section - Modern Asymmetrical Layout */}
      <section
        ref={heroRef}
        data-section="hero"
        className="relative h-screen overflow-hidden"
      >
        {/* Background Image with Parallax */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            transform: `translateY(${scrollY * 0.5}px) scale(1.1)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 h-full container mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-2xl w-full pt-20">
            <div
              className={`transform transition-all duration-1000 ${
                visibleSections.hero
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-20 opacity-0"
              }`}
            >
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-8 animate-fadeIn">
                <Star className="w-4 h-4 text-yellow-400 mr-2 animate-spin-slow" />
                <span className="text-sm text-white font-bold tracking-wider uppercase">
                  Work Smart, Sit Safe
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white leading-tight mb-8 tracking-tight">
                Transform Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-green-300 to-yellow-300 animate-gradient bg-[length:200%_auto]">
                  Office Space
                </span>
                <span className="block text-4xl md:text-6xl mt-2 font-bold text-white/90">
                  with Style & Comfort
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed font-light max-w-lg border-l-4 border-green-500 pl-6 bg-black/20 backdrop-blur-sm py-2 rounded-r-lg">
                Premium ergonomic furniture designed for health, productivity, and
                modern aesthetics. Experience the perfect blend of comfort and
                style.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-5">
                <Link to="/shop">
                  <button className="w-full sm:w-auto group bg-white text-black px-8 py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center">
                    Shop Now
                    <div className="bg-black text-white rounded-full p-1 ml-3 group-hover:rotate-45 transition-transform duration-300">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                </Link>

                <Link to="/gallery">
                  <button className="w-full sm:w-auto group bg-white/5 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center">
                    View Gallery
                    <Sparkles className="ml-3 w-5 h-5 text-yellow-300 group-hover:scale-125 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side Decorative Elements (Desktop Only) */}
          <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-3/4 pointer-events-none">
            <div className="relative w-full h-full">
              {/* Floating Glass Cards */}
              <div className="absolute top-20 right-20 bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-2xl transform rotate-6 animate-float">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white font-bold">Ergonomic Design</p>
                    <p className="text-white/60 text-xs">Certified Comfort</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-40 right-40 bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-2xl transform -rotate-3 animate-float animation-delay-2000">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Star className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white font-bold">Premium Quality</p>
                    <p className="text-white/60 text-xs">5-Year Warranty</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce cursor-pointer" onClick={() => scrollToSection('products')}>
          <span className="text-white/60 text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-0.5 h-12 bg-gradient-to-b from-white to-transparent"></div>
        </div>
      </section>

      {/* Commitments Section - Redesigned Asymmetrical */}
      <section
        ref={commitmentRef}
        data-section="commitments"
        className="py-32 relative overflow-hidden bg-gray-50"
      >
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            {/* Left Side - Sticky Content */}
            <div className="lg:w-1/3 lg:sticky lg:top-32">
              <div
                className={`transform transition-all duration-1000 ${
                  visibleSections.commitments
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-20 opacity-0"
                }`}
              >
                <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                  Why <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-yellow-500">
                    Choose Us?
                  </span>
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed border-l-4 border-green-500 pl-6">
                  Experience the difference with our commitment to quality,
                  sustainability, and customer retention
                </p>
                <div className="hidden lg:block">
                  <button className="group flex items-center gap-2 text-green-600 font-bold hover:text-green-700 transition-colors">
                    Learn more about our values
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Staggered Cards */}
            <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Card 1 - Full Width */}
              <div
                className={`group md:col-span-2 transform transition-all duration-1000 delay-200 ${
                  visibleSections.commitments
                    ? "translate-y-0 opacity-100"
                    : "translate-y-20 opacity-0"
                }`}
              >
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 relative overflow-hidden group-hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform duration-500">
                      <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Eco-Friendly Materials
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-lg">
                        We prioritize sustainable, responsibly sourced materials
                        for a better tomorrow.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div
                className={`group transform transition-all duration-1000 delay-400 ${
                  visibleSections.commitments
                    ? "translate-y-0 opacity-100"
                    : "translate-y-20 opacity-0"
                }`}
              >
                <div className="h-full bg-white p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 relative overflow-hidden group-hover:-translate-y-2">
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-50 rounded-full -ml-10 -mb-10 transition-transform group-hover:scale-150 duration-700"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500">
                      <Zap className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Ergonomic Comfort
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Furniture designed to support posture and reduce strain
                      for optimal productivity.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div
                className={`group transform transition-all duration-1000 delay-600 ${
                  visibleSections.commitments
                    ? "translate-y-0 opacity-100"
                    : "translate-y-20 opacity-0"
                }`}
              >
                <div className="h-full bg-white p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 relative overflow-hidden group-hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500">
                      <Shield className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Flexible Policies
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Enjoy comprehensive warranties, and express deliveries.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Banner - Animated */}
      <section
        className="py-32 relative overflow-hidden flex items-center justify-center min-h-[60vh]"
        style={{
          backgroundImage: `url(${BgVision})`,
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white rounded-full animate-ping opacity-50"></div>
          <div className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-yellow-400 rounded-full animate-pulse opacity-40"></div>
          <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-green-400 rounded-full animate-ping delay-700 opacity-60"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 flex justify-center">
          <div className="relative group perspective-1000">
            {/* Glowing border effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-yellow-500 to-green-500 rounded-2xl blur opacity-30 group-hover:opacity-80 transition duration-1000 group-hover:duration-200 animate-gradient"></div>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 transform transition-all duration-700 group-hover:scale-[1.02] animate-float">
              <img
                src={VisionMission}
                alt="Vision & Mission"
                className="max-w-5xl w-full h-auto object-cover"
              />

              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shine-slide"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - Redesigned Interactive */}
      <section
        ref={productsRef}
        data-section="products"
        className="py-32 relative overflow-hidden bg-white"
        id="products"
      >
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-green-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-yellow-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            {/* Left Side - Sticky Content */}
            <div className="lg:w-1/3 lg:sticky lg:top-32">
              <div
                className={`transform transition-all duration-1000 ${
                  visibleSections.products
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-20 opacity-0"
                }`}
              >
                <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                  Featured <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-yellow-500">
                    Products
                  </span>
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed border-l-4 border-yellow-500 pl-6">
                  Discover our handpicked selection of premium office furniture
                  designed for modern workspaces
                </p>
                
                <div className="flex flex-col gap-6">
                    <Link to="/shop">
                    <button className="group bg-gray-900 text-white px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center">
                        View All Products
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    </Link>

                    {/* Navigation Controls */}
                    <div className="flex gap-4">
                        <button 
                            onClick={() => scrollProducts('left')}
                            className="p-4 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors group"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <button 
                            onClick={() => scrollProducts('right')}
                            className="p-4 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors group"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="w-6 h-6 text-gray-600 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
              </div>
            </div>

            {/* Right Side - Interactive Product Slider */}
            <div className="lg:w-2/3 w-full">
              {isLoading ? (
                <div className="flex gap-6 overflow-hidden">
                  {[...Array(3)].map((_, idx) => (
                    <div
                      key={idx}
                      className="min-w-[300px] md:min-w-[350px] bg-gray-50 rounded-[2rem] p-6 shadow-sm animate-pulse h-96"
                    >
                      <div className="w-full h-48 bg-gray-200 rounded-2xl mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div 
                    ref={productScrollRef}
                    className="flex gap-8 overflow-x-auto pb-12 snap-x snap-mandatory hide-scrollbar"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {filteredProducts.length ? (
                    filteredProducts.map((product, idx) => (
                      <div
                        key={product.id}
                        className={`min-w-[300px] md:min-w-[380px] snap-center group transform transition-all duration-700 delay-${
                          idx * 100
                        } ${
                          visibleSections.products
                            ? "translate-y-0 opacity-100"
                            : "translate-y-20 opacity-0"
                        }`}
                      >
                        <div className="bg-white rounded-[2.5rem] p-4 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 relative overflow-hidden group-hover:-translate-y-2 h-full flex flex-col">
                          {/* Image Container */}
                          <div className="relative overflow-hidden rounded-[2rem] mb-6 aspect-[4/3] group-hover:shadow-inner">
                            <img
                              src={product.image_url || heroImage}
                              alt={product.name}
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            />
                            
                            {/* Overlay Actions */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                              <button className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-green-500 hover:text-white shadow-lg flex items-center gap-2 w-3/4 justify-center">
                                <ShoppingCart className="w-5 h-5" />
                                Add to Cart
                              </button>
                              <button className="bg-white/20 text-white border border-white/40 px-6 py-3 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75 hover:bg-white hover:text-gray-900 shadow-lg flex items-center gap-2 w-3/4 justify-center backdrop-blur-md">
                                <ArrowRight className="w-5 h-5" />
                                Quick View
                              </button>
                            </div>
                            
                            {/* Floating Badge */}
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-lg">
                                Featured
                            </div>
                          </div>

                          <div className="px-4 pb-4 flex-1 flex flex-col">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-bold text-xl text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
                                {product.name}
                              </h4>
                              <div className="flex text-yellow-400 bg-yellow-50 px-2 py-1 rounded-lg">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-xs text-gray-700 ml-1 font-bold">4.9</span>
                              </div>
                            </div>
                            
                            <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-1">
                              {product.description}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                              <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                In Stock
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 w-full">
                      <div className="text-gray-500 text-lg bg-gray-50 rounded-2xl p-8">
                        No products found.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section - Creative Magazine Layout */}
      <section
        ref={blogRef}
        data-section="blog"
        className="py-32 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-yellow-900/20 via-transparent to-transparent"></div>
          
          {/* Floating Geometric Shapes */}
          <div className="absolute top-20 left-10 w-32 h-32 border border-green-500/20 rounded-full animate-spin-slow"></div>
          <div className="absolute top-40 right-20 w-20 h-20 border border-yellow-500/20 rotate-45 animate-pulse"></div>
          <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-green-500/10 rounded-lg animate-bounce-slow"></div>
          <div className="absolute top-1/2 right-1/3 w-24 h-24 border-2 border-dashed border-white/10 rounded-full animate-spin-slower"></div>
          
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div
              className={`transform transition-all duration-1000 ${
                visibleSections.blog
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <span className="inline-block px-4 py-2 bg-green-500/20 text-green-400 text-sm font-bold rounded-full mb-6 backdrop-blur-sm border border-green-500/30">
                📚 FROM OUR BLOG
              </span>
              <h2 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                Latest{" "}
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-yellow-400 to-green-400 animate-gradient-x">
                    Insights
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M2 10C50 2 150 2 198 10" stroke="url(#paint0_linear)" strokeWidth="3" strokeLinecap="round"/>
                    <defs>
                      <linearGradient id="paint0_linear" x1="2" y1="6" x2="198" y2="6">
                        <stop stopColor="#22c55e"/>
                        <stop offset="0.5" stopColor="#eab308"/>
                        <stop offset="1" stopColor="#22c55e"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Expert tips, trends, and inspiration for creating the perfect workspace
              </p>
            </div>
          </div>

          {/* Blog Cards - Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {isBlogLoading ? (
              [...Array(3)].map((_, idx) => (
                <div
                  key={idx}
                  className={`${idx === 0 ? 'md:col-span-2 md:row-span-2' : ''} bg-white/5 backdrop-blur-sm rounded-3xl p-6 animate-pulse`}
                >
                  <div className="w-full h-full min-h-[300px] bg-white/10 rounded-2xl"></div>
                </div>
              ))
            ) : (
              blogPosts.map((post, idx) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.id}`}
                  className={`group relative overflow-hidden rounded-3xl transition-all duration-700 cursor-pointer ${
                    idx === 0 
                      ? 'md:col-span-2 md:row-span-2' 
                      : ''
                  } ${
                    visibleSections.blog
                      ? "translate-y-0 opacity-100"
                      : "translate-y-20 opacity-0"
                  }`}
                  style={{ transitionDelay: `${idx * 150}ms` }}
                >
                  {/* Card Background with Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 group-hover:border-green-500/50 transition-all duration-500 rounded-3xl"></div>
                  
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-green-500/20 via-transparent to-yellow-500/20 rounded-3xl"></div>

                  <div className={`relative z-10 p-6 ${idx === 0 ? 'lg:p-10' : ''} h-full flex flex-col`}>
                    {/* Featured Image for First Card */}
                    {idx === 0 && post.image_url && (
                      <div className="relative overflow-hidden rounded-2xl mb-6 aspect-video">
                        <img 
                          src={post.image_url} 
                          alt={post.title} 
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
                        
                        {/* Play Button Overlay for Visual Interest */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                            <ArrowRight className="w-6 h-6 text-white transform group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Category Tag */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
                        {idx === 0 ? '✨ FEATURED' : '📝 ARTICLE'}
                      </span>
                      <span className="text-gray-500 text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(post.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className={`font-bold text-white mb-3 group-hover:text-green-400 transition-colors leading-tight ${
                      idx === 0 ? 'text-3xl lg:text-4xl' : 'text-xl'
                    }`}>
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className={`text-gray-400 leading-relaxed flex-1 ${
                      idx === 0 ? 'text-lg line-clamp-3' : 'text-sm line-clamp-2'
                    }`}>
                      {post.excerpt}
                    </p>

                    {/* Read More Link */}
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-400 font-semibold group-hover:text-green-300 transition-colors">
                        <span>Read Article</span>
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" />
                      </div>
                      
                      {/* Animated Corner Decoration */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/20 to-yellow-500/20 flex items-center justify-center group-hover:rotate-90 group-hover:scale-110 transition-all duration-500 border border-white/10">
                        <BookOpen className="w-4 h-4 text-green-400" />
                      </div>
                    </div>

                    {/* Corner Accent */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-green-500/20 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* View All Button */}
          <div className="text-center mt-16">
            <Link to="/blog">
              <button className="group relative px-10 py-5 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-full overflow-hidden shadow-2xl shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 hover:-translate-y-1">
                <span className="relative z-10 flex items-center gap-3">
                  Explore All Articles
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials - Redesigned Interactive */}
      <section
        ref={testimonialsRef}
        data-section="testimonials"
        className="py-32 relative overflow-hidden bg-white"
      >
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-gray-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
           <div className="absolute bottom-0 left-20 w-[400px] h-[400px] bg-green-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Left Side - Sticky Content */}
            <div className="lg:w-1/3 lg:self-start lg:sticky lg:top-32">
              <div
                className={`transform transition-all duration-1000 ${
                  visibleSections.testimonials
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-20 opacity-0"
                }`}
              >
                <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                  What Our <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-yellow-500">
                    Customers Say
                  </span>
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed border-l-4 border-yellow-500 pl-6">
                  Don't just take our word for it - hear from our satisfied
                  customers
                </p>
                
                {/* Navigation Controls */}
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                        className="p-4 rounded-full border border-gray-200 hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition-all duration-300 group"
                    >
                        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="flex gap-2">
                        {testimonials.map((_, index) => (
                            <button 
                                key={index} 
                                onClick={() => setCurrentTestimonial(index)}
                                className={`h-3 rounded-full transition-all duration-500 ${currentTestimonial === index ? 'bg-green-500 w-8' : 'bg-gray-200 w-3 hover:bg-gray-300'}`}
                            />
                        ))}
                    </div>
                    <button 
                        onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                        className="p-4 rounded-full border border-gray-200 hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition-all duration-300 group"
                    >
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
              </div>
            </div>

            {/* Right Side - Interactive Card */}
            <div className="lg:w-2/3 w-full">
                <div className="relative min-h-[400px]">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={testimonial.id}
                            className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                                index === currentTestimonial 
                                    ? "opacity-100 translate-x-0 scale-100 z-20" 
                                    : index < currentTestimonial 
                                        ? "opacity-0 -translate-x-20 scale-95 z-10" 
                                        : "opacity-0 translate-x-20 scale-95 z-10"
                            }`}
                        >
                            <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl border border-gray-100 h-full flex flex-col justify-center relative overflow-hidden">
                                {/* Decorative Quote */}
                                <div className="absolute top-8 right-12 text-9xl font-serif text-green-50 opacity-20 select-none">
                                    "
                                </div>
                                
                                <div className="relative z-10">
                                    <div className="flex text-yellow-400 mb-8">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="w-6 h-6 fill-current animate-pulse-slow" style={{ animationDelay: `${i * 100}ms` }} />
                                        ))}
                                    </div>
                                    
                                    <blockquote className="text-2xl md:text-4xl text-gray-800 mb-10 leading-tight font-medium">
                                        "{testimonial.quote}"
                                    </blockquote>
                                    
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-yellow-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg transform rotate-3">
                                            {testimonial.author.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-xl">
                                                {testimonial.author}
                                            </div>
                                            <div className="text-green-600 font-medium flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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
          </div>
        </div>
      </section>

      {/* Newsletter Signup - Creative Dark Theme */}
      <section className="py-32 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient Orbs */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-900/30 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-yellow-900/20 via-transparent to-transparent"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-[10%] w-4 h-4 bg-green-500 rounded-full animate-ping opacity-60"></div>
          <div className="absolute top-1/3 right-[15%] w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 left-[20%] w-2 h-2 bg-green-400 rounded-full animate-bounce-slow"></div>
          <div className="absolute top-1/2 right-[25%] w-5 h-5 border border-green-500/30 rounded-full animate-spin-slow"></div>
          
          {/* Decorative Lines */}
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-green-500/20 to-transparent"></div>
          <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-yellow-500/20 to-transparent"></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
          
          {/* Large Decorative Circle */}
          <div className="absolute -bottom-1/2 -right-1/4 w-[800px] h-[800px] border border-white/5 rounded-full"></div>
          <div className="absolute -top-1/2 -left-1/4 w-[600px] h-[600px] border border-white/5 rounded-full"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Main Content Card */}
            <div className="relative bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 overflow-hidden">
              {/* Card Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-yellow-500/10 opacity-50"></div>
              
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-br-[100px]"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-yellow-500/20 to-transparent rounded-tl-[100px]"></div>
              
              <div className="relative p-8 md:p-16">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  {/* Left Content */}
                  <div className="text-left">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full border border-green-500/30 mb-8">
                      <Mail className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm font-bold">NEWSLETTER</span>
                    </div>
                    
                    {/* Heading */}
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                      Stay in the
                      <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-yellow-400 to-green-400 animate-gradient-x">
                        Loop
                      </span>
                    </h2>
                    
                    {/* Description */}
                    <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                      Join our exclusive community and be the first to discover new collections, 
                      design inspiration, and members-only deals.
                    </p>
                    
                    {/* Benefits */}
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3 text-gray-300">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        </div>
                        <span>Exclusive early access to new products</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                          <Percent className="w-4 h-4 text-yellow-400" />
                        </div>
                        <span>Members-only discounts up to 25% off</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-green-400" />
                        </div>
                        <span>Free workspace design tips & inspiration</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Content - Form */}
                  <div className="relative">
                    {/* Form Card */}
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10 relative overflow-hidden">
                      {/* Form Glow */}
                      <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/30 rounded-full blur-3xl"></div>
                      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-yellow-500/20 rounded-full blur-3xl"></div>
                      
                      <div className="relative z-10">
                        {/* Icon */}
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25 transform rotate-3 hover:rotate-0 transition-transform">
                          <Mail className="w-8 h-8 text-white" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white text-center mb-2">
                          Join 10,000+ subscribers
                        </h3>
                        <p className="text-gray-400 text-center mb-8">
                          Get weekly updates straight to your inbox
                        </p>
                        
                        <form onSubmit={handleRegularNewsletterSubmit} className="space-y-4">
                          <div className="relative">
                            <input
                              type="email"
                              value={regularNewsletterEmail}
                              onChange={(e) => setRegularNewsletterEmail(e.target.value)}
                              placeholder="Enter your email address"
                              className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                              required
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Mail className="w-5 h-5 text-gray-500" />
                            </div>
                          </div>
                          
                          <button
                            type="submit"
                            className="w-full group relative px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-2xl overflow-hidden shadow-xl shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 hover:-translate-y-1"
                          >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              Subscribe Now
                              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </button>
                        </form>
                        
                        {/* Trust Badges */}
                        <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-white/10">
                          <div className="flex items-center gap-1 text-gray-500 text-sm">
                            <Shield className="w-4 h-4" />
                            <span>No spam</span>
                          </div>
                          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                          <div className="flex items-center gap-1 text-gray-500 text-sm">
                            <Zap className="w-4 h-4" />
                            <span>Unsubscribe anytime</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bottom Link */}
                <div className="text-center mt-12 pt-8 border-t border-white/10">
                  <Link to="/newsletter" className="inline-flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors group">
                    <span>Learn more about our newsletter</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
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
                No thanks, I'm not interested
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
