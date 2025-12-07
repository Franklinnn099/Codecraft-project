import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  Star,
  Search,
  Filter,
  ShoppingCart,
  Sparkles,
  Grid,
  List,
  ArrowRight,
  Heart,
  Eye,
  Package,
  Zap,
  Award,
  TrendingUp,
  RefreshCw,
  Folder,
  Tag,
  Users,
  MessageSquare,
  Settings,
  DollarSign,
  ShieldCheck,
  Mail,
  Smartphone,
  Globe,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Home,
  Info,
  Phone,
  X
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import Footer from "../components/footer";
import Header from "../components/header";
import { toast } from "react-hot-toast";
import { useCart } from "../context/CartContext";
import {
  safeSupabaseQuery,
  globalCache,
  globalLoadingManager,
} from "../utils/loadingUtils";
import Sofa from "../assets/sofa.png";
import Cabinet from "../assets/Cabinet.jpg";

const ProductCard = ({ product, index }) => {
  const { addToCart } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Validate product data to prevent empty cards
  if (!product || !product.id || !product.name) {
    return null;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 100);

    return () => clearTimeout(timer);
  }, [index]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success("Added to cart");
  };

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className={`group block h-full transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-100 translate-y-0"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white/5 backdrop-blur-sm rounded-[2rem] overflow-hidden border border-white/10 h-full flex flex-col relative group-hover:-translate-y-2 transition-transform duration-500 hover:shadow-2xl hover:shadow-green-500/20">
        
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-black/20">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/5 animate-pulse">
              <Package className="w-8 h-8 text-white/20" />
            </div>
          )}
          <img
            src={product.image_url || Sofa}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
          
          {/* Overlay Actions */}
          <div className="absolute top-4 right-4 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
            <button
              onClick={toggleFavorite}
              className={`p-3 rounded-full backdrop-blur-md transition-all duration-300 ${
                isFavorite 
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/30" 
                  : "bg-black/50 text-white hover:bg-white hover:text-red-500 border border-white/10"
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
            </button>
            <div className="p-3 bg-black/50 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white hover:text-green-600 transition-all duration-300">
              <Eye className="w-4 h-4" />
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.is_featured && (
              <span className="px-3 py-1 bg-yellow-500/90 backdrop-blur-sm text-black text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Featured
              </span>
            )}
            {product.stock_quantity < 5 && product.stock_quantity > 0 && (
               <span className="px-3 py-1 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg">
                 Low Stock
               </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">
          <div className="mb-2">
            <span className="text-xs font-bold tracking-wider text-green-400 uppercase bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
              {product.categories?.name || "Office"}
            </span>
          </div>
          
          <h3 className="font-bold text-white text-xl mb-2 line-clamp-1 group-hover:text-green-400 transition-colors">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-grow font-light leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-end gap-4">
            <button
              onClick={handleAddToCart}
              className="w-full px-4 py-3 bg-white/10 hover:bg-green-500 text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn border border-white/10 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20"
            >
              <ShoppingCart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              <span className="font-medium text-sm">Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

const CustomDropdown = ({ label, options, value, onChange, colorClass }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="flex items-center gap-2 text-sm font-bold text-gray-300 mb-3">
        <div className={`w-1 h-4 ${colorClass} rounded-full shadow-[0_0_10px_currentColor]`}></div>
        {label}
      </label>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 bg-black/40 border backdrop-blur-sm rounded-xl text-white flex items-center justify-between transition-all duration-300 group relative overflow-hidden ${
          isOpen 
            ? 'border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.1)]' 
            : 'border-white/10 hover:border-white/20'
        }`}
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${colorClass.replace('bg-', 'from-')}/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
        
        <span className={`relative z-10 ${!value ? 'text-gray-400' : 'text-white font-medium'}`}>
          {value || `All ${label}s`}
        </span>
        
        <div className={`relative z-10 p-1 rounded-full transition-all duration-300 ${isOpen ? 'bg-white/10 rotate-180' : 'group-hover:bg-white/5'}`}>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-colors duration-300 ${isOpen ? 'text-green-400' : 'group-hover:text-green-400'}`} />
        </div>
      </button>

      <div className={`absolute z-50 w-full mt-2 bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 origin-top transform ${
        isOpen 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
      }`}>
        <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
          <button
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center justify-between mb-1 ${
              value === "" 
                ? 'bg-white/10 text-green-400 font-medium' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span>All {label}s</span>
            {value === "" && <CheckCircle className="w-4 h-4" />}
          </button>
          
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center justify-between mb-1 ${
                value === opt 
                  ? 'bg-white/10 text-green-400 font-medium' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{opt}</span>
              {value === opt && <CheckCircle className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ShopPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [expandedCats, setExpandedCats] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [colors, setColors] = useState([]);
  const [filters, setFilters] = useState({
    material: "",
    color: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [error, setError] = useState(null);
  const [isLoadingLock, setIsLoadingLock] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const observer = useRef();

  // Parallax effect
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const moveX = (clientX - window.innerWidth / 2) * 0.02;
    const moveY = (clientY - window.innerHeight / 2) * 0.02;
    setMousePosition({ x: moveX, y: moveY });
  };

  // Define category groupings
  const CATEGORY_MAPPINGS = {
    "Chairs": [
      "Canteen Chairs",
      "Conference Chairs",
      "Ergonomic Chairs",
      "School or Training Chairs",
      "Swivel Chairs",
      "Visitors or Waiting Chairs"
    ],
    "Desks": [
      "Ergonomic Desks",
      "Executive Desks",
      "Office Desks",
      "Reception Desk"
    ],
    "Cabinets": [
      "Cabinets"
    ],
    "Sofas": [
      "Sofas"
    ],
    "Workstations": [
      "Work Stations"
    ],
    "Tables": [
      "Canteen Tables",
      "Centre and Side Tables",
      "Conference Table",
      "Meeting Tables"
    ]
  };

  const [categoryGroups, setCategoryGroups] = useState(CATEGORY_MAPPINGS);

  const loadCategories = async () => {
    try {
      // Fetch real categories from DB to ensure we have correct IDs
      const { data: dbCategories, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

      // Use DB categories if available, otherwise fallback to folder structure for display only
      if (dbCategories && dbCategories.length > 0) {
        setCategories(dbCategories);
      } else {
        // Fallback categories if DB is empty (for UI testing)
        const folderCategories = [
          { id: 'cabinets', name: "Cabinets" },
          { id: 'canteen-chairs', name: "Canteen Chairs" },
          { id: 'canteen-tables', name: "Canteen Tables" },
          { id: 'centre-side-tables', name: "Centre and Side Tables" },
          { id: 'conference-chairs', name: "Conference Chairs" },
          { id: 'conference-table', name: "Conference Table" },
          { id: 'ergonomic-chairs', name: "Ergonomic Chairs" },
          { id: 'ergonomic-desks', name: "Ergonomic Desks" },
          { id: 'executive-desks', name: "Executive Desks" },
          { id: 'meeting-tables', name: "Meeting Tables" },
          { id: 'office-desks', name: "Office Desks" },
          { id: 'reception-desk', name: "Reception Desk" },
          { id: 'school-training-chairs', name: "School or Training Chairs" },
          { id: 'sofas', name: "Sofas" },
          { id: 'swivel-chairs', name: "Swivel Chairs" },
          { id: 'visitors-waiting-chairs', name: "Visitors or Waiting Chairs" },
          { id: 'work-stations', name: "Work Stations" },
        ];
        setCategories(folderCategories);
      }
      
      setCategoryGroups(CATEGORY_MAPPINGS);
      
      // Fetch subcategories
      const { data: subData } = await safeSupabaseQuery(
        () => supabase.from("subcategories").select("*"),
        [],
        { name: "Subcategories", timeout: 8000 }
      );

      const groupedSub = (subData || []).reduce((acc, curr) => {
        acc[curr.category_id] = acc[curr.category_id] || [];
        acc[curr.category_id].push(curr);
        return acc;
      }, {});

      setSubcategories(groupedSub);
    } catch (error) {
      console.error("❌ Failed to load categories:", error);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const [matResult, colResult] = await Promise.all([
        safeSupabaseQuery(
          () => supabase.from("products").select("materials"),
          [],
          { name: "Materials", timeout: 6000 }
        ),
        safeSupabaseQuery(
          () => supabase.from("products").select("colors"),
          [],
          { name: "Colors", timeout: 6000 }
        ),
      ]);

      const matData = matResult.data || [];
      const colData = colResult.data || [];

      const allMaterials = matData.flatMap((item) => {
        const materials = [];
        if (item.materials) {
          if (Array.isArray(item.materials)) {
            materials.push(...item.materials);
          } else if (typeof item.materials === "string") {
            materials.push(...item.materials.split(",").map((m) => m.trim()));
          }
        }
        return materials;
      });

      const allColors = colData.flatMap((item) => {
        const colors = [];
        if (item.colors) {
          if (Array.isArray(item.colors)) {
            colors.push(...item.colors);
          } else if (typeof item.colors === "string") {
            colors.push(...item.colors.split(",").map((c) => c.trim()));
          }
        }
        return colors;
      });

      const uniqueMaterials = [...new Set(allMaterials.filter(Boolean))];
      const uniqueColors = [...new Set(allColors.filter(Boolean))];

      const fallbackMaterials = ["Wood", "Metal", "Fabric", "Leather", "Plastic", "Glass"];
      const fallbackColors = ["Black", "White", "Brown", "Gray", "Blue", "Green", "Red", "Yellow"];

      setMaterials(uniqueMaterials.length > 0 ? uniqueMaterials : fallbackMaterials);
      setColors(uniqueColors.length > 0 ? uniqueColors : fallbackColors);
    } catch (error) {
      console.error("❌ Failed to load filter options:", error);
      setMaterials(["Wood", "Metal", "Fabric", "Leather", "Plastic", "Glass"]);
      setColors(["Black", "White", "Brown", "Gray", "Blue", "Green", "Red", "Yellow"]);
    }
  };

  const testConnection = async () => {
    try {
      const { data, error } = await supabase.from("products").select("id").limit(1);
      if (error) return false;
      return true;
    } catch (error) {
      return false;
    }
  };

  const loadProducts = async (reset = false) => {
    if (isLoadingLock && !reset) return;
    if (isLoading && !reset) return;

    setIsLoadingLock(true);
    setIsLoading(true);

    try {
      let query;
      if (selectedCategory === "All" && !filters.material && !filters.color && !searchTerm.trim()) {
        query = supabase.from("products").select(`
          id, name, image_url, category_id, subcategory_id, 
          stock_quantity, created_at, status, description
        `);
      } else {
        query = supabase.from("products").select(`
          *,
          categories(id, name),
          subcategories(id, name)
        `);
      }

      query = query.eq("status", "active");

      if (selectedCategory !== "All") {
        // Check if selectedCategory is a Main Category Group
        const groupSubCategories = CATEGORY_MAPPINGS[selectedCategory];

        if (groupSubCategories) {
          // It is a main category (e.g. "Chairs")
          // Find all category IDs that match the names in this group
          const matchedCategoryIds = categories
            .filter(c => groupSubCategories.includes(c.name))
            .map(c => c.id);
            
          if (matchedCategoryIds.length > 0) {
            query = query.in("category_id", matchedCategoryIds);
          } else {
            // If no matching categories found in DB, force empty result
            query = query.eq("id", "00000000-0000-0000-0000-000000000000"); 
          }
        } else {
          // It is a specific category (e.g. "Canteen Chairs")
          const matchedCategory = categories.find((c) => c.name === selectedCategory);
          const matchedSub = Object.values(subcategories).flat().find((s) => s.name === selectedCategory);

          if (matchedCategory) {
            query = query.eq("category_id", matchedCategory.id);
          } else if (matchedSub) {
            query = query.eq("subcategory_id", matchedSub.id);
          } else {
            query = query.eq("category_id", "non-existent-id");
          }
        }
      }

      if (filters.material) query = query.contains("materials", [filters.material]);
      if (filters.color) query = query.contains("colors", [filters.color]);
      if (searchTerm.trim()) query = query.ilike("name", `%${searchTerm.trim()}%`);

      const currentPage = reset ? 1 : page;
      query = query.range((currentPage - 1) * 12, currentPage * 12 - 1);
      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      const validProducts = (data || []).filter((product) => product && product.id && product.name);

      let finalProducts = validProducts;
      if (selectedCategory !== "All") {
        const matchedCategory = categories.find((c) => c.name === selectedCategory);
        const matchedSub = Object.values(subcategories).flat().find((s) => s.name === selectedCategory);

        if (matchedCategory) {
          finalProducts = validProducts.filter((product) => product.category_id === matchedCategory.id);
        } else if (matchedSub) {
          finalProducts = validProducts.filter((product) => product.subcategory_id === matchedSub.id);
        } else {
          finalProducts = [];
        }
      }

      if (reset) {
        setProducts(finalProducts);
        setPage(2);
      } else {
        setProducts((prev) => [...prev, ...finalProducts]);
        setPage((prev) => prev + 1);
      }
      setHasMore((data || []).length === 12);
    } catch (error) {
      console.error("❌ Error in loadProducts:", error);
      if (reset && selectedCategory === "All") {
        try {
          const { data: fallbackData } = await supabase
            .from("products")
            .select("id, name, image_url, description, stock_quantity, created_at")
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(12);

          if (fallbackData) {
            setProducts(fallbackData);
            setPage(2);
            setHasMore(fallbackData.length === 12);
            return;
          }
        } catch (fallbackErr) {
          console.error("❌ Fallback query also failed:", fallbackErr);
        }
      }
      if (reset) setProducts([]);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setIsLoadingLock(false);
      }, 200);
    }
  };

  const lastProductRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadProducts();
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore, selectedCategory, filters, searchTerm]
  );

  useEffect(() => {
    const initializeShop = async () => {
      setIsLoading(true);
      setInitialLoadComplete(false);

      try {
        const connectionOk = await testConnection();
        if (!connectionOk) {
          console.warn("Connection test failed, but attempting to load products anyway...");
        }

        const initPromise = Promise.all([loadCategories(), loadFilterOptions()]);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Initialization timeout")), 10000)
        );

        try {
          await Promise.race([initPromise, timeoutPromise]);
        } catch (error) {
          console.warn("⚠️ Categories/filters loading failed:", error);
        }

        const loadProductsWithRetry = async (retries = 2) => {
          for (let i = 0; i <= retries; i++) {
            try {
              const productsPromise = loadProducts(true);
              const productsTimeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Products loading timeout")), 10000)
              );
              await Promise.race([productsPromise, productsTimeoutPromise]);
              setError(null);
              return;
            } catch (error) {
              if (i === retries) throw error;
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }
        };

        try {
          await loadProductsWithRetry();
        } catch (error) {
          setError("Failed to load products. Please check your connection and try again.");
          setProducts([]);
        }
      } catch (error) {
        setError("Failed to initialize shop. Please refresh the page.");
        setProducts([]);
      } finally {
        setInitialLoadComplete(true);
        setIsLoading(false);
      }
    };

    initializeShop();

    let productSubscription;
    try {
      productSubscription = supabase
        .channel("products-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
          setTimeout(() => {
            if (!isLoading) loadProducts(true);
          }, 1000);
        })
        .subscribe();
    } catch (e) {}

    const categorySubscription = supabase
      .channel("categories-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, loadCategories)
      .subscribe();

    const subcategorySubscription = supabase
      .channel("subcategories-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "subcategories" }, loadCategories)
      .subscribe();

    return () => {
      try {
        if (productSubscription) productSubscription.unsubscribe();
        categorySubscription.unsubscribe();
        subcategorySubscription.unsubscribe();
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;
    setPage(1);
    setHasMore(true);
    setIsLoadingLock(false);
    const timeoutId = setTimeout(() => {
      loadProducts(true);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [selectedCategory, filters.material, filters.color, searchTerm]);

  const toggleCategoryExpand = (catId) => {
    setExpandedCats((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleGetConsultation = () => {
    navigate("/inquiry");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden" onMouseMove={handleMouseMove}>
      <Header />

      {/* Immersive Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-0 right-0 w-[800px] h-[800px] bg-green-500/10 rounded-full blur-[120px]"
          style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
        ></div>
        <div 
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[100px]"
          style={{ transform: `translate(${mousePosition.x * -1}px, ${mousePosition.y * -1}px)` }}
        ></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-medium mb-6 animate-fadeInDown backdrop-blur-sm">
            <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
            <span className="text-gray-300">Premium Office Collection</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fadeInUp tracking-tight">
            Curated for <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-400">
              Modern Workspaces
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto animate-fadeInUp animation-delay-200 font-light">
            Discover furniture that blends ergonomics with elegance. Designed for those who refuse to compromise on style or comfort.
          </p>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row px-4 md:px-8 pb-20 gap-8 max-w-[1800px] mx-auto relative z-10">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center justify-center w-full bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-white"
          >
            <Filter className="w-5 h-5 mr-2 text-green-400" />
            <span className="font-medium">Filters & Categories</span>
            <ChevronDown className={`w-5 h-5 ml-2 transition-transform ${showMobileFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Sidebar */}
        <aside
          className={`w-full lg:w-[300px] flex-shrink-0 transition-all duration-500 ${
            showMobileFilters ? "block" : "hidden"
          } lg:block sticky top-24 h-fit`}
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-b from-green-500 to-yellow-500 rounded-[2rem] opacity-20 group-hover:opacity-40 transition duration-1000 blur"></div>
            <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-[2rem] border border-white/10 p-6 space-y-8">
            {/* Search */}
            <div className="relative group/search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/search:text-green-400 transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-green-500/50 focus:bg-black/60 transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Categories */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Grid className="w-5 h-5 text-green-400" />
                  </div>
                  Categories
                </h3>
                <button
                  onClick={() => {
                    loadCategories();
                    loadProducts(true);
                    loadFilterOptions();
                  }}
                  className="p-2 text-gray-500 hover:text-green-400 hover:bg-green-500/10 rounded-full transition-all duration-300 rotate-0 hover:rotate-180"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setShowMobileFilters(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 border ${
                    selectedCategory === "All"
                      ? "bg-gradient-to-r from-green-500/20 to-green-500/10 border-green-500/50 text-green-400 shadow-[0_0_20px_rgba(74,222,128,0.1)]"
                      : "border-transparent text-gray-400 hover:bg-white/5 hover:text-white hover:border-white/10"
                  }`}
                >
                  <span className="flex items-center gap-3 font-medium">
                    <Package className={`w-4 h-4 ${selectedCategory === "All" ? "text-green-400" : "text-gray-500"}`} />
                    All Products
                  </span>
                  {selectedCategory === "All" && <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>}
                </button>

                {Object.keys(categoryGroups).map((mainCat) => (
                  <div key={mainCat}>
                    <button
                      onClick={() => {
                        setSelectedCategory(mainCat);
                        toggleCategoryExpand(mainCat);
                        setShowMobileFilters(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 border ${
                        selectedCategory === mainCat
                          ? "bg-gradient-to-r from-green-500/20 to-green-500/10 border-green-500/50 text-green-400 shadow-[0_0_20px_rgba(74,222,128,0.1)]"
                          : "border-transparent text-gray-400 hover:bg-white/5 hover:text-white hover:border-white/10"
                      }`}
                    >
                      <span className="flex items-center gap-3 font-medium">
                        <Folder className={`w-4 h-4 ${selectedCategory === mainCat ? "text-green-400" : "text-gray-500"}`} />
                        {mainCat}
                      </span>
                      {categoryGroups[mainCat]?.length > 0 && (
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedCats[mainCat] ? "rotate-180 text-green-400" : ""}`} />
                      )}
                    </button>

                    <div className={`grid transition-all duration-300 ease-in-out ${
                      expandedCats[mainCat] && categoryGroups[mainCat]?.length > 0
                        ? "grid-rows-[1fr] opacity-100 mt-2 mb-2"
                        : "grid-rows-[0fr] opacity-0"
                    }`}>
                      <div className="overflow-hidden">
                        <div className="ml-4 pl-4 border-l border-white/10 space-y-1">
                          {categoryGroups[mainCat]?.map((subName) => (
                            <button
                              key={subName}
                              onClick={() => {
                                setSelectedCategory(subName);
                                setShowMobileFilters(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group/sub ${
                                selectedCategory === subName
                                  ? "text-green-400 bg-green-500/10 font-medium"
                                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                              }`}
                            >
                              <span>{subName}</span>
                              <ArrowRight className={`w-3 h-3 transition-all duration-300 ${
                                selectedCategory === subName 
                                  ? "opacity-100 translate-x-0" 
                                  : "opacity-0 -translate-x-2 group-hover/sub:opacity-50 group-hover/sub:translate-x-0"
                              }`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-6 pt-6 border-t border-white/10">
              <div>
                <CustomDropdown
                  label="Material"
                  options={materials}
                  value={filters.material}
                  onChange={(value) => setFilters({ ...filters, material: value })}
                  colorClass="bg-green-500"
                />
              </div>

              <div>
                <CustomDropdown
                  label="Color"
                  options={colors}
                  value={filters.color}
                  onChange={(value) => setFilters({ ...filters, color: value })}
                  colorClass="bg-yellow-500"
                />
              </div>
            </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {isLoading && products.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="bg-white/5 rounded-[2rem] p-4 h-[400px] animate-pulse border border-white/5"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((item, index) => (
                <div ref={index === products.length - 1 ? lastProductRef : null} key={item.id}>
                  <ProductCard product={item} index={index} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Products Found</h3>
              <p className="text-gray-400 mb-8 max-w-md">
                We couldn't find any matches for your search. Try adjusting your filters or search terms.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                  setFilters({ material: "", color: "" });
                }}
                className="px-6 py-3 bg-green-500 text-black font-bold rounded-xl hover:bg-green-400 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}

          {isLoading && products.length > 0 && (
            <div className="flex justify-center mt-12">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {!hasMore && products.length > 0 && (
            <div className="text-center mt-16 pb-8">
              <p className="text-gray-500 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                You've reached the end of the collection
              </p>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default ShopPage;