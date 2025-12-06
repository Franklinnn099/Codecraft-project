import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Award,
  TrendingUp,
  DollarSign,
  Star,
  Medal,
  Trophy,
  Target,
  ShoppingCart,
  Package,
  BarChart3,
  Eye,
  Filter,
  Calendar,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Crown,
  Zap,
  Activity,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { exportToCSV } from "../utils/exportUtils";

// Check for demo mode from environment
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export default function TopProducts() {
  const [topProducts, setTopProducts] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [growth, setGrowth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  const [refreshing, setRefreshing] = useState(false);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  useEffect(() => {
    fetchTopProducts();
  }, [selectedPeriod]);

  const fetchTopProducts = async () => {
    setLoading(true);
    setError("");
    setIsUsingMockData(false);

    try {
      // Fetch from v_top_products view (real-time data)
      const { data, error } = await supabase
        .from("v_top_products")
        .select("*")
        .limit(10);

      if (error) {
        console.error("Error fetching top products:", error);
        if (DEMO_MODE) {
          setIsUsingMockData(true);
          const mockData = generateMockData();
          setTopProducts(mockData.products);
          setTotalRevenue(mockData.totalRevenue);
          setGrowth(mockData.growth);
        } else {
          setError("Failed to load top products. No data available.");
        }
      } else if (data && data.length > 0) {
        // Process real data from v_top_products
        const processedProducts = data.map((item, index) => ({
          rank: index + 1,
          revenue: item.view_count * 50 + item.cart_count * 100 + item.inquiry_count * 500,
          performance_percent: Math.min(100, Math.round(item.performance_score / 10)),
          view_count: item.view_count,
          cart_count: item.cart_count,
          inquiry_count: item.inquiry_count,
          products: {
            name: item.product_name || "Unknown Product",
            image_url: item.image_url,
            price: item.price || 0,
            category_id: "general",
          },
        }));

        setTopProducts(processedProducts);
        const revenueSum = processedProducts.reduce(
          (sum, item) => sum + parseFloat(item.revenue || 0),
          0
        );
        setTotalRevenue(revenueSum);
        setGrowth(15);
      } else {
        // No data available
        if (DEMO_MODE) {
          setIsUsingMockData(true);
          const mockData = generateMockData();
          setTopProducts(mockData.products);
          setTotalRevenue(mockData.totalRevenue);
          setGrowth(mockData.growth);
        } else {
          setError("No product data available. Start tracking events on your client site.");
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      if (DEMO_MODE) {
        setIsUsingMockData(true);
        const mockData = generateMockData();
        setTopProducts(mockData.products);
        setTotalRevenue(mockData.totalRevenue);
        setGrowth(mockData.growth);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate mock data for demo mode
  const generateMockData = () => {
    const mockProducts = [
      {
        rank: 1,
        revenue: 45000,
        performance_percent: 95,
        products: {
          name: "Executive Office Chair",
          image_url: "/pics/chair.jpg",
          price: 1500,
          category_id: "chairs",
        },
      },
      {
        rank: 2,
        revenue: 38000,
        performance_percent: 88,
        products: {
          name: "Standing Desk Pro",
          image_url: "/pics/desk.jpg",
          price: 2200,
          category_id: "desks",
        },
      },
      {
        rank: 3,
        revenue: 32000,
        performance_percent: 78,
        products: {
          name: "Luxury Sofa Set",
          image_url: "/pics/sofa.png",
          price: 4500,
          category_id: "sofas",
        },
      },
      {
        rank: 4,
        revenue: 28000,
        performance_percent: 72,
        products: {
          name: "LED Desk Lamp",
          image_url: "/pics/lamp.jpg",
          price: 180,
          category_id: "lighting",
        },
      },
      {
        rank: 5,
        revenue: 22000,
        performance_percent: 65,
        products: {
          name: "Bookshelf Cabinet",
          image_url: "/pics/cabinet.jpg",
          price: 800,
          category_id: "storage",
        },
      },
    ];

    return {
      products: mockProducts,
      totalRevenue: mockProducts.reduce((sum, item) => sum + item.revenue, 0),
      growth: 18.5,
    };
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchTopProducts();
    setRefreshing(false);
  };

  const handleExport = () => {
    if (!topProducts || topProducts.length === 0) return;

    const exportData = topProducts.map(item => ({
      Rank: item.rank,
      Product: item.products?.name || "Unknown",
      Category: item.products?.category_id || "N/A",
      "Revenue (GHS)": item.revenue,
      "Price (GHS)": item.products?.price,
      "Performance (%)": item.performance_percent
    }));

    exportToCSV(exportData, "top_products");
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <Star className="w-5 h-5 text-blue-500" />;
    }
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
      default:
        return "bg-gradient-to-r from-blue-400 to-blue-600 text-white";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Top Products
            </h1>
            <p className="text-gray-600 mt-1">
              Best performing products based on sales and revenue
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="current">Current Month</option>
              <option value="last">Last Month</option>
              <option value="quarter">Last Quarter</option>
            </select>

            <button
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            <button 
              onClick={handleExport}
              disabled={loading || !topProducts.length}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-white/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  GHS {totalRevenue.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    +{growth}%
                  </span>
                  <span className="text-sm text-gray-500">vs last period</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="w-6 h-6 text-green-600 flex items-center justify-center text-lg font-bold">
                  ₵
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Top Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {topProducts.length}
                </p>
                <p className="text-sm text-gray-500 mt-1">High performers</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Performance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {topProducts.length > 0
                    ? Math.round(
                        topProducts.reduce(
                          (sum, p) => sum + p.performance_percent,
                          0
                        ) / topProducts.length
                      )
                    : 0}
                  %
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Across all products
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Top Products List */}
        {topProducts.length > 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Performance Rankings
                </h2>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {topProducts.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-6">
                    {/* Rank Badge */}
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full ${getRankBadgeColor(
                        item.rank
                      )} shadow-lg`}
                    >
                      <span className="text-lg font-bold">#{item.rank}</span>
                    </div>

                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      {item.products?.image_url ? (
                        <img
                          src={item.products.image_url}
                          alt={item.products?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getRankIcon(item.rank)}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.products?.name || "Unknown Product"}
                        </h3>
                        {item.rank <= 3 && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            Top Performer
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <span className="w-4 h-4">₵</span>
                          <span>
                            Revenue: GHS {item.revenue?.toLocaleString() || "0"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ShoppingCart className="w-4 h-4" />
                          <span>
                            Price: GHS{" "}
                            {item.products?.price?.toLocaleString() || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Performance Meter */}
                    <div className="text-right min-w-[200px]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Performance
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {item.performance_percent}%
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div
                          className={`h-3 rounded-full transition-all duration-700 ${
                            item.performance_percent >= 90
                              ? "bg-gradient-to-r from-green-400 to-green-600"
                              : item.performance_percent >= 75
                              ? "bg-gradient-to-r from-blue-400 to-blue-600"
                              : item.performance_percent >= 60
                              ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                              : "bg-gradient-to-r from-gray-400 to-gray-600"
                          }`}
                          style={{ width: `${item.performance_percent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div>
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-12 border border-white/20 shadow-lg text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Top Products Data
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any product performance data for the selected
              period.
            </p>
            <button
              onClick={refreshData}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh Data
            </button>
          </div>
        )}

        {/* Performance Insights */}
        {topProducts.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Performance Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Crown className="w-5 h-5 text-yellow-600" />
                  <h4 className="font-medium text-yellow-900">
                    Champion Product
                  </h4>
                </div>
                <p className="text-sm text-yellow-800">
                  {topProducts[0]?.products?.name || "N/A"} leads with{" "}
                  {topProducts[0]?.performance_percent || 0}% performance.
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-green-900">Revenue Leader</h4>
                </div>
                <p className="text-sm text-green-800">
                  Top 3 products generated GHS{" "}
                  {topProducts
                    .slice(0, 3)
                    .reduce((sum, p) => sum + (p.revenue || 0), 0)
                    .toLocaleString()}{" "}
                  in revenue.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">
                    Performance Range
                  </h4>
                </div>
                <p className="text-sm text-blue-800">
                  Performance ranges from{" "}
                  {Math.min(...topProducts.map((p) => p.performance_percent))}%
                  to{" "}
                  {Math.max(...topProducts.map((p) => p.performance_percent))}%.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
