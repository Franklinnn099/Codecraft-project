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
  TrendingUp,
  Users,
  Award,
  Heart,
  Zap,
  Gift,
  Clock,
  Shield,
  Truck,
  Phone,
  Mail,
  X,
  Play,
  MessageCircle,
  ThumbsUp,
  Eye,
  Download,
  Bell,
  Lightbulb,
} from "lucide-react";
import { supabase } from "../supabase/supabaseClient";

import heroImage from "../assets/hero.jpg";
import VisionMission from "../assets/Vision-Mission.jpg";
import BgVision from "../assets/Bg-vision.jpg";
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

  // New state for enhanced features
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    reviews: 0,
    yearsExperience: 0,
  });
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showSmartPopup, setShowSmartPopup] = useState(false);
  const [userInteractions, setUserInteractions] = useState(0);
  const [timeOnPage, setTimeOnPage] = useState(0);

  // Refs for intersection observer
  const heroRef = useRef(null);
  const commitmentRef = useRef(null);
  const productsRef = useRef(null);
  const blogRef = useRef(null);
  const testimonialsRef = useRef(null);
  const statsRef = useRef(null);

  // Animation states
  const [visibleSections, setVisibleSections] = useState({
    hero: false,
    commitments: false,
    products: false,
    blog: false,
    testimonials: false,
    stats: false,
  });

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // Enhanced scroll tracking and smart popup logic
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);

      // Track user engagement for smart newsletter popup
      if (
        window.scrollY > 1000 &&
        userInteractions > 3 &&
        timeOnPage > 30 &&
        !showSmartPopup
      ) {
        setTimeout(() => setShowSmartPopup(true), 2000);
      }
    };

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleUserInteraction = () => {
      setUserInteractions((prev) => prev + 1);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);

    // Time on page tracker
    const timer = setInterval(() => {
      setTimeOnPage((prev) => prev + 1);
    }, 1000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
      clearInterval(timer);
    };
  }, [userInteractions, timeOnPage, showSmartPopup]);

  // Auto-rotating testimonials
  useEffect(() => {
    const testimonials = [
      {
        id: 1,
        name: "Sarah Johnson",
        position: "CEO at TechStart",
        content:
          "Expert Office Furnish transformed our workspace completely. The ergonomic chairs have significantly improved our team's productivity and comfort.",
        rating: 5,
        image: "/api/placeholder/64/64",
      },
      {
        id: 2,
        name: "Michael Chen",
        position: "Operations Manager",
        content:
          "Outstanding quality and service! The delivery was prompt and the installation team was professional. Highly recommend for any office setup.",
        rating: 5,
        image: "/api/placeholder/64/64",
      },
      {
        id: 3,
        name: "Emma Davis",
        position: "Creative Director",
        content:
          "Beautiful designs that perfectly match our brand aesthetic. The furniture is not only stylish but incredibly functional for our creative team.",
        rating: 5,
        image: "/api/placeholder/64/64",
      },
    ];

    const testimonialTimer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(testimonialTimer);
  }, []);

  // Animate stats counter
  useEffect(() => {
    if (visibleSections.stats) {
      const targetStats = {
        customers: 1250,
        products: 500,
        reviews: 4.9,
        yearsExperience: 15,
      };
      const duration = 2000;
      const steps = 60;
      const stepTime = duration / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        setStats({
          customers: Math.floor(targetStats.customers * progress),
          products: Math.floor(targetStats.products * progress),
          reviews: parseFloat((targetStats.reviews * progress).toFixed(1)),
          yearsExperience: Math.floor(targetStats.yearsExperience * progress),
        });

        if (currentStep >= steps) {
          clearInterval(timer);
          setStats(targetStats);
        }
      }, stepTime);
    }
  }, [visibleSections.stats]);

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
      statsRef,
    ];
    sections.forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  // Data structures for enhanced content
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      position: "CEO at TechStart",
      content:
        "Expert Office Furnish transformed our workspace completely. The ergonomic chairs have significantly improved our team's productivity and comfort.",
      rating: 5,
      image: "/api/placeholder/64/64",
    },
    {
      id: 2,
      name: "Michael Chen",
      position: "Operations Manager",
      content:
        "Outstanding quality and service! The delivery was prompt and the installation team was professional. Highly recommend for any office setup.",
      rating: 5,
      image: "/api/placeholder/64/64",
    },
    {
      id: 3,
      name: "Emma Davis",
      position: "Creative Director",
      content:
        "Beautiful designs that perfectly match our brand aesthetic. The furniture is not only stylish but incredibly functional for our creative team.",
      rating: 5,
      image: "/api/placeholder/64/64",
    },
  ];

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast Delivery",
      description:
        "Get your furniture delivered within 24-48 hours in major cities",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Quality Assurance",
      description:
        "Premium materials and craftsmanship on all furniture pieces",
      color: "from-blue-500 to-purple-500",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Award-Winning Design",
      description:
        "Internationally recognized designs that win industry awards",
      color: "from-green-500 to-teal-500",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Customer Love",
      description:
        "99% customer satisfaction rate with thousands of happy clients",
      color: "from-pink-500 to-red-500",
    },
  ];

  // Newsletter subscription handler
  const handleNewsletterSubscribe = async (email, source = "modal") => {
    try {
      // Smart newsletter logic - different benefits based on source
      const benefits =
        source === "popup"
          ? { discount: 15, freeShipping: true, earlyAccess: true }
          : { discount: 10, freeShipping: true };

      console.log("Newsletter subscription:", { email, source, benefits });
      // Here you would typically send to your backend/email service

      setNewsletterEmail("");
      setShowNewsletterModal(false);
      setShowSmartPopup(false);

      // Show success message (you can replace with toast)
      alert(
        `🎉 Welcome! Check your email for a ${benefits.discount}% discount code!`
      );
    } catch (error) {
      console.error("Newsletter subscription error:", error);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .limit(4);
        if (error) console.error("Failed to fetch products:", error);
        else setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };

    const fetchBlogPosts = async () => {
      setIsBlogLoading(true);
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select(
            `
            id,
            title,
            excerpt,
            content,
            created_at,
            image_url,
            tags,
            users!blog_posts_author_id_fkey(name, email)
          `
          )
          .eq("status", "Published")
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) {
          console.error("Failed to fetch blog posts:", error);
          setBlogPosts([
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
              title: "Maximizing Small Office Spaces",
              excerpt:
                "Smart furniture solutions and layout ideas to make the most of compact work environments.",
              created_at: "2024-07-20",
              image_url: null,
            },
          ]);
        } else {
          setBlogPosts(data || []);
        }
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        setTimeout(() => setIsBlogLoading(false), 800);
      }
    };

    fetchProducts();
    fetchBlogPosts();
  }, []);

  const filteredProducts = searchTerm
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  return (
    <div className="bg-gray-50 text-gray-900 overflow-x-hidden selection:bg-yellow-500 selection:text-white">
      {/* Header Component */}
      <Header />

      {/* Smart Newsletter Popup */}
      {showSmartPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
            <div className="text-center relative z-10">
              <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <Gift className="w-10 h-10 text-yellow-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">
                Wait! Don't Miss Out!
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                You've been browsing for a while! Get <strong className="text-yellow-600">15% OFF</strong>{" "}
                your first order + free shipping + early access to new
                collections!
              </p>
              <div className="space-y-4">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                />
                <button
                  onClick={() =>
                    handleNewsletterSubscribe(newsletterEmail, "popup")
                  }
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                >
                  Claim My 15% Discount
                </button>
                <button
                  onClick={() => setShowSmartPopup(false)}
                  className="text-gray-400 text-sm hover:text-gray-600 transition-colors"
                >
                  No thanks, I'm not interested
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowSmartPopup(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Creative Hero Section */}
      <section
        ref={heroRef}
        data-section="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-900 py-20"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Modern Office"
            className="w-full h-full object-cover opacity-30 scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-900"></div>
          
          {/* Animated Blobs */}
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-green-600/20 rounded-full blur-[120px] animate-pulse mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-yellow-500/20 rounded-full blur-[120px] animate-pulse delay-1000 mix-blend-screen"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className={`transition-all duration-1000 ${visibleSections.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center px-6 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-yellow-400 mb-10 hover:bg-white/10 transition-colors cursor-default">
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              <span className="text-sm font-medium tracking-wider uppercase">Premium Office Solutions</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 tracking-tight leading-tight">
              Transform Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-yellow-400 to-orange-400 animate-gradient-x">
                Workspace
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
              Premium ergonomic furniture designed for health, productivity, and modern aesthetics. 
              Join <span className="text-white font-semibold">1,250+ satisfied customers</span> who transformed their offices with us.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/shop"
                className="group relative px-10 py-5 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full text-white font-bold text-lg shadow-lg hover:shadow-green-500/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Shop Collection <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>

              <button
                onClick={() => setShowVideoModal(true)}
                className="group px-10 py-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300 flex items-center hover:-translate-y-1"
              >
                <Play className="w-5 h-5 mr-3 fill-current group-hover:text-yellow-400 transition-colors" />
                Watch Story
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/30">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-white/50 rounded-full animate-scroll"></div>
          </div>
        </div>
      </section>

      {/* Features Section (Why Choose Us) */}
      <section
        ref={commitmentRef}
        data-section="commitments"
        className="py-32 bg-gray-50 relative overflow-hidden"
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gray-100 to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className={`text-center mb-20 transition-all duration-1000 ${visibleSections.commitments ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Experience The <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-yellow-600">Difference</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied customers who've transformed their workspaces with our premium solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative p-8 bg-white rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 ${visibleSections.commitments ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{feature.description}</p>
                
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-gray-100 to-transparent group-hover:via-yellow-400 transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Stats Section */}
      <section
        ref={statsRef}
        data-section="stats"
        className="py-24 bg-gray-900 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 to-yellow-900/20"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div className={`transition-all duration-1000 ${visibleSections.stats ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
              <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-2 font-mono">
                {Math.floor(stats.customers).toLocaleString()}+
              </div>
              <div className="text-gray-400 font-medium tracking-wide uppercase text-sm">Happy Customers</div>
            </div>
            <div className={`transition-all duration-1000 delay-100 ${visibleSections.stats ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
              <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-green-300 to-green-600 mb-2 font-mono">
                {Math.floor(stats.products)}+
              </div>
              <div className="text-gray-400 font-medium tracking-wide uppercase text-sm">Premium Products</div>
            </div>
            <div className={`transition-all duration-1000 delay-200 ${visibleSections.stats ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
              <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-blue-300 to-blue-600 mb-2 font-mono">
                {stats.reviews.toFixed(1)}★
              </div>
              <div className="text-gray-400 font-medium tracking-wide uppercase text-sm">Average Rating</div>
            </div>
            <div className={`transition-all duration-1000 delay-300 ${visibleSections.stats ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
              <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-purple-300 to-purple-600 mb-2 font-mono">
                {Math.floor(stats.yearsExperience)}+
              </div>
              <div className="text-gray-400 font-medium tracking-wide uppercase text-sm">Years Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section
        ref={productsRef}
        data-section="products"
        className="py-32 bg-white relative"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div className={`transition-all duration-1000 ${visibleSections.products ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Featured <span className="italic text-green-600 font-serif">Collection</span>
              </h2>
              <p className="text-gray-600 text-lg max-w-md">
                Handpicked premium office furniture designed to elevate your workspace environment.
              </p>
            </div>
            <Link 
              to="/shop" 
              className={`hidden md:flex items-center text-gray-900 font-bold hover:text-green-600 transition-colors group transition-all duration-1000 delay-200 ${visibleSections.products ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
            >
              View All Products 
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ml-3 group-hover:bg-green-100 transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-3xl h-96 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className={`group relative bg-white rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${visibleSections.products ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-64 overflow-hidden rounded-t-[2rem]">
                    <img
                      src={product.image_url || "/api/placeholder/300/200"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-green-700 shadow-sm">
                      In Stock
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <Link to={`/product/${product.id}`}>
                        <button className="w-full bg-white text-gray-900 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors shadow-lg">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm font-medium text-gray-400">
                        {product.stock_quantity} units left
                      </span>
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-green-50 transition-colors">
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-12 text-center md:hidden">
             <Link to="/shop" className="inline-flex items-center font-bold text-green-600">
                View All Products <ArrowRight className="ml-2 w-5 h-5" />
             </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        ref={testimonialsRef}
        data-section="testimonials"
        className="py-32 bg-gray-50 relative overflow-hidden"
      >
        {/* Background Decoration */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-96 bg-gradient-to-r from-yellow-500/5 via-orange-500/5 to-transparent -skew-y-3 pointer-events-none"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className={`text-center mb-20 transition-all duration-1000 ${visibleSections.testimonials ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-50 text-red-500 mb-6">
              <Heart className="w-4 h-4 mr-2 fill-current" />
              <span className="text-sm font-bold uppercase tracking-wider">Customer Love</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              What Our Customers <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-red-500">Are Saying</span>
            </h2>
          </div>

          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                    <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl max-w-4xl mx-auto text-center relative">
                      <div className="absolute top-10 left-10 text-9xl text-gray-100 font-serif leading-none select-none">"</div>
                      
                      <div className="relative z-10">
                        <div className="flex justify-center gap-1 mb-8">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        
                        <blockquote className="text-2xl md:text-3xl text-gray-800 font-medium leading-relaxed mb-10">
                          {testimonial.content}
                        </blockquote>
                        
                        <div className="flex items-center justify-center gap-4">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-400 p-1">
                            <img
                              src={testimonial.image}
                              alt={testimonial.name}
                              className="w-full h-full rounded-full object-cover bg-gray-200"
                            />
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                            <div className="text-gray-500 text-sm">{testimonial.position}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center mt-12 gap-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? "bg-yellow-500 w-8"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section
        ref={blogRef}
        data-section="blog"
        className="py-32 bg-white"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className={`text-center mb-20 transition-all duration-1000 ${visibleSections.blog ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Insights</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Stay updated with the latest trends in office design
            </p>
          </div>

          {isBlogLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-3xl h-96 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <article
                  key={post.id}
                  className={`group bg-white rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-gray-200 hover:-translate-y-2 ${visibleSections.blog ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={post.image_url || "/api/placeholder/400/250"}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800">
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="font-bold text-xl text-gray-900 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-6 line-clamp-3 text-sm leading-relaxed">
                      {post.excerpt}
                    </p>
                    <Link
                      to={`/blog/${post.id}`}
                      className="inline-flex items-center text-blue-600 font-bold group-hover:translate-x-2 transition-transform duration-300"
                    >
                      Read Article <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
          
          <div className="text-center mt-16">
            <Link to="/blog">
              <button className="px-8 py-4 rounded-full border-2 border-gray-200 text-gray-900 font-bold hover:border-blue-600 hover:text-blue-600 transition-all duration-300">
                View All Articles
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Component */}
      <Footer />
    </div>
  );
}
