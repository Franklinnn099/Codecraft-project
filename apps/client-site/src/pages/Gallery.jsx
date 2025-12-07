import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  X,
  Filter,
  Grid,
  LayoutGrid,
  Eye,
  ZoomIn,
  Sparkles,
  Star,
  Heart,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Image as ImageIcon,
  Play,
  Download,
} from "lucide-react";
import Footer from "../components/footer";
import Header from "../components/header";
import swivel from "../assets/Swivel.jpg";
import Executivedesk from "../assets/Executivedesk.jpg";
import Cabinet from "../assets/Cabinet.jpg";
import Sofa from "../assets/sofa.png";
import RectangularDesk from "../assets/RectangularDesk.jpg";
import Canteen from "../assets/Canteen Chair.JPG";
import Executivedesk2 from "../assets/Executivedesk2.png";
import Executivedesk3 from "../assets/Executivedesk3.jpg";
import Teller from "../assets/Teller.JPG";
import MetalCabinet from "../assets/MetalCabinet.jpg";
import MetalCabinet1 from "../assets/MetalCabinet1.jpg";
import Orthopedic from "../assets/Orthopedic.jpg";
import Sofa1 from "../assets/Sofa1.png";

// Enhanced products with better data structure
const products = [
  {
    id: 1,
    name: "Ergonomic Swivel Chair",
    category: "Chairs",
    image: swivel,
    description: "Premium ergonomic chair with lumbar support",
    featured: true,
    tags: ["Ergonomic", "Swivel", "Premium"],
  },
  {
    id: 2,
    name: "Executive Desk",
    category: "Desks",
    image: Executivedesk,
    description: "Spacious executive desk for professional workspace",
    featured: true,
    tags: ["Executive", "Spacious", "Professional"],
  },
  {
    id: 3,
    name: "Bookshelf Cabinet",
    category: "Cabinets",
    image: Cabinet,
    description: "Multi-tier storage cabinet for office organization",
    featured: false,
    tags: ["Storage", "Organization", "Multi-tier"],
  },
  {
    id: 4,
    name: "Luxury Sofa Set",
    category: "Sofas",
    image: Sofa,
    description: "Comfortable luxury sofa for reception areas",
    featured: true,
    tags: ["Luxury", "Comfortable", "Reception"],
  },
  {
    id: 5,
    name: "Rectangular Desk",
    category: "Desks",
    image: RectangularDesk,
    description: "Modern rectangular desk with clean lines",
    featured: false,
    tags: ["Modern", "Clean", "Minimalist"],
  },
  {
    id: 6,
    name: "Canteen Chair",
    category: "Chairs",
    image: Canteen,
    description: "Durable canteen chair for dining areas",
    featured: false,
    tags: ["Durable", "Canteen", "Dining"],
  },
  {
    id: 7,
    name: "Premium Executive Desk",
    category: "Desks",
    image: Executivedesk2,
    description: "High-end executive desk with premium finish",
    featured: true,
    tags: ["Premium", "Executive", "High-end"],
  },
  {
    id: 8,
    name: "Designer Sofa",
    category: "Sofas",
    image: Sofa1,
    description: "Contemporary designer sofa with modern appeal",
    featured: true,
    tags: ["Designer", "Contemporary", "Modern"],
  },
  {
    id: 9,
    name: "Executive Workspace",
    category: "Desks",
    image: Executivedesk3,
    description: "Complete executive workspace solution",
    featured: false,
    tags: ["Executive", "Workspace", "Complete"],
  },
  {
    id: 10,
    name: "Orthopedic Chair",
    category: "Chairs",
    image: Orthopedic,
    description: "Orthopedic support chair for health-conscious users",
    featured: true,
    tags: ["Orthopedic", "Health", "Support"],
  },
  {
    id: 11,
    name: "Teller Station Chair",
    category: "Chairs",
    image: Teller,
    description: "Professional teller station seating solution",
    featured: false,
    tags: ["Professional", "Teller", "Station"],
  },
  {
    id: 12,
    name: "Industrial Cabinet",
    category: "Cabinets",
    image: MetalCabinet,
    description: "Heavy-duty metal cabinet for industrial use",
    featured: false,
    tags: ["Industrial", "Heavy-duty", "Metal"],
  },
  {
    id: 13,
    name: "Steel Storage Cabinet",
    category: "Cabinets",
    image: MetalCabinet1,
    description: "Secure steel storage with multiple compartments",
    featured: false,
    tags: ["Steel", "Secure", "Storage"],
  },
];

