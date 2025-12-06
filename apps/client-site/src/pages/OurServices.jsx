import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Star,
  CheckCircle2,
  Users,
  Award,
  Target,
  Zap,
  Heart,
  Shield,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import Footer from "../components/footer";
import Header from "../components/header";
import Design from "../assets/Design.jpg";
import Refurbish from "../assets/Refurbish.jpg";
import Consultancy from "../assets/Consultancy.jpg";
import Fitouts from "../assets/Fitouts.jpg";
import Interior from "../assets/Interior Decor.jpg";
import ExpertOffice from "../assets/ExpertOffice.jpg";

const services = [
  {
    title: "Furniture Providers",
    description:
      "Premium office furniture solutions tailored to your business needs and budget.",
    detailedDescription:
      "High-quality, ergonomic furniture designed to enhance productivity and comfort in any office environment.",
    image: ExpertOffice,
    path: "/shop",
    icon: <Users className="w-6 h-6" />,
    features: [
      "Ergonomic Design",
      "Quality Materials",
      "Custom Solutions",
      "Budget-Friendly",
    ],
    color: "from-green-500 to-emerald-600",
  },
  {
    title: "Office Design",
    description:
      "Expert 2D/3D design services to optimize your workspace layout and functionality.",
    detailedDescription:
      "Professional design consultation with detailed 2D and 3D visualizations to create the perfect office environment.",
    image: Design,
    path: "/interior-decor",
    icon: <Lightbulb className="w-6 h-6" />,
    features: [
      "2D/3D Visualization",
      "Space Planning",
      "Furniture Selection",
      "Layout Optimization",
    ],
    color: "from-blue-500 to-cyan-600",
  },
  {
    title: "Office Fitouts",
    description:
      "Complete turnkey fitout solutions from concept to completion.",
    detailedDescription:
      "End-to-end fitout services including planning, design, procurement, and installation for modern office spaces.",
    image: Fitouts,
    path: "/inquiry",
    icon: <Target className="w-6 h-6" />,
    features: [
      "Turnkey Solutions",
      "Project Management",
      "Quality Installation",
      "Timeline Delivery",
    ],
    color: "from-purple-500 to-indigo-600",
  },
  {
    title: "Consultancy",
    description:
      "Strategic consulting for office planning, design optimization, and staff training.",
    detailedDescription:
      "Expert advisory services covering project planning, space optimization, and comprehensive staff training programs.",
    image: Consultancy,
    path: "/inquiry",
    icon: <Award className="w-6 h-6" />,
    features: [
      "Strategic Planning",
      "Expert Advice",
      "Training Programs",
      "Ongoing Support",
    ],
    color: "from-yellow-500 to-orange-600",
  },
  {
    title: "Office Refurbishment",
    description:
      "Transform existing spaces into modern, functional work environments.",
    detailedDescription:
      "Complete office makeovers that blend style, comfort, and functionality while respecting your budget and timeline.",
    image: Refurbish,
    path: "/inquiry",
    icon: <TrendingUp className="w-6 h-6" />,
    features: [
      "Modern Makeovers",
      "Budget Conscious",
      "Style & Comfort",
      "Quick Turnaround",
    ],
    color: "from-red-500 to-pink-600",
  },
  {
    title: "Interior Decoration",
    description:
      "Comprehensive interior design solutions that reflect your corporate identity.",
    detailedDescription:
      "Tailored interior decoration services incorporating corporate colors and branding to create inspiring work environments.",
    image: Interior,
    path: "/interior-decor",
    icon: <Heart className="w-6 h-6" />,
    features: [
      "Corporate Branding",
      "Color Coordination",
      "Productivity Focus",
      "Aesthetic Appeal",
    ],
    color: "from-teal-500 to-green-600",
  },
];

