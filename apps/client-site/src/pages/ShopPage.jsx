import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  ShoppingCart,
  Heart,
  Eye,
  Package,
  X,
  SlidersHorizontal,
  ArrowRight,
  Minus,
  Star,
  Check,
  TrendingUp,
  Award,
  Filter,
  Sparkles
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import Footer from "../components/footer";
import Header from "../components/header";
import ShopHero from "../components/ShopHero";
import { toast } from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { safeSupabaseQuery } from "../utils/loadingUtils";
import Sofa from "../assets/sofa.png";

// --- Components ---

const ProductCard = ({ product, index }) => {
  const { addToCart } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!product || !product.id || !product.name) return null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success("Added to cart");
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative overflow-hidden bg-gray-100 rounded-2xl transition-all duration-500 ease-out aspect-[3/4] ${isHovered ? 'shadow-2xl shadow-green-900/10 -translate-y-2' : 'shadow-sm'}`}>
        
        {/* Main Image */}
        <div className="w-full h-full overflow-hidden">
             {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                  <span className="text-gray-300 font-serif italic text-sm">Loading Art...</span>
                </div>
              )}
            <img
              src={product.image_url || Sofa}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] ${
                isHovered ? "scale-110" : "scale-100"
              } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
        </div>

        {/* Dynamic Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 ${isHovered ? "opacity-100" : ""}`}></div>

        {/* Floating Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
           {product.stock_quantity < 5 && product.stock_quantity > 0 && <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">Last Items</span>}
        </div>

        {/* Interactions - Reveal on Hover */}
        <div className={`absolute bottom-0 left-0 right-0 p-6 transform transition-all duration-500 ${isHovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
             <div className="flex items-end justify-between">
                <div className="text-white">
                   <p className="text-xs font-bold uppercase tracking-widest text-green-300 mb-1">{product.categories?.name}</p>
                   <h3 className="font-bold leading-tight text-xl">{product.name}</h3>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors shadow-xl"
                >
                   <ShoppingCart className="w-5 h-5" />
                </button>
             </div>
        </div>

        {/* Quick Favorite */}
        <button
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); setIsFavorite(!isFavorite); }}
          className={`absolute top-4 right-4 p-3 rounded-full transition-all duration-300 ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"} ${isFavorite ? "bg-red-500 text-white opacity-100 translate-x-0" : "bg-white/90 hover:bg-white text-gray-900"}`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>
      
      {/* Minimal Info Below (Visible when not hovered) */}
      <div className={`mt-3 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
          <h3 className="text-sm font-bold text-gray-900 truncate">{product.name}</h3>
          <p className="text-xs text-gray-500 uppercase tracking-wider">{product.categories?.name}</p>
      </div>
    </Link>
  );
};

// ... (FilterDrawer component remains largely the same, maybe simplified transition)
const FilterDrawer = ({ isOpen, onClose, materials, colors, filters, setFilters, loadProducts, resetFilters }) => {
  return (
    <>
        <div className={`fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
        <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 transform transition-transform duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-full'} shadow-[0_0_50px_rgba(0,0,0,0.1)]`}>
            <div className="flex flex-col h-full p-8">
                <div className="flex justify-between items-center mb-12">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter">REFINE</h2>
                    <button onClick={onClose}><X className="w-6 h-6 text-gray-400 hover:text-gray-900 transition-colors" /></button>
                </div>
                {/* Simplified contents for brevity in this response, functionally same as before */}
                <div className="space-y-8 flex-grow">
                     <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Material</h3>
                        <div className="flex flex-wrap gap-2">
                            {materials.map(mat => (
                                <button key={mat} onClick={() => setFilters(p => ({ ...p, material: p.material === mat ? "" : mat }))} 
                                className={`px-4 py-2 text-sm font-bold border rounded-full transition-all ${filters.material === mat ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-900'}`}>{mat}</button>
                            ))}
                        </div>
                     </div>
                     <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Color</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {colors.map(col => (
                                <button key={col} onClick={() => setFilters(p => ({ ...p, color: p.color === col ? "" : col }))} 
                                className={`w-full aspect-square rounded-xl border flex items-center justify-center transition-all ${filters.color === col ? 'border-2 border-black scale-110' : 'border-gray-100 hover:scale-110'}`} style={{backgroundColor: col.toLowerCase()}}>{filters.color === col && <Check className={`w-4 h-4 ${col.toLowerCase() === 'white' ? 'text-black' : 'text-white'}`} />}</button>
                            ))}
                        </div>
                     </div>
                </div>
                <div className="pt-6 border-t border-gray-100 space-y-3">
                     <button onClick={() => { loadProducts(true); onClose(); }} className="w-full py-4 bg-black text-white font-bold rounded-xl hover:scale-[1.02] transition-transform">SHOW RESULTS</button>
                     <button onClick={() => { resetFilters(); onClose(); }} className="w-full py-4 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900">CLEAR ALL</button>
                </div>
            </div>
        </div>
    </>
  );
};

