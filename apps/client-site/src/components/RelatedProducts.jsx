import React, { useState, useEffect, memo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Grid,
  ArrowRight,
  ShoppingCart,
  Eye,
  TrendingUp,
  Users,
  Sparkles,
  Heart,
} from "lucide-react";
import { supabase } from "../supabase/supabaseClient";
import { useCart } from "../context/CartContext";
import {
  getPersonalizedRecommendations,
  getRecentlyViewed,
  getAdaptiveRecommendations,
  trackInterest,
} from "../utils/userBehaviorTracker";

const RelatedProducts = memo(
  ({
    currentProductId = null,
    currentCategoryId = null,
    cartItems = [],
    title = "Related Products",
    subtitle = null,
    algorithm = "category", // "category", "popular", "trending", "similar", "personalized", "recent", "adaptive"
    limit = 4,
    showAddToCart = true,
  }) => {
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);
    const { addToCart } = useCart();

    // Separate the fetch logic from useCallback to avoid circular dependency
    const performFetch = async () => {
      console.log("🔍 RelatedProducts: Starting fetch with:", {
        currentProductId,
        currentCategoryId,
        cartItems: cartItems?.length || 0,
        algorithm,
        limit,
      });

      // Prevent fetching if already loading
      if (loading) {
        console.log("⏳ Already loading, skipping fetch");
        return;
      }

      try {
        setLoading(true);
        // Don't clear products immediately to prevent flickering
        let query = supabase.from("products").select("id, name, description, image_url, category_id, subcategory_id, stock_quantity, created_at, status, additional_images");

        console.log(`🎯 Using algorithm: ${algorithm}`);

        switch (algorithm) {
          case "category":
            if (currentCategoryId) {
              console.log(`🏷️ Filtering by category_id: ${currentCategoryId}`);
              query = query.eq("category_id", currentCategoryId);
              if (currentProductId) {
                console.log(
                  `❌ Excluding current product: ${currentProductId}`
                );
                query = query.neq("id", currentProductId);
              }
            } else {
              console.warn(
                "⚠️ No currentCategoryId provided for category algorithm"
              );
            }
            break;

          case "popular":
            console.log(
              "🔥 Using popular algorithm (ordered by created_at desc)"
            );
            // Simulate popular products - in real app, this would be based on sales/views
            query = query.order("created_at", { ascending: false });
            break;

          case "trending":
            console.log(
              "📈 Using trending algorithm (ordered by stock_quantity desc)"
            );
            // Simulate trending products - could be based on recent activity
            query = query.order("stock_quantity", { ascending: false });
            break;

          case "similar":
            console.log("🔄 Using similar algorithm");
            // For cart page - find products similar to what's in cart
            if (cartItems && cartItems.length > 0) {
              const categoryIds = cartItems
                .map((item) => item.category_id)
                .filter(Boolean);
              console.log(`🛒 Cart category IDs:`, categoryIds);
              if (categoryIds.length > 0) {
                query = query.in("category_id", categoryIds);
                const cartProductIds = cartItems
                  .map((item) => item.id)
                  .filter(Boolean);
                console.log(`🚫 Excluding cart product IDs:`, cartProductIds);
                if (cartProductIds.length > 0) {
                  query = query.not(
                    "id",
                    "in",
                    `(${cartProductIds.join(",")})`
                  );
                }
              }
            } else {
              console.log("📦 No cart items, fallback to popular");
              // No cart items, fallback to popular
              query = query.order("created_at", { ascending: false });
            }
            break;

          case "personalized":
            console.log("👤 Using personalized algorithm");
            // Get personalized recommendations based on user behavior
            try {
              const personalizedProducts = await getPersonalizedRecommendations(
                limit
              );
              console.log(
                `✅ Personalized returned:`,
                personalizedProducts?.length || 0,
                "products"
              );
              setRelatedProducts(personalizedProducts || []);
              setLoading(false);
              return;
            } catch (error) {
              console.error("❌ Error fetching personalized products:", error);
              // Fallback to popular products
              query = query.order("created_at", { ascending: false });
            }
            break;

          case "recent":
            console.log("⏰ Using recent algorithm");
            // Get recently viewed products
            try {
              const recentlyViewed = getRecentlyViewed(limit);
              console.log(
                `📋 Recently viewed:`,
                recentlyViewed?.length || 0,
                "items"
              );
              if (recentlyViewed.length > 0) {
                const recentIds = recentlyViewed.map((item) => item.productId);
                console.log(`🔍 Fetching recent product IDs:`, recentIds);
                const { data: recentProducts, error: recentError } =
                  await supabase
                    .from("products")
                    .select("id, name, description, image_url, category_id, subcategory_id, stock_quantity, created_at, status, additional_images")
                    .in("id", recentIds);

                if (
                  !recentError &&
                  recentProducts &&
                  recentProducts.length > 0
                ) {
                  console.log(
                    `✅ Recent products found:`,
                    recentProducts.length
                  );
                  // Sort by view order
                  const sortedProducts = recentIds
                    .map((id) => recentProducts.find((p) => p.id === id))
                    .filter(Boolean);
                  setRelatedProducts(sortedProducts);
                  setLoading(false);
                  return;
                } else {
                  console.warn(
                    "⚠️ No recent products found or error:",
                    recentError
                  );
                }
              }
              console.log("📦 No recent products, fallback to popular");
              // If no recent products, fallback to popular
              query = query.order("created_at", { ascending: false });
            } catch (error) {
              console.error("❌ Error fetching recent products:", error);
              // Fallback to popular products
              query = query.order("created_at", { ascending: false });
            }
            break;

          case "adaptive":
            console.log("🧠 Using adaptive algorithm");
            // Smart adaptive recommendations that adjust based on user behavior
            try {
              const adaptiveProducts = await getAdaptiveRecommendations(
                currentProductId,
                limit
              );
              console.log(
                `✅ Adaptive returned:`,
                adaptiveProducts?.length || 0,
                "products"
              );
              setRelatedProducts(adaptiveProducts || []);
              setLoading(false);
              return;
            } catch (error) {
              console.error("❌ Error fetching adaptive products:", error);
              // Fallback to popular products
              query = query.order("created_at", { ascending: false });
            }
            break;

          default:
            console.log(
              `🔧 Using default algorithm (category-based) for: ${algorithm}`
            );
            // Default to category-based
            if (currentCategoryId) {
              console.log(
                `🏷️ Default: Filtering by category_id: ${currentCategoryId}`
              );
              query = query.eq("category_id", currentCategoryId);
              if (currentProductId) {
                console.log(
                  `❌ Default: Excluding current product: ${currentProductId}`
                );
                query = query.neq("id", currentProductId);
              }
            } else {
              console.warn(
                "⚠️ Default: No currentCategoryId, using popular fallback"
              );
              query = query.order("created_at", { ascending: false });
            }
        }

        console.log("🚀 Executing query with limit:", limit);
        const { data, error } = await query.limit(limit);

        if (error) {
          console.error("❌ Database error:", error);
          throw error;
        }

        const products = data || [];
        console.log(`📦 Query returned:`, products.length, "products");
        console.log(
          "📊 Products summary:",
          products.map((p) => ({
            id: p.id,
            name: p.name,
            category_id: p.category_id,
            subcategory_id: p.subcategory_id,
          }))
        );

        // If no products found and it's not a personalized/recent request, try fallback
        if (
          products.length === 0 &&
          !["personalized", "recent"].includes(algorithm)
        ) {
          console.log(
            `🔄 No products found for ${algorithm}, trying fallback...`
          );
            const { data: fallbackData, error: fallbackError } = await supabase
              .from("products")
              .select("id, name, description, image_url, category_id, subcategory_id, stock_quantity, created_at, status, additional_images")
              .order("created_at", { ascending: false })
              .limit(limit);          if (!fallbackError && fallbackData) {
            console.log(
              `✅ Fallback returned:`,
              fallbackData.length,
              "products"
            );
            setRelatedProducts(fallbackData);
          } else {
            console.error("❌ Fallback failed:", fallbackError);
            setRelatedProducts([]);
          }
        } else {
          console.log(`✅ Setting ${products.length} products`);
          setRelatedProducts(products);
        }
      } catch (error) {
        console.error("❌ Error fetching related products:", error);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
        console.log("🏁 RelatedProducts fetch completed");
      }
    };

    // Use useEffect to trigger fetch with debounce
    useEffect(() => {
      const timer = setTimeout(() => {
        if (!hasInitialized) {
          console.log("🔄 RelatedProducts useEffect triggered after debounce");
          setHasInitialized(true);
          performFetch();
        } else if (hasInitialized && !loading) {
          console.log("🔄 RelatedProducts refetch triggered");
          performFetch();
        }
      }, 100); // Small debounce to prevent rapid re-renders

      return () => clearTimeout(timer);
    }, [currentProductId, currentCategoryId, algorithm, limit]);

    const handleAddToCart = (product, e) => {
      e.preventDefault(); // Prevent navigation when clicking add to cart
      addToCart({ ...product, quantity: 1 });

      // Track user interest for better recommendations
      if (product.category_id) {
        trackInterest(product.category_id, product.subcategory_id, "addToCart");
      }

      // Visual feedback
      const button = e.target.closest("button");
      const originalContent = button.innerHTML;
      button.innerHTML =
        '<svg class="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>';
      button.classList.add("bg-green-600", "border-green-600");

      setTimeout(() => {
        button.innerHTML = originalContent;
        button.classList.remove("bg-green-600", "border-green-600");
      }, 1500);
    };

    const getAlgorithmIcon = () => {
      switch (algorithm) {
        case "popular":
          return <TrendingUp className="w-6 h-6 mr-3 text-green-600" />;
        case "trending":
          return <Sparkles className="w-6 h-6 mr-3 text-green-600" />;
        case "similar":
          return <Users className="w-6 h-6 mr-3 text-green-600" />;
        case "personalized":
          return <Heart className="w-6 h-6 mr-3 text-green-600" />;
        case "recent":
          return <Eye className="w-6 h-6 mr-3 text-green-600" />;
        case "adaptive":
          return <Sparkles className="w-6 h-6 mr-3 text-purple-600" />;
        default:
          return <Grid className="w-6 h-6 mr-3 text-green-600" />;
      }
    };

    if (loading && relatedProducts.length === 0) {
      return (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-square bg-gray-200 rounded-xl"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (relatedProducts.length === 0) {
      console.log("🚫 RelatedProducts: No products to display, returning null");
      return null;
    }

    console.log(
      "🎨 RelatedProducts: Rendering",
      relatedProducts.length,
      "products"
    );

    // Error boundary for product rendering
    const renderProduct = (product, index) => {
      try {
        return (
          <div key={product.id || index} className="group relative">
            <Link
              to={`/products/${product.id}`}
              className="block bg-white rounded-2xl border border-gray-200 hover:border-green-300 transition-all duration-300 hover:shadow-xl overflow-hidden"
            >
              {/* Product Image */}
              <div className="aspect-square bg-gray-50 overflow-hidden relative">
                <img
                  src={product.image_url || "/api/placeholder/200/200"}
                  alt={product.name || "Product"}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = "/api/placeholder/200/200";
                  }}
                />

                {/* View Count Badge - simulated */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-gray-600 flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  {Math.floor(Math.random() * 500 + 100)}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      // Add to wishlist logic here
                    }}
                  >
                    <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                  {product.name || "Unnamed Product"}
                </h3>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description ||
                    "Premium quality office furniture designed for modern workspaces."}
                </p>

                {/* Category */}
                {product.categories?.name && (
                  <div className="mb-3">
                    <span className="inline-block bg-gray-100 text-gray-700 rounded-full px-2 py-1 text-xs font-medium">
                      {product.categories.name}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-600 font-medium">
                    View Details
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                </div>
              </div>
            </Link>

            {/* Add to Cart Button */}
            {showAddToCart && (
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={(e) => handleAddToCart(product, e)}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-full p-2 shadow-lg transform hover:scale-110 transition-all duration-200"
                  title="Add to Cart"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        );
      } catch (error) {
        console.error("Error rendering product:", error, product);
        return null;
      }
    };

    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              {getAlgorithmIcon()}
              {title}
            </h2>
            {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
          </div>

          {relatedProducts.length === limit && (
            <Link
              to="/shop"
              className="text-green-600 hover:text-green-700 font-medium flex items-center transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts
            .map((product, index) => renderProduct(product, index))
            .filter(Boolean)}
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center bg-gradient-to-r from-green-50 to-yellow-50 rounded-full px-6 py-3 border border-green-200">
            <Sparkles className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-gray-700 font-medium">
              {algorithm === "similar"
                ? "Complete your office setup"
                : "Discover more amazing products"}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

RelatedProducts.displayName = "RelatedProducts";

export default RelatedProducts;