export default function OurServicesPage() {
  const navigate = useNavigate();
  const [visibleCards, setVisibleCards] = useState(new Set());
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const observerRef = useRef(null);

  const handleServiceInquiry = (serviceName) => {
    navigate("/inquiry", {
      state: {
        fromCart: false,
        includeProducts: false,
        fromService: true,
        serviceName: serviceName,
        cartItems: [],
      },
    });
  };

  // Parallax effect for hero
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const moveX = (clientX - window.innerWidth / 2) * 0.05;
    const moveY = (clientY - window.innerHeight / 2) * 0.05;
    setMousePosition({ x: moveX, y: moveY });
  };

  // Initialize intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCards(
              (prev) => new Set([...prev, entry.target.dataset.index])
            );
          }
        });
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    observerRef.current = observer;

    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      clearTimeout(timer);
    };
  }, []);

  // Add cards to observer when component mounts
  useEffect(() => {
    if (!isLoading) {
      const cards = document.querySelectorAll('[data-animate="card"]');
      cards.forEach((card) => {
        if (observerRef.current) {
          observerRef.current.observe(card);
        }
      });
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-white/20 border-t-green-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            </div>
            <p className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white/60 text-sm tracking-widest uppercase">
              Loading Services
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" onMouseMove={handleMouseMove}>
      <Header />

      {/* Interactive Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden bg-gray-900 perspective-1000">
        {/* Parallax Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute -top-24 -left-24 w-96 h-96 bg-green-500/20 rounded-full blur-[100px] transition-transform duration-100 ease-out"
            style={{ transform: `translate(${mousePosition.x * -1}px, ${mousePosition.y * -1}px)` }}
          ></div>
          <div 
            className="absolute top-1/2 right-0 w-80 h-80 bg-yellow-500/20 rounded-full blur-[100px] transition-transform duration-100 ease-out"
            style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
          ></div>
          <div 
            className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] transition-transform duration-100 ease-out"
            style={{ transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)` }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto text-center z-10">
          <div className="inline-flex items-center px-6 py-2 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-full text-sm font-medium mb-8 animate-fadeInDown hover:bg-white/10 transition-all cursor-default hover:scale-105 duration-300">
            <Sparkles className="w-4 h-4 mr-2 text-yellow-400 animate-spin-slow" />
            Premium Office Solutions
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-8 animate-fadeInUp tracking-tighter text-white">
            Transform Your
            <span className="relative inline-block ml-4">
              <span className="relative z-10 bg-gradient-to-r from-green-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Workspace
              </span>
              <span className="absolute -bottom-2 left-0 w-full h-3 bg-green-500/30 blur-lg transform -skew-x-12"></span>
            </span>
          </h1>

          <div className="max-w-2xl mx-auto mb-12 animate-fadeInUp animation-delay-200">
            <p className="text-xl text-gray-300 leading-relaxed font-light">
              Comprehensive office solutions designed to enhance productivity,
              comfort, and style. From furniture to full fitouts, we create
              spaces that inspire success.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fadeInUp animation-delay-400">
            <Link
              to="/shop"
              className="group relative px-8 py-4 bg-white text-black rounded-2xl font-bold overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center gap-2 group-hover:text-white transition-colors">
                Browse Products
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <button
              onClick={() => handleServiceInquiry("General Consultation")}
              className="px-8 py-4 bg-white/5 backdrop-blur-md text-white rounded-2xl font-bold border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 flex items-center gap-2 group"
            >
              Get Consultation
              <Shield className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300 text-green-400" />
            </button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-[1800px] mx-auto px-4 py-20 -mt-20 relative z-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <div
              key={index}
              data-index={index}
              data-animate="card"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`group relative bg-white rounded-[2.5rem] shadow-2xl transition-all duration-700 overflow-hidden transform hover:-translate-y-4 ${
                visibleCards.has(index.toString())
                  ? "animate-fadeInUp opacity-100"
                  : "opacity-0 translate-y-20"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Service Image */}
              <div className="relative h-96 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-all duration-500"></div>

                {/* Floating Icon */}
                <div
                  className={`absolute top-8 left-8 p-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white shadow-2xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-white/20`}
                >
                  {service.icon}
                </div>

                {/* Title Overlay - Slides up on hover */}
                <div className="absolute bottom-0 left-0 right-0 p-8 transform transition-transform duration-500 translate-y-4 group-hover:translate-y-0">
                  <h3 className="text-3xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors leading-tight">
                    {service.title}
                  </h3>
                  <div className="h-1 w-12 bg-green-500 rounded-full mb-4 transition-all duration-500 group-hover:w-24 group-hover:bg-yellow-400"></div>
                  <p className="text-gray-200 text-lg line-clamp-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 transform translate-y-4 group-hover:translate-y-0">
                    {service.detailedDescription}
                  </p>
                </div>
              </div>

              {/* Service Content - Reveals on hover */}
              <div className="p-8 relative bg-white transform transition-all duration-500">
                <p className="text-gray-600 mb-8 leading-relaxed text-lg font-light">
                  {service.description}
                </p>

                {/* Features */}
                <div className="mb-8 space-y-4">
                  {service.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-center text-gray-700 group/feature transform transition-all duration-300 hover:translate-x-2"
                    >
                      <div className={`w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mr-4 group-hover/feature:bg-green-100 transition-colors shadow-sm`}>
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                {service.path === "/inquiry" ? (
                  <button
                    onClick={() => handleServiceInquiry(service.title)}
                    className={`w-full py-5 px-6 rounded-2xl font-bold text-white shadow-lg transform transition-all duration-300 flex items-center justify-center group/btn bg-gradient-to-r ${service.color} hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1`}
                  >
                    <span>Get Quote</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </button>
                ) : (
                  <Link to={service.path}>
                    <button
                      className={`w-full py-5 px-6 rounded-2xl font-bold text-white shadow-lg transform transition-all duration-300 flex items-center justify-center group/btn bg-gradient-to-r ${service.color} hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1`}
                    >
                      <span>Explore Service</span>
                      <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section - Dark Glassmorphism */}
      <section className="relative py-32 px-4 overflow-hidden bg-gray-900 mt-20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 fixed-bg"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/90 to-gray-900"></div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-sm font-medium mb-8 text-white">
            <Zap className="w-4 h-4 mr-2 text-yellow-400" />
            Our Mission
          </div>

          <h3 className="text-5xl sm:text-7xl font-bold mb-8 text-white tracking-tighter">
            Creating Exceptional
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-400 mt-2">
              Workspaces
            </span>
          </h3>

          <p className="text-2xl leading-relaxed mb-16 text-gray-300 font-light max-w-4xl mx-auto">
            At Expert Office Furnish, our mission is to transform ordinary
            office spaces into extraordinary work environments. We combine years
            of expertise with innovative design solutions.
          </p>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { icon: Users, title: "500+ Clients", sub: "Trusted by businesses", color: "from-green-500 to-emerald-600" },
              { icon: Award, title: "15+ Years", sub: "Industry experience", color: "from-blue-500 to-cyan-600" },
              { icon: Star, title: "Premium Quality", sub: "Finest materials", color: "from-yellow-500 to-orange-600" }
            ].map((stat, idx) => (
              <div key={idx} className="group p-8 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2">
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  <stat.icon className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-3xl font-bold text-white mb-2">{stat.title}</h4>
                <p className="text-gray-400 text-lg">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