const categories = [
  { name: "All", icon: LayoutGrid, count: products.length },
  {
    name: "Chairs",
    icon: ImageIcon,
    count: products.filter((p) => p.category === "Chairs").length,
  },
  {
    name: "Desks",
    icon: ImageIcon,
    count: products.filter((p) => p.category === "Desks").length,
  },
  {
    name: "Cabinets",
    icon: ImageIcon,
    count: products.filter((p) => p.category === "Cabinets").length,
  },
  {
    name: "Sofas",
    icon: ImageIcon,
    count: products.filter((p) => p.category === "Sofas").length,
  },
];

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [modalImage, setModalImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("masonry"); // Default to masonry for more creative feel
  const [favorites, setFavorites] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Simulate loading effect
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Parallax effect for hero
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const moveX = (clientX - window.innerWidth / 2) * 0.05;
    const moveY = (clientY - window.innerHeight / 2) * 0.05;
    setMousePosition({ x: moveX, y: moveY });
  };

  // Intersection Observer for animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fadeInUp");
          entry.target.classList.remove("opacity-0", "translate-y-10");
        }
      });
    }, observerOptions);

    const galleryItems = document.querySelectorAll(".gallery-item");
    galleryItems.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [selectedCategory, searchTerm, viewMode]);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  const openModal = (product) => {
    setModalImage(product);
    const index = filteredProducts.findIndex((p) => p.id === product.id);
    setCurrentImageIndex(index);
  };

  const navigateModal = (direction) => {
    const newIndex =
      direction === "next"
        ? (currentImageIndex + 1) % filteredProducts.length
        : (currentImageIndex - 1 + filteredProducts.length) %
          filteredProducts.length;

    setCurrentImageIndex(newIndex);
    setModalImage(filteredProducts[newIndex]);
  };

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
              Curating Gallery
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
      <div className="relative py-32 px-4 overflow-hidden bg-gray-900 perspective-1000">
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
            Curated Design Collection
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-8 animate-fadeInUp tracking-tighter text-white">
            Visual
            <span className="relative inline-block ml-4">
              <span className="relative z-10 bg-gradient-to-r from-green-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Masterpieces
              </span>
              <span className="absolute -bottom-2 left-0 w-full h-3 bg-green-500/30 blur-lg transform -skew-x-12"></span>
            </span>
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12 animate-fadeInUp animation-delay-200 leading-relaxed font-light">
            Explore our gallery of premium office aesthetics. Where functionality meets artistic design in every detail.
          </p>

          {/* Floating Search Bar */}
          <div className="max-w-xl mx-auto mb-16 animate-fadeInUp animation-delay-400 relative z-20">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-yellow-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl flex items-center p-2 border border-white/10 shadow-2xl">
                <Search className="ml-4 text-gray-400 w-6 h-6 group-focus-within:text-yellow-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Search for inspiration..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 text-lg"
                />
                <button className="bg-white text-black p-3 rounded-xl hover:bg-yellow-400 transition-all duration-300 hover:rotate-90">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-20">
        {/* Glassmorphism Controls */}
        <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/20 p-4 mb-12 flex flex-col lg:flex-row items-center justify-between gap-6 animate-fadeInUp">
          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              const isActive = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-300 overflow-hidden group ${
                    isActive ? "text-black shadow-lg scale-105" : "text-white/70 hover:bg-white/10"
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-yellow-400 animate-gradient-x"></div>
                  )}
                  <div className="relative flex items-center gap-2">
                    <IconComponent className={`w-4 h-4 ${isActive ? "text-black" : "text-white/50 group-hover:text-white"}`} />
                    <span>{cat.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive ? "bg-black/20 text-black" : "bg-white/10 text-white/50"
                    }`}>
                      {cat.count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* View Toggles */}
          <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-3 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                viewMode === "grid"
                  ? "bg-white text-black shadow-lg"
                  : "text-white/50 hover:text-white"
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("masonry")}
              className={`p-3 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                viewMode === "masonry"
                  ? "bg-white text-black shadow-lg"
                  : "text-white/50 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results Counter */}
        {searchTerm && (
          <div className="mb-8 text-center animate-fadeIn">
            <p className="text-gray-500 text-lg">
              Found <span className="text-gray-900 font-bold">{filteredProducts.length}</span> masterpieces
            </p>
          </div>
        )}

        {/* Creative Gallery Grid */}
        <div
          className={`${
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              : "columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8"
          }`}
        >
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className={`gallery-item group relative break-inside-avoid rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-700 ease-out hover:z-10 ${
                viewMode === "masonry" ? "mb-8" : ""
              }`}
              onClick={() => openModal(product)}
              style={{ 
                animation: `fadeInUp 0.6s ease-out ${index * 50}ms both`
              }}
            >
              {/* Image Container with Tilt Effect */}
              <div className="relative overflow-hidden bg-gray-200 aspect-[3/4] transform transition-transform duration-700 group-hover:scale-[1.02]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-all duration-500"></div>

                {/* Content Overlay - Slide Up Effect */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  {/* Top Tags */}
                  <div className="absolute top-6 left-6 flex flex-wrap gap-2 transform -translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    {product.featured && (
                      <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> FEATURED
                      </span>
                    )}
                  </div>

                  {/* Main Info */}
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-green-400 text-sm font-bold tracking-wider uppercase mb-2 block">
                      {product.category}
                    </span>
                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:text-yellow-400 transition-colors">
                      {product.name}
                    </h3>
                    
                    {/* Hidden Details Reveal */}
                    <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
                      <div className="overflow-hidden">
                        <p className="text-gray-300 text-sm line-clamp-2 mb-4 pt-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-white/20">
                          <div className="flex gap-2">
                            {product.tags.slice(0, 2).map((tag, idx) => (
                              <span key={idx} className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded-md">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(product.id);
                              }}
                              className="p-2 bg-white/10 hover:bg-white text-white hover:text-red-500 rounded-full transition-all duration-300"
                            >
                              <Heart className={`w-4 h-4 ${favorites.has(product.id) ? "fill-red-500 text-red-500" : ""}`} />
                            </button>
                            <button className="p-2 bg-white text-black rounded-full hover:bg-yellow-400 transition-colors">
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-32">
            <div className="inline-block p-6 rounded-full bg-gray-100 mb-6 animate-bounce">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              No masterpieces found
            </h3>
            <p className="text-gray-500 mb-8 text-lg">
              We couldn't find any matches for "{searchTerm}"
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              className="bg-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all duration-300 hover:scale-105 shadow-xl"
            >
              View Full Collection
            </button>
          </div>
        )}
      </div>

      {/* Immersive Modal Experience */}
      {modalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl transition-opacity duration-500" onClick={() => setModalImage(null)}></div>
          
          <div className="relative w-full max-w-7xl h-[85vh] bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row animate-scaleIn border border-white/10">
            {/* Close Button */}
            <button
              onClick={() => setModalImage(null)}
              className="absolute top-6 right-6 z-50 p-3 bg-black/50 text-white rounded-full hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-md border border-white/10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image Section */}
            <div className="relative lg:w-2/3 h-1/2 lg:h-full bg-black flex items-center justify-center group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 pointer-events-none z-10"></div>
              <img
                src={modalImage.image}
                alt={modalImage.name}
                className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Navigation Arrows */}
              {filteredProducts.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigateModal("prev"); }}
                    className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 text-white rounded-full hover:bg-white hover:text-black transition-all backdrop-blur-md border border-white/10 z-20 hover:scale-110"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigateModal("next"); }}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 text-white rounded-full hover:bg-white hover:text-black transition-all backdrop-blur-md border border-white/10 z-20 hover:scale-110"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Info Section */}
            <div className="lg:w-1/3 h-1/2 lg:h-full bg-white p-8 lg:p-12 overflow-y-auto relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-yellow-500"></div>
              
              <div className="flex items-center justify-between mb-8">
                <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-bold tracking-wider uppercase">
                  {modalImage.category}
                </span>
                <div className="flex gap-3">
                  <button 
                    onClick={() => toggleFavorite(modalImage.id)}
                    className={`p-3 rounded-full border transition-all duration-300 ${
                      favorites.has(modalImage.id) 
                        ? "border-red-200 bg-red-50 text-red-500 scale-110" 
                        : "border-gray-100 hover:border-gray-300 text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${favorites.has(modalImage.id) ? "fill-current" : ""}`} />
                  </button>
                  <button className="p-3 rounded-full border border-gray-100 hover:border-gray-300 text-gray-400 hover:text-gray-600 transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
                {modalImage.name}
              </h2>

              <div className="space-y-8 mb-10">
                <p className="text-gray-600 text-lg leading-relaxed font-light">
                  {modalImage.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {modalImage.tags.map((tag, idx) => (
                    <span key={idx} className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-sm font-medium border border-gray-100">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-6 pt-8 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Product ID</span>
                  <span className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">#{modalImage.id.toString().padStart(4, '0')}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Availability</span>
                  <span className="text-green-600 font-bold flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    In Stock
                  </span>
                </div>
              </div>

              <div className="mt-10">
                <Link
                  to={`/product/${modalImage.id}`}
                  className="group block w-full py-5 bg-black text-white text-center rounded-2xl font-bold hover:bg-gray-800 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                  <span className="flex items-center justify-center gap-2">
                    View Full Details 
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
