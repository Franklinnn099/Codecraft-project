import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  ArcElement,
  Title,
} from "chart.js";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Target,
  Award,
  Activity,
} from "lucide-react";
import { exportToCSV } from "../utils/exportUtils";

ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  ArcElement,
  Title
);

// Check for demo mode from environment
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export default function SalesPerformance() {
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("12months");
  const [selectedChart, setSelectedChart] = useState("line");
  const [refreshing, setRefreshing] = useState(false);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  const categories = ["Chairs", "Desks", "Sofas", "Lighting", "Decor"];

  useEffect(() => {
    fetchSalesData();
  }, [selectedPeriod]);

  const fetchSalesData = async () => {
    setLoading(true);
    setError("");
    setIsUsingMockData(false);

    try {
      // Fetch from v_monthly_analytics view (real-time data)
      const { data, error } = await supabase
        .from("v_monthly_analytics")
        .select("*")
        .order("month", { ascending: true });

      if (error) {
        console.error("Error fetching sales data:", error);
        if (DEMO_MODE) {
          setIsUsingMockData(true);
          setSalesData(generateMockData());
        } else {
          setError("Failed to load sales data. No data available.");
        }
      } else if (data && data.length > 0) {
        // Process real data from v_monthly_analytics
        const labels = data.map((row) => {
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          return `${monthNames[row.month_num - 1]} ${row.year}`;
        });
        
        // Calculate sales based on inquiries (estimated revenue per inquiry)
        const sales = data.map((row) => (row.inquiries || 0) * 500);
        
        // Calculate growth
        const growth = sales.length >= 2 && sales[sales.length - 2] > 0
          ? Math.round(((sales[sales.length - 1] - sales[sales.length - 2]) / sales[sales.length - 2]) * 100)
          : 0;

        const totalSales = sales.reduce((sum, val) => sum + val, 0);
        const avgSales = sales.length > 0 ? totalSales / sales.length : 0;
        const maxSales = sales.length > 0 ? Math.max(...sales) : 0;
        const minSales = sales.length > 0 ? Math.min(...sales) : 0;

        setSalesData({
          labels,
          datasets: [
            {
              label: "Monthly Sales (GHS)",
              data: sales,
              fill: false,
              borderColor: "rgb(59, 130, 246)",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              tension: 0.4,
              pointBackgroundColor: "rgb(59, 130, 246)",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
            },
          ],
          growth,
          categorySales: {}, // Would need product-level data for category breakdown
          totalSales,
          avgSales,
          maxSales,
          minSales,
          salesCount: sales.length,
        });
      } else {
        // No data available
        if (DEMO_MODE) {
          setIsUsingMockData(true);
          setSalesData(generateMockData());
        } else {
          setError("No sales data available. Start tracking events on your client site.");
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      if (DEMO_MODE) {
        setIsUsingMockData(true);
        setSalesData(generateMockData());
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate mock data for demo mode
  const generateMockData = () => {
    const mockLabels = ["Jan 2025", "Feb 2025", "Mar 2025", "Apr 2025", "May 2025", "Jun 2025"];
    const mockSales = [45000, 52000, 48000, 61000, 55000, 67000];
    const mockCategorySales = {
      Chairs: 25000,
      Desks: 18000,
      Sofas: 15000,
      Lighting: 7000,
      Decor: 5000,
    };

    return {
      labels: mockLabels,
      datasets: [
        {
          label: "Monthly Sales (GHS)",
          data: mockSales,
          fill: false,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          pointBackgroundColor: "rgb(59, 130, 246)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
      growth: 12.5,
      categorySales: mockCategorySales,
      totalSales: mockSales.reduce((sum, val) => sum + val, 0),
      avgSales:
        mockSales.reduce((sum, val) => sum + val, 0) / mockSales.length,
      maxSales: Math.max(...mockSales),
      minSales: Math.min(...mockSales),
      salesCount: mockSales.length,
    };
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchSalesData();
    setRefreshing(false);
  };

  const handleExport = () => {
    if (!salesData || !salesData.datasets || !salesData.datasets[0].data) return;

    const exportData = salesData.labels.map((label, index) => ({
      Month: label,
      "Sales (GHS)": salesData.datasets[0].data[index],
      "Growth (%)": index === salesData.labels.length - 1 ? salesData.growth : ""
    }));

    exportToCSV(exportData, "sales_performance");
  };

  const getBarChartData = () => {
    if (!salesData) return null;

    return {
      labels: salesData.labels,
      datasets: [
        {
          label: "Monthly Sales (GHS)",
          data: salesData.datasets[0].data,
          backgroundColor: "rgba(59, 130, 246, 0.6)",
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  };

  const getCategoryChartData = () => {
    if (!salesData?.categorySales) return null;

    const categoryData = Object.entries(salesData.categorySales);
    const colors = [
      "rgba(59, 130, 246, 0.8)", // Blue
      "rgba(16, 185, 129, 0.8)", // Green
      "rgba(245, 158, 11, 0.8)", // Yellow
      "rgba(239, 68, 68, 0.8)", // Red
      "rgba(139, 92, 246, 0.8)", // Purple
    ];

    return {
      labels: categoryData.map(([category]) => category),
      datasets: [
        {
          data: categoryData.map(([, value]) => value),
          backgroundColor: colors.slice(0, categoryData.length),
          borderColor: colors
            .slice(0, categoryData.length)
            .map((color) => color.replace("0.8", "1")),
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales:
      selectedChart !== "doughnut"
        ? {
            x: {
              grid: {
                display: false,
              },
            },
            y: {
              beginAtZero: true,
              grid: {
                color: "rgba(0, 0, 0, 0.1)",
              },
              ticks: {
                callback: function (value) {
                  return "GHS " + value.toLocaleString();
                },
              },
            },
          }
        : {},
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Sales Performance
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive sales analytics and performance insights
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="6months">Last 6 Months</option>
              <option value="12months">Last 12 Months</option>
              <option value="24months">Last 24 Months</option>
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
              disabled={loading || !salesData}
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

        {salesData ? (
          <>
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold text-gray-900">
                      GHS {salesData.totalSales?.toLocaleString() || "0"}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {salesData.growth >= 0 ? (
                        <ArrowUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          salesData.growth >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {Math.abs(salesData.growth)}%
                      </span>
                      <span className="text-sm text-gray-500">
                        vs last period
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <span className="w-6 h-6 text-blue-600 flex items-center justify-center text-lg font-bold">
                      ₵
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Monthly</p>
                    <p className="text-2xl font-bold text-gray-900">
                      GHS{" "}
                      {Math.round(salesData.avgSales)?.toLocaleString() || "0"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Over {salesData.salesCount} months
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Best Month</p>
                    <p className="text-2xl font-bold text-gray-900">
                      GHS {salesData.maxSales?.toLocaleString() || "0"}
                    </p>
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      Peak performance
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Target className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Categories</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Object.keys(salesData.categorySales || {}).length}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Product categories
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Trend Chart */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Sales Trend
                    </h2>
                    <p className="text-sm text-gray-600">
                      Monthly sales performance over time
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedChart("line")}
                      className={`p-2 rounded-lg transition-colors ${
                        selectedChart === "line"
                          ? "bg-blue-100 text-blue-600"
                          : "text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      <LineChart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedChart("bar")}
                      className={`p-2 rounded-lg transition-colors ${
                        selectedChart === "bar"
                          ? "bg-blue-100 text-blue-600"
                          : "text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="h-80">
                  {selectedChart === "line" ? (
                    <Line data={salesData} options={chartOptions} />
                  ) : (
                    <Bar data={getBarChartData()} options={chartOptions} />
                  )}
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Growth Rate:</span>
                    <div className="flex items-center gap-1">
                      {salesData.growth >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-semibold ${
                          salesData.growth >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {salesData.growth >= 0 ? "+" : ""}
                        {salesData.growth}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Performance */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Category Performance
                    </h2>
                    <p className="text-sm text-gray-600">
                      Sales breakdown by product category
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setSelectedChart(
                        selectedChart === "doughnut" ? "bar" : "doughnut"
                      )
                    }
                    className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <PieChart className="w-4 h-4" />
                  </button>
                </div>

                {selectedChart === "doughnut" ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="w-64 h-64">
                      <Doughnut
                        data={getCategoryChartData()}
                        options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            legend: {
                              position: "bottom",
                              labels: {
                                usePointStyle: true,
                                padding: 15,
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(salesData.categorySales || {}).map(
                      ([category, value], idx) => {
                        const max = Math.max(
                          ...Object.values(salesData.categorySales || {}),
                          1
                        );
                        const percentage = (value / max) * 100;
                        const colors = [
                          "blue",
                          "green",
                          "yellow",
                          "red",
                          "purple",
                        ];
                        const color = colors[idx % colors.length];

                        return (
                          <div key={category} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">
                                {category}
                              </span>
                              <span className="text-sm font-semibold text-gray-900">
                                GHS {value?.toLocaleString() || "0"}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div
                                className={`h-3 bg-${color}-500 rounded-full transition-all duration-700`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>
                                {(
                                  (value /
                                    Object.values(
                                      salesData.categorySales || {}
                                    ).reduce((sum, v) => sum + v, 1)) *
                                  100
                                ).toFixed(1)}
                                % of total
                              </span>
                              <span className="flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                {percentage.toFixed(0)}% of max
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Performance Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-blue-900">Strong Growth</h4>
                  </div>
                  <p className="text-sm text-blue-800">
                    Sales have{" "}
                    {salesData.growth >= 0 ? "increased" : "decreased"} by{" "}
                    {Math.abs(salesData.growth)}% compared to the previous
                    period.
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-green-900">Top Category</h4>
                  </div>
                  <p className="text-sm text-green-800">
                    {Object.entries(salesData.categorySales || {}).sort(
                      ([, a], [, b]) => b - a
                    )[0]?.[0] || "N/A"}{" "}
                    is leading with the highest sales performance.
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    <h4 className="font-medium text-purple-900">Opportunity</h4>
                  </div>
                  <p className="text-sm text-purple-800">
                    Focus on{" "}
                    {Object.entries(salesData.categorySales || {}).sort(
                      ([, a], [, b]) => a - b
                    )[0]?.[0] || "underperforming"}{" "}
                    categories for potential growth.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-12 border border-white/20 shadow-lg text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Sales Data Available
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any sales data for the selected period. Check
              back later or try a different time range.
            </p>
            <button
              onClick={refreshData}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