const ShopPage = () => {
  // ... (State management identical to previous version) ...
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [colors, setColors] = useState([]);
  const [filters, setFilters] = useState({ material: "", color: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isLoadingLock, setIsLoadingLock] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const observer = useRef();

  useEffect(() => {
    const handleScroll = () => {
        setScrollProgress(window.scrollY / (document.body.scrollHeight - window.innerHeight));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const CATEGORY_MAPPINGS = {
    "Chairs": ["Canteen Chairs", "Conference Chairs", "Ergonomic Chairs", "School or Training Chairs", "Swivel Chairs", "Visitors or Waiting Chairs"],
    "Desks": ["Ergonomic Desks", "Executive Desks", "Office Desks", "Reception Desk"],
    "Cabinets": ["Cabinets"],
    "Sofas": ["Sofas"],
    "Workstations": ["Work Stations"],
    "Tables": ["Canteen Tables", "Centre and Side Tables", "Conference Table", "Meeting Tables"]
  };

  const loadCategories = async () => {
    try {
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data && data.length > 0) setCategories(data);
      else setCategories([{id:'1',name:'Chairs'},{id:'2',name:'Desks'}]); 
    } catch (e) {}
  };

  const loadFilterOptions = async () => {
     try {
       setMaterials(["Wood", "Leather", "Metal", "Glass", "Fabric", "Mesh"]);
       setColors(["Black", "White", "Grey", "Brown", "Blue", "Red"]);
       const { data } = await supabase.from("products").select("materials, colors").limit(50);
       if(data) {
         const m = new Set(data.flatMap(d => d.materials || []));
         const c = new Set(data.flatMap(d => d.colors || []));
         if(m.size > 0) setMaterials([...m]);
         if(c.size > 0) setColors([...c]);
       }
     } catch(e) {}
  };

  const loadProducts = async (reset = false) => {
    if (isLoadingLock && !reset) return;
    if (isLoading && !reset) return;
    setIsLoadingLock(true);
    setIsLoading(true);

    try {
      let query = supabase.from("products").select(`*, categories(id, name)`);
      query = query.eq("status", "active");

      if (selectedCategory !== "All") {
        const groupSubCategories = CATEGORY_MAPPINGS[selectedCategory];
        if (groupSubCategories) {
          const matchedCategoryIds = categories.filter(c => groupSubCategories.includes(c.name)).map(c => c.id);
          if (matchedCategoryIds.length > 0) query = query.in("category_id", matchedCategoryIds);
          else query = query.eq("id", "00000000-0000-0000-0000-000000000000"); 
        } else {
             const cat = categories.find(c => c.name === selectedCategory);
             if(cat) query = query.eq("category_id", cat.id);
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

      const validProducts = (data || []).filter(p => p && p.id && p.name);
      
      if (reset) {
        setProducts(validProducts);
        setPage(2);
      } else {
        setProducts(prev => [...prev, ...validProducts]);
        setPage(prev => prev + 1);
      }
      setHasMore(validProducts.length === 12);
    } catch (error) {
      if (reset) setProducts([]);
    } finally {
      setTimeout(() => { setIsLoading(false); setIsLoadingLock(false); }, 300);
    }
  };

  const lastProductRef = useCallback((node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) loadProducts();
      });
      if (node) observer.current.observe(node);
  }, [hasMore, selectedCategory, filters, searchTerm]);

  useEffect(() => { loadCategories(); loadFilterOptions(); loadProducts(true); }, []);
  useEffect(() => { loadProducts(true); }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-green-100 selection:text-green-900 overflow-x-hidden">
      <Header forceOpaque={true} />


      {/* Hero Section */}
      <ShopHero />

      {/* Category Nav - Floating Pill (Restored Structure) */}
      <div className="sticky top-4 z-40 w-full px-4 mb-12">
           <div className="max-w-max mx-auto bg-white/80 backdrop-blur-xl border border-gray-100 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-2 pr-6 flex items-center gap-4 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-2">
                    <button 
                        onClick={() => setSelectedCategory("All")}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${selectedCategory === "All" ? "bg-black text-white shadow-lg" : "text-gray-500 hover:bg-gray-100"}`}
                    >
                        All
                    </button>
                    {Object.keys(CATEGORY_MAPPINGS).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${selectedCategory === cat ? "bg-black text-white shadow-lg" : "text-gray-500 hover:bg-gray-100"}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="w-[1px] h-8 bg-gray-200"></div>
                <button 
                    onClick={() => setShowFilterModal(true)}
                    className="flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-green-600 transition-colors"
                >
                    <Filter className="w-4 h-4" /> Filters
                </button>
           </div>
      </div>


      {/* Dynamic Grid - Uniform & Organized */}
      <div className="px-6 max-w-[1700px] mx-auto min-h-screen pb-40">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product, index) => {
                  if (products.length === index + 1) {
                        return <div ref={lastProductRef} key={product.id}><ProductCard product={product} index={index} /></div>
                  }
                  return <ProductCard key={product.id} product={product} index={index} />;
              })}
              
              {isLoading && Array.from({length: 4}).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-2xl"></div>
              ))}
           </div>

           {products.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-40">
                  <Package className="w-20 h-20 text-gray-200 mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Matches Found</h3>
                  <button onClick={() => { setFilters({material:"", color:""}); setSelectedCategory("All"); setSearchTerm(""); }} className="text-green-600 font-bold hover:underline">Clear all filters</button>
              </div>
           )}
      </div>

      <FilterDrawer 
        isOpen={showFilterModal} 
        onClose={() => setShowFilterModal(false)}
        materials={materials}
        colors={colors}
        filters={filters}
        setFilters={setFilters}
        loadProducts={loadProducts}
        resetFilters={() => setFilters({ material: "", color: "" })}
      />

      <Footer />
      <style>{`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ShopPage;