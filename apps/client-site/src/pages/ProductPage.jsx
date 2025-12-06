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
  Info
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [productDiscount, setProductDiscount] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [ratingStats, setRatingStats] = useState({ average: 0, count: 0 });

  // Parallax effect
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const moveX = (clientX - window.innerWidth / 2) * 0.02;
    const moveY = (clientY - window.innerHeight / 2) * 0.02;
    setMousePosition({ x: moveX, y: moveY });
  };

  // Helper function to safely parse additional_images
  const parseAdditionalImages = (additional_images) => {
    if (!additional_images) return [];
    if (Array.isArray(additional_images)) {
      return additional_images
        .filter((img) => typeof img === "string" && img.trim() !== "")
        .slice(0, 8);
    }
    if (typeof additional_images === "string") {
      try {
        const parsed = JSON.parse(additional_images);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((img) => typeof img === "string" && img.trim() !== "")
            .slice(0, 8);
        }
      } catch (e) {
        console.error("Failed to parse additional_images string:", e);
      }
    }
    return [];
  };

  const productImages = product
    ? [
        product.image_url,
        ...parseAdditionalImages(product.additional_images),
      ].filter(Boolean)
    : [];

  const features = product
    ? [
        "Premium Quality Materials",
        "Ergonomic Design",
        "Professional Grade",
        "Easy Assembly",
        "Durable Construction",
        "Comfort Optimized",
      ]
    : [];

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

      // Try fetching with relationships first
      let data, error;
      
      try {
        const result = await supabase
          .from("products")
          .select(`
            id, name, description, image_url, category_id, subcategory_id, 
            stock_quantity, status, created_at, additional_images,
            categories(name), subcategories(name)
          `)
          .eq("id", id)
          .single();
          
        data = result.data;
        error = result.error;
      } catch (err) {
        console.warn("Complex query failed, trying simple query...", err);
        // Fallback to simple query if relationships fail
        const result = await supabase
          .from("products")
          .select(`
            id, name, description, image_url, category_id, subcategory_id, 
            stock_quantity, status, created_at, additional_images
          `)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-white/20 border-t-green-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="text-6xl mb-6 animate-bounce">🔍</div>
          <h2 className="text-3xl font-bold text-white mb-4">Product Not Found</h2>
          <p className="text-gray-400 mb-8 max-w-md">The masterpiece you're looking for might have been moved or is no longer available.</p>
          <Link
            to="/shop"
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-yellow-500 text-white rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg"
          >
            Return to Gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900" onMouseMove={handleMouseMove}>
      <Header />

      {/* Immersive Hero Background */}
      <div className="fixed inset-0 bg-gray-900 -z-10 overflow-hidden">
        <div 
          className="absolute top-0 right-0 w-[800px] h-[800px] bg-green-500/10 rounded-full blur-[120px]"
          style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
        ></div>
        <div 
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[100px]"
          style={{ transform: `translate(${mousePosition.x * -1}px, ${mousePosition.y * -1}px)` }}
        ></div>
      </div>

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-8 animate-fadeIn">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-white transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-green-400 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Visual Showcase (Sticky) */}
          <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-32 h-fit animate-fadeInUp">
            <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 group shadow-2xl">
              <img
                src={productImages[selectedImageIndex] || "/api/placeholder/800/800"}
                alt={product.name}
                className="w-full h-full object-contain p-8 transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Floating Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                {productDiscount && (
                  <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                    {productDiscount.discount_type === "percentage" 
                      ? `-${productDiscount.discount_value}% OFF` 
                      : `-$${productDiscount.discount_value}`}
                  </span>
                )}
                {product.stock_quantity < 5 && product.stock_quantity > 0 && (
                  <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    Low Stock
                  </span>
                )}
              </div>

              {/* Image Navigation Overlay */}
              {productImages.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 p-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
                  {productImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        selectedImageIndex === idx ? "bg-green-400 w-8" : "bg-white/50 hover:bg-white"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnails Grid */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      selectedImageIndex === idx 
                        ? "border-green-400 scale-105 shadow-lg shadow-green-500/20" 
                        : "border-transparent opacity-60 hover:opacity-100 hover:border-white/30"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Details */}
          <div className="lg:col-span-5 space-y-8 animate-fadeInUp animation-delay-200">
            {/* Header Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {product.categories?.name && (
                  <span className="px-4 py-1.5 bg-white/10 text-green-400 rounded-full text-xs font-bold tracking-wider uppercase border border-white/10">
                    {product.categories.name}
                  </span>
                )}
                {ratingStats.count > 0 && (
                  <div className="flex items-center text-yellow-400 text-sm font-medium">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    <span>{ratingStats.average} ({ratingStats.count} Reviews)</span>
                  </div>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4">
                <span className="px-4 py-2 bg-green-500/10 text-green-400 rounded-full text-sm font-bold border border-green-500/20">
                  Premium Selection
                </span>
                {product.stock_quantity > 0 && (
                  <span className="px-4 py-2 bg-white/5 text-gray-300 rounded-full text-sm font-medium border border-white/10">
                    In Stock
                  </span>
                )}
              </div>
            </div>

            {/* Action Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 shadow-2xl">
              <div className="space-y-6">
                {/* Quantity & Stock */}
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xl font-bold text-white w-8 text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    In Stock & Ready
                  </div>
                </div>

                {/* Main Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      addToCart({ ...product, quantity });
                      // Visual feedback logic here
                    }}
                    className="col-span-full py-5 bg-gradient-to-r from-green-500 to-yellow-500 text-black font-bold rounded-2xl hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                  <button 
                    onClick={() => setIsInWishlist(!isInWishlist)}
                    className={`py-4 rounded-2xl font-bold border transition-all duration-300 flex items-center justify-center gap-2 ${
                      isInWishlist 
                        ? "bg-red-500/20 border-red-500 text-red-500" 
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist ? "fill-current" : ""}`} />
                    {isInWishlist ? "Saved" : "Save"}
                  </button>
                  <button className="py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </div>

                {/* Trust Indicators */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                  {[
                    { icon: Truck, text: "Free Delivery" },
                    { icon: Shield, text: "2 Year Warranty" },
                    { icon: RefreshCw, text: "30 Day Returns" },
                    { icon: Award, text: "Premium Quality" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-gray-400 text-sm">
                      <item.icon className="w-5 h-5 text-green-400" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Info Tabs */}
            <div className="bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 overflow-hidden">
              <div className="flex border-b border-white/10">
                {["description", "features", "reviews"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                      activeTab === tab 
                        ? "bg-white/10 text-white border-b-2 border-green-400" 
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              
              <div className="p-8 min-h-[300px]">
                {activeTab === "description" && (
                  <div className="animate-fadeIn">
                    <p className="text-gray-300 leading-relaxed text-lg font-light">
                      {product.description || "Experience the perfect blend of style and functionality. This premium piece is designed to elevate your workspace while ensuring maximum comfort and productivity."}
                    </p>
                  </div>
                )}
                
                {activeTab === "features" && (
                  <div className="grid grid-cols-1 gap-4 animate-fadeIn">
                    {features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                          <Check className="w-5 h-5" />
                        </div>
                        <span className="text-gray-200 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="animate-fadeIn">
                    <CustomerReviews productId={product.id} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-32">
          <h2 className="text-3xl font-bold text-white mb-12 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            You Might Also Like
          </h2>
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

      <Footer />
    </div>
  );
};

// Enhanced Customer Reviews Component
const CustomerReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) fetchRealReviews();
  }, [productId]);

  const fetchRealReviews = async () => {
    try {
      setLoading(true);
      const { data: reviewData, error } = await supabase
        .from("orders")
        .select(`
          id, customer_email, customer_name, created_at, review_text, rating, recommendation,
          order_items!inner (product_id)
        `)
        .eq("order_items.product_id", productId)
        .not("review_text", "is", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReviews((reviewData || []).map(r => ({
        ...r,
        date: new Date(r.created_at).toLocaleDateString(),
        verified: true
      })));
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center text-gray-400 py-8">Loading reviews...</div>;

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No reviews yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-bold text-white">{review.customer_name || "Verified Customer"}</h4>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-gray-600"}`} />
                  ))}
                </div>
                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Verified Purchase</span>
              </div>
            </div>
            <span className="text-sm text-gray-500">{review.date}</span>
          </div>
          <p className="text-gray-300 leading-relaxed">{review.review_text}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductPage;