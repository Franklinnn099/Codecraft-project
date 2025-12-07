import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Share2,
  ShoppingCart,
  Plus,
  Minus,
  Truck,
  Shield,
  RefreshCw,
  Package,
  Check,
  Sparkles,
  MessageCircle,
  ThumbsUp,
  FileText,
  Grid,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Zap,
  Award,
  Clock,
  Star,
  Box,
  Info,
  Eye,
  Layers,
  X,
  Copy,
  CheckCircle
} from "lucide-react";
import { supabase } from "../supabase/supabaseClient";
import { useCart } from "../context/CartContext";
import Header from "../components/header";
import Footer from "../components/footer";
import RelatedProducts from "../components/RelatedProducts";
import { trackProductView } from "../utils/userBehaviorTracker";
import dataCache, { CACHE_KEYS } from "../utils/dataCache";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const imageRef = useRef(null);
  
  // Core state
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [productDiscount, setProductDiscount] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [ratingStats, setRatingStats] = useState({ average: 0, count: 0 });
  
  // Interactive states
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [imageZoom, setImageZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [addedToCart, setAddedToCart] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ customerName: "", customerEmail: "", rating: 5, title: "", reviewText: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitMessage, setReviewSubmitMessage] = useState({ type: "", text: "" });
  const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0);

  // Parallax effect
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const moveX = (clientX - window.innerWidth / 2) * 0.01;
    const moveY = (clientY - window.innerHeight / 2) * 0.01;
    setMousePosition({ x: moveX, y: moveY });
  };

  // Image zoom handler
  const handleImageMouseMove = (e) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  // Parse additional images
  const parseAdditionalImages = (additional_images) => {
    if (!additional_images) return [];
    if (Array.isArray(additional_images)) {
      return additional_images.filter((img) => typeof img === "string" && img.trim() !== "").slice(0, 8);
    }
    if (typeof additional_images === "string") {
      try {
        const parsed = JSON.parse(additional_images);
        if (Array.isArray(parsed)) {
          return parsed.filter((img) => typeof img === "string" && img.trim() !== "").slice(0, 8);
        }
      } catch (e) {
        console.error("Failed to parse additional_images string:", e);
      }
    }
    return [];
  };

  const productImages = product
    ? [product.image_url, ...parseAdditionalImages(product.additional_images)].filter(Boolean)
    : [];

  const features = [
    { icon: Sparkles, title: "Premium Quality Materials", desc: "Built to last with top-tier components" },
    { icon: Layers, title: "Ergonomic Design", desc: "Optimized for comfort and productivity" },
    { icon: Award, title: "Professional Grade", desc: "Used by leading offices worldwide" },
    { icon: Package, title: "Easy Assembly", desc: "Set up in minutes, not hours" },
    { icon: Shield, title: "Durable Construction", desc: "Engineered for years of use" },
    { icon: Zap, title: "Comfort Optimized", desc: "Reduces strain and fatigue" },
  ];

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchRatingStats = async (productId) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`rating, order_items!inner(product_id)`)
        .eq("order_items.product_id", productId)
        .not("rating", "is", null);

      if (!error && data && data.length > 0) {
        const total = data.reduce((acc, curr) => acc + (curr.rating || 0), 0);
        const avg = total / data.length;
        setRatingStats({ average: avg.toFixed(1), count: data.length });
      } else {
        setRatingStats({ average: 0, count: 0 });
      }
    } catch (error) {
      console.error("Error fetching rating stats:", error);
    }
  };

  const fetchProductDiscount = async (productId) => {
    if (!productId) return null;
    try {
      const cacheKey = CACHE_KEYS.PRODUCT_DISCOUNT(productId);
      const cachedDiscount = dataCache.get(cacheKey);
      if (cachedDiscount !== null) {
        setProductDiscount(cachedDiscount);
        return cachedDiscount;
      }
      const { data, error } = await supabase
        .from("discounts")
        .select("id, discount_percentage, discount_amount, start_date, end_date, code, name, discount_type, discount_value")
        .contains("product_ids", [productId])
        .eq("status", "Active")
        .gte("end_date", new Date().toISOString())
        .lte("start_date", new Date().toISOString())
        .single();

      if (!error && data) {
        setProductDiscount(data);
        dataCache.set(cacheKey, data, 2 * 60 * 1000);
        return data;
      } else {
        setProductDiscount(null);
        dataCache.set(cacheKey, null, 2 * 60 * 1000);
        return null;
      }
    } catch (error) {
      setProductDiscount(null);
      return null;
    }
  };

  const fetchProduct = async () => {
    if (!id) {
      setError("Invalid product ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const cacheKey = CACHE_KEYS.PRODUCT(id);
      const cachedProduct = dataCache.get(cacheKey);

      if (cachedProduct) {
        setProduct(cachedProduct);
        setLoading(false);
        fetchProductDiscount(cachedProduct.id);
        fetchRatingStats(cachedProduct.id);
        trackProductView(cachedProduct.id, cachedProduct.category_id);
        return;
      }

      let data, error;
      
      try {
        const result = await supabase
          .from("products")
          .select(`id, name, description, image_url, category_id, subcategory_id, stock_quantity, status, created_at, additional_images, categories(name), subcategories(name)`)
          .eq("id", id)
          .single();
          
        data = result.data;
        error = result.error;
      } catch (err) {
        console.warn("Complex query failed, trying simple query...", err);
        const result = await supabase
          .from("products")
          .select(`id, name, description, image_url, category_id, subcategory_id, stock_quantity, status, created_at, additional_images`)
          .eq("id", id)
          .single();
          
        data = result.data;
        error = result.error;
      }

      if (error || !data) {
        console.error("Product fetch error:", error);
        throw new Error("Product not found");
      } else {
        setProduct(data);
        dataCache.set(cacheKey, data);
        fetchProductDiscount(data.id);
        fetchRatingStats(data.id);
        trackProductView(data.id, data.category_id);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Product not found");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="relative">
            <div className="w-32 h-32 border-4 border-white/10 border-t-green-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 border-4 border-white/10 border-b-yellow-500 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-green-400 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="relative mb-8">
            <div className="w-40 h-40 bg-gradient-to-br from-green-500/20 to-yellow-500/20 rounded-full flex items-center justify-center">
              <Package className="w-20 h-20 text-gray-600" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold animate-bounce">?</div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Product Not Found</h2>
          <p className="text-gray-400 mb-8 max-w-md">The product you're looking for might have been moved or is no longer available.</p>
          <Link
            to="/shop"
            className="group px-10 py-5 bg-gradient-to-r from-green-500 to-yellow-500 text-black rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-green-500/25 flex items-center gap-3"
          >
            <ShoppingCart className="w-5 h-5" />
            Browse Products
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900" onMouseMove={handleMouseMove}>
      <Header />

      {/* Animated Background */}
      <div className="fixed inset-0 bg-gray-900 -z-10 overflow-hidden">
        <div 
          className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent rounded-full blur-[150px]"
          style={{ transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)` }}
        ></div>
        <div 
          className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-gradient-to-tr from-yellow-500/10 via-orange-500/5 to-transparent rounded-full blur-[150px]"
          style={{ transform: `translate(${mousePosition.x * -2}px, ${mousePosition.y * -2}px)` }}
        ></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.5)_100%)]"></div>
        
        {/* Animated grid lines */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto relative">
        {/* Floating Action Bar */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 hidden lg:flex items-center gap-4 px-6 py-4 bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3 pr-6 border-r border-white/10">
            <img src={productImages[0]} alt="" className="w-12 h-12 rounded-xl object-cover" />
            <div>
              <p className="text-white font-semibold text-sm truncate max-w-[150px]">{product.name}</p>

            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center text-white font-bold">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              addedToCart ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-green-500 to-yellow-500 text-black hover:scale-105'
            }`}
          >
            {addedToCart ? <><CheckCircle className="w-5 h-5" /> Added!</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
          </button>
        </div>

        {/* Breadcrumb with animation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-10">
          <Link to="/" className="hover:text-green-400 transition-colors flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/shop" className="hover:text-green-400 transition-colors">Shop</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column: Image Gallery */}
          <div className="space-y-6">
            {/* Main Image Container */}
            <div 
              ref={imageRef}
              className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 group cursor-zoom-in"
              onMouseEnter={() => setImageZoom(true)}
              onMouseLeave={() => setImageZoom(false)}
              onMouseMove={handleImageMouseMove}
            >
              {/* Image */}
              <img
                src={productImages[selectedImageIndex] || "/api/placeholder/800/800"}
                alt={product.name}
                className="w-full h-full object-contain p-8 transition-all duration-500"
                style={{
                  transform: imageZoom ? `scale(1.5)` : 'scale(1)',
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                }}
              />
              
              {/* Hover overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent transition-opacity duration-300 ${imageZoom ? 'opacity-0' : 'opacity-100'}`}></div>
              
              {/* Floating Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-3 z-10">
                {productDiscount && (
                  <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-red-500/25 animate-pulse">
                    {productDiscount.discount_type === "percentage" ? `-${productDiscount.discount_value}%` : `-$${productDiscount.discount_value}`}
                  </span>
                )}
              </div>

              {/* Quick View Button */}
              <button 
                onClick={() => setShowQuickView(true)}
                className="absolute top-6 right-6 p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white hover:bg-white/20 transition-all z-10 group/btn"
              >
                <Eye className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
              </button>

              {/* Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/70 transition-all z-10 opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/70 transition-all z-10 opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {productImages.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white text-sm font-medium z-10">
                  {selectedImageIndex + 1} / {productImages.length}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {productImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      selectedImageIndex === idx 
                        ? "border-green-400 scale-110 shadow-lg shadow-green-500/30" 
                        : "border-white/10 opacity-50 hover:opacity-100 hover:border-white/30"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    {selectedImageIndex === idx && (
                      <div className="absolute inset-0 bg-green-400/20"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info */}
          <div className="space-y-8">
            {/* Category & Rating */}
            <div className="flex flex-wrap items-center gap-3">
              {product.categories?.name && (
                <span className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 rounded-xl text-sm font-bold border border-green-500/20">
                  {product.categories.name}
                </span>
              )}
              {ratingStats.count > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(ratingStats.average) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} />
                    ))}
                  </div>
                  <span className="text-yellow-400 font-bold">{ratingStats.average}</span>
                  <span className="text-gray-400 text-sm">({ratingStats.count} reviews)</span>
                </div>
              )}
            </div>

            {/* Product Title */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                {product.name}
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed">
                {product.description?.slice(0, 150) || "Experience premium quality and exceptional design with this expertly crafted piece."}
                {product.description?.length > 150 && "..."}
              </p>
            </div>


            {/* Action Card */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-gray-400 text-sm font-medium mb-3">Select Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white/5 rounded-2xl p-2 border border-white/10">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all hover:scale-105"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product?.stock_quantity || 999}
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setQuantity(Math.max(1, Math.min(val, product?.stock_quantity || 999)));
                      }}
                      className="w-20 text-center text-2xl font-bold text-white bg-transparent border-none focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button 
                      onClick={() => setQuantity(Math.min(quantity + 1, product?.stock_quantity || 999))}
                      className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all hover:scale-105"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Quick quantity buttons */}
                  <div className="flex gap-2">
                    {[1, 2, 5, 10].map((num) => (
                      <button
                        key={num}
                        onClick={() => setQuantity(Math.min(num, product?.stock_quantity || 999))}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                          quantity === num ? 'bg-green-500 text-black' : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity <= 0}
                  className={`w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                    addedToCart 
                      ? 'bg-green-500 text-white scale-[1.02]' 
                      : product.stock_quantity > 0
                        ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-yellow-500 text-black hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/30'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {addedToCart ? (
                    <><CheckCircle className="w-6 h-6" /> Added to Cart!</>
                  ) : (
                    <><ShoppingCart className="w-6 h-6" /> Add to Cart</>
                  )}
                </button>
                
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setIsInWishlist(!isInWishlist)}
                    className={`py-4 rounded-2xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                      isInWishlist 
                        ? "bg-red-500/20 border-red-500 text-red-400 scale-[1.02]" 
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <Heart className={`w-5 h-5 transition-all ${isInWishlist ? "fill-current scale-110" : ""}`} />
                    {isInWishlist ? "Saved!" : "Save"}
                  </button>
                  <button 
                    onClick={handleShare}
                    className={`py-4 rounded-2xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                      copiedLink 
                        ? "bg-green-500/20 border-green-500 text-green-400" 
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    {copiedLink ? <><Copy className="w-5 h-5" /> Copied!</> : <><Share2 className="w-5 h-5" /> Share</>}
                  </button>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/10">
                {[
                  { icon: Truck, text: "Free Delivery", color: "text-green-400" },
                  { icon: Shield, text: "Secure Checkout", color: "text-blue-400" },
                  { icon: RefreshCw, text: "30 Day Returns", color: "text-purple-400" },
                  { icon: Award, text: "Premium Quality", color: "text-yellow-400" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <span className="text-gray-300 text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Info Tabs Section */}
        <div className="mt-20">
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {["description", "features", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all ${
                  activeTab === tab 
                    ? "bg-gradient-to-r from-green-500 to-yellow-500 text-black scale-105 shadow-lg shadow-green-500/25" 
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                {tab === "reviews" && ratingStats.count > 0 && (
                  <span className="mr-2 px-2 py-0.5 bg-black/20 rounded-full text-xs">{ratingStats.count}</span>
                )}
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-10 min-h-[400px]">
            {activeTab === "description" && (
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <FileText className="w-8 h-8 text-green-400" />
                  Product Description
                </h2>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {product.description || "Experience the perfect blend of style and functionality. This premium piece is designed to elevate your workspace while ensuring maximum comfort and productivity. Crafted with attention to detail, it represents the pinnacle of modern office furniture design."}
                </p>
              </div>
            )}
            
            {activeTab === "features" && (
              <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                  Key Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {features.map((feature, idx) => (
                    <div 
                      key={idx} 
                      className="group p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-green-500/30 hover:bg-white/10 transition-all cursor-default"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-yellow-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <feature.icon className="w-7 h-7 text-green-400" />
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                      <p className="text-gray-400 text-sm">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <MessageCircle className="w-8 h-8 text-purple-400" />
                    Customer Reviews
                  </h2>
                  <button 
                    onClick={() => setShowReviewModal(true)} 
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-yellow-500 text-black font-bold rounded-2xl hover:scale-105 transition-all shadow-lg shadow-green-500/25 flex items-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" /> Write a Review
                  </button>
                </div>
                <CustomerReviews productId={product.id} refreshKey={reviewsRefreshKey} />
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-24">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              You Might Also Like
            </h2>
            <Link to="/shop" className="text-green-400 hover:text-green-300 font-medium flex items-center gap-2 group">
              View All <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <RelatedProducts
            currentProductId={product?.id}
            currentCategoryId={product?.category_id}
            algorithm="category"
            title=""
            subtitle=""
            limit={4}
            showAddToCart={true}
          />
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-3xl p-8 max-w-lg w-full border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Write a Review</h3>
              <button onClick={() => setShowReviewModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            {reviewSubmitMessage.text && (
              <div className={`mb-4 p-4 rounded-xl ${reviewSubmitMessage.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {reviewSubmitMessage.text}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Your Name *</label>
                <input type="text" value={reviewForm.customerName} onChange={(e) => setReviewForm({...reviewForm, customerName: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Your Email *</label>
                <input type="email" value={reviewForm.customerEmail} onChange={(e) => setReviewForm({...reviewForm, customerEmail: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Rating *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setReviewForm({...reviewForm, rating: star})} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${reviewForm.rating >= star ? 'bg-yellow-500 text-black scale-110' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}>
                      <Star className={`w-6 h-6 ${reviewForm.rating >= star ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Review Title</label>
                <input type="text" value={reviewForm.title} onChange={(e) => setReviewForm({...reviewForm, title: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Great product!" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Your Review *</label>
                <textarea value={reviewForm.reviewText} onChange={(e) => setReviewForm({...reviewForm, reviewText: e.target.value})} rows={4} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" placeholder="Share your experience with this product..." />
              </div>
              <button 
                onClick={(e) => { 
                  e.preventDefault(); 
                  if (!reviewForm.customerName || !reviewForm.customerEmail || !reviewForm.reviewText) { 
                    setReviewSubmitMessage({ type: "error", text: "Please fill in all required fields." }); 
                    return; 
                  } 
                  setSubmittingReview(true); 
                  setReviewSubmitMessage({ type: "", text: "" }); 
                  supabase.from("product_reviews").insert({ 
                    product_id: product.id, 
                    customer_name: reviewForm.customerName, 
                    customer_email: reviewForm.customerEmail, 
                    rating: reviewForm.rating, 
                    title: reviewForm.title || null, 
                    review_text: reviewForm.reviewText, 
                    is_verified_purchase: false, 
                    is_approved: false 
                  }).then(({ error }) => { 
                    if (error) { 
                      setReviewSubmitMessage({ type: "error", text: "Failed to submit review. Please try again." }); 
                    } else { 
                      setReviewSubmitMessage({ type: "success", text: "Thank you! Your review has been submitted and is pending approval." }); 
                      setReviewForm({ customerName: "", customerEmail: "", rating: 5, title: "", reviewText: "" }); 
                      setReviewsRefreshKey(prev => prev + 1); 
                      setTimeout(() => setShowReviewModal(false), 2000); 
                    } 
                    setSubmittingReview(false); 
                  }); 
                }} 
                disabled={submittingReview} 
                className="w-full py-4 bg-gradient-to-r from-green-500 to-yellow-500 text-black font-bold rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {showQuickView && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowQuickView(false)}>
          <button className="absolute top-6 right-6 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-8 h-8 text-white" />
          </button>
          <img
            src={productImages[selectedImageIndex] || "/api/placeholder/800/800"}
            alt={product.name}
            className="max-w-full max-h-[90vh] object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </div>
  );
};

// Enhanced Customer Reviews Component
const CustomerReviews = ({ productId, refreshKey }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) fetchAllReviews();
  }, [productId, refreshKey]);

  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const allReviews = [];
      
      // Fetch approved reviews from product_reviews table
      const { data: productReviews, error: prError } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", productId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      
      if (!prError && productReviews) {
        productReviews.forEach(r => {
          allReviews.push({
            id: r.id,
            customer_name: r.customer_name,
            rating: r.rating,
            title: r.title,
            review_text: r.review_text,
            date: new Date(r.created_at).toLocaleDateString(),
            verified: r.is_verified_purchase,
            admin_reply: r.admin_reply,
            admin_reply_at: r.admin_reply_at ? new Date(r.admin_reply_at).toLocaleDateString() : null
          });
        });
      }
      
      // Fetch order-based reviews
      const { data: orderReviews, error: orError } = await supabase
        .from("orders")
        .select(`id, customer_email, customer_name, created_at, review_text, rating, order_items!inner(product_id)`)
        .eq("order_items.product_id", productId)
        .not("review_text", "is", null)
        .order("created_at", { ascending: false });
      
      if (!orError && orderReviews) {
        orderReviews.forEach(r => {
          allReviews.push({
            id: `order-${r.id}`,
            customer_name: r.customer_name,
            rating: r.rating,
            review_text: r.review_text,
            date: new Date(r.created_at).toLocaleDateString(),
            verified: true
          });
        });
      }
      
      setReviews(allReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-white/10 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-16 px-8 bg-white/5 rounded-2xl border border-white/10">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <MessageCircle className="w-10 h-10 text-purple-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Reviews Yet</h3>
        <p className="text-gray-400 max-w-md mx-auto">Be the first to share your experience with this product and help other customers make informed decisions!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-yellow-500 flex items-center justify-center text-black font-bold">
                  {review.customer_name?.charAt(0)?.toUpperCase() || "C"}
                </div>
                <div>
                  <h4 className="font-bold text-white">{review.customer_name || "Customer"}</h4>
                  {review.title && <p className="text-gray-400 text-sm">{review.title}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} />
                  ))}
                </div>
                {review.verified && (
                  <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
            </div>
            <span className="text-sm text-gray-500">{review.date}</span>
          </div>
          <p className="text-gray-300 leading-relaxed">{review.review_text}</p>
          
          {review.admin_reply && (
            <div className="mt-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-semibold text-sm">Store Response</span>
                {review.admin_reply_at && <span className="text-gray-500 text-xs">• {review.admin_reply_at}</span>}
              </div>
              <p className="text-gray-300 text-sm">{review.admin_reply}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProductPage;