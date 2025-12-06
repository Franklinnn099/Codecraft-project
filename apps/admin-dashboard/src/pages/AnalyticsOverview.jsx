// src/pages/AnalyticsOverview.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from "chart.js";
import { supabase } from "../lib/supabaseClient";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Users,
  ShoppingCart,
  DollarSign,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  RefreshCw,
  Target,
  Zap,
  Award,
  Activity,
} from "lucide-react";
import { exportToCSV } from "../utils/exportUtils";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
);

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

// Check for demo mode from environment
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export default function AnalyticsOverview() {
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [month, year, selectedPeriod]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setIsUsingMockData(false);
    
    try {
      // Fetch from v_monthly_analytics view (real-time data)
      const { data: trendData, error: trendError } = await supabase
        .from("v_monthly_analytics")
        .select("*")
        .eq("year", year)
        .order("month_num", { ascending: true });

      if (trendError) {
        console.error("Error fetching analytics:", trendError);
        
        // Only use mock data if DEMO_MODE is enabled
        if (DEMO_MODE) {
          setIsUsingMockData(true);
          const mockData = generateMockData();
          setMonthlyData(mockData);
          setStats(mockData.find(d => d.month_num === month) || mockData[mockData.length - 1]);
        }
      } else if (!trendData || trendData.length === 0) {
        // No data available
        if (DEMO_MODE) {
          setIsUsingMockData(true);
          const mockData = generateMockData();
          setMonthlyData(mockData);
          setStats(mockData.find(d => d.month_num === month) || mockData[mockData.length - 1]);
        } else {
          setMonthlyData([]);
          setStats(null);
        }
      } else {
        // Process real data
        const processedData = trendData.map(d => ({
          month: d.month_num,
          year: d.year,
          total_revenue: d.inquiries * 500, // Estimate revenue based on inquiries
          orders_placed: d.inquiries,
          site_visits: d.page_views,
          revenue_growth: 0,
          orders_growth: 0,
          aov_growth: 0,
          visits_growth: 0,
          average_order_value: d.inquiries > 0 ? (d.inquiries * 500) / d.inquiries : 0,
        }));
        
        // Calculate growth percentages
        for (let i = 1; i < processedData.length; i++) {
          const prev = processedData[i - 1];
          const curr = processedData[i];
          if (prev.total_revenue > 0) {
            curr.revenue_growth = Math.round(((curr.total_revenue - prev.total_revenue) / prev.total_revenue) * 100);
          }
          if (prev.orders_placed > 0) {
            curr.orders_growth = Math.round(((curr.orders_placed - prev.orders_placed) / prev.orders_placed) * 100);
          }
          if (prev.site_visits > 0) {
            curr.visits_growth = Math.round(((curr.site_visits - prev.site_visits) / prev.site_visits) * 100);
          }
        }
        
        setMonthlyData(processedData);
        setStats(processedData.find(d => d.month === month) || processedData[processedData.length - 1]);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      if (DEMO_MODE) {
        setIsUsingMockData(true);
        const mockData = generateMockData();
        setMonthlyData(mockData);
        setStats(mockData.find(d => d.month_num === month) || mockData[mockData.length - 1]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate mock data for demo mode
  const generateMockData = () => {
    const mockData = [];
    for (let m = 1; m <= 12; m++) {
      mockData.push({
        month: m,
        month_num: m,
        year: year,
        total_revenue: Math.floor(Math.random() * 50000) + 20000,
        orders_placed: Math.floor(Math.random() * 100) + 20,
        site_visits: Math.floor(Math.random() * 5000) + 1000,
        revenue_growth: Math.floor(Math.random() * 30) - 10,
        orders_growth: Math.floor(Math.random() * 30) - 10,
        aov_growth: Math.floor(Math.random() * 20) - 5,
        visits_growth: Math.floor(Math.random() * 40) - 10,
        average_order_value: Math.floor(Math.random() * 300) + 100,
      });
    }
    return mockData;
  };

  const handleExport = () => {
    if (!monthlyData || monthlyData.length === 0) return;
    
    const exportData = monthlyData.map(item => ({
      Month: months[item.month - 1],
      Year: item.year,
      "Total Revenue": item.total_revenue,
      "Orders Placed": item.orders_placed,
      "Site Visits": item.site_visits,
      "Revenue Growth (%)": item.revenue_growth,
      "Orders Growth (%)": item.orders_growth
    }));

    exportToCSV(exportData, "analytics_overview");
  };

  const insights = [
    {
      title: "Sales Performance",
      description:
        "Track sales trends, revenue, and inquiry metrics with detailed breakdowns.",
      link: "/analytics/sales-performance",
      icon: <BarChart3 className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600",
    },
    {
      title: "Top Products",
      description:
        "Identify best-selling items, popular categories, and inventory insights.",
      link: "/analytics/top-products",
      icon: <Award className="w-6 h-6" />,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600",
    },
    {
      title: "User Behavior",
      description:
        "Analyze site visits, user engagement, conversion rates, and customer journey.",
      link: "/analytics/user-behavior",
      icon: <Activity className="w-6 h-6" />,
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600",
    },
  ];

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthsShort = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const quickStats = stats
    ? [
        {
          label: "Total Revenue",
          value: `GH₵${stats.total_revenue?.toLocaleString() || "0"}`,
          change: `${stats.revenue_growth || 0}%`,
          changeType: stats.revenue_growth >= 0 ? "positive" : "negative",
          icon: <span className="w-6 h-6 flex items-center justify-center text-lg font-bold">₵</span>,
          color: "text-green-600",
          bgColor: "bg-green-100 dark:bg-green-900/30",
        },
        {
          label: "Inquiries Received",
          value: stats.orders_placed?.toLocaleString() || "0",
          change: `${stats.orders_growth || 0}%`,
          changeType: stats.orders_growth >= 0 ? "positive" : "negative",
          icon: <ShoppingCart className="w-6 h-6" />,
          color: "text-blue-600",
          bgColor: "bg-blue-100 dark:bg-blue-900/30",
        },
        {
          label: "Average Inquiry Value",
          value: `GH₵${stats.average_order_value?.toFixed(2) || "0.00"}`,
          change: `${stats.aov_growth || 0}%`,
          changeType: stats.aov_growth >= 0 ? "positive" : "negative",
          icon: <Target className="w-6 h-6" />,
          color: "text-purple-600",
          bgColor: "bg-purple-100 dark:bg-purple-900/30",
        },
        {
          label: "Site Visits",
          value: stats.site_visits?.toLocaleString() || "0",
          change: `${stats.visits_growth || 0}%`,
          changeType: stats.visits_growth >= 0 ? "positive" : "negative",
          icon: <Eye className="w-6 h-6" />,
          color: "text-orange-600",
          bgColor: "bg-orange-100 dark:bg-orange-900/30",
        },
      ]
    : [];

  const trendChartData = {
    labels: monthlyData.map((d) => monthsShort[d.month - 1]),
    datasets: [
      {
        label: "Revenue (GH₵)",
        data: monthlyData.map((d) => d.total_revenue || 0),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
      },
      {
        label: "Inquiries",
        data: monthlyData.map((d) => d.orders_placed || 0),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: false,
        tension: 0.4,
        pointBackgroundColor: "rgb(16, 185, 129)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
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
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: 11,
            weight: "bold",
          },
        },
      },
      y: {
        grid: {
          color: "rgba(107, 114, 128, 0.1)",
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: 11,
            weight: "bold",
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Analytics Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor key performance indicators and business insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalyticsData}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button 
            onClick={handleExport}
            disabled={loading || !monthlyData.length}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-yellow-500 text-white rounded-xl hover:from-green-600 hover:to-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Month
            </label>
            <select
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
            >
              {months.map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Year
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700"
              min="2020"
              max={currentYear + 1}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Period
            </label>
            <select
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="month">Monthly</option>
              <option value="quarter">Quarterly</option>
              <option value="year">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                <div className={stat.color}>{stat.icon}</div>
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  stat.changeType === "positive"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stat.changeType === "positive" ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Insight Cards */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Detailed Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insights.map((card, index) => (
            <Link to={card.link} key={index} className="group">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`p-3 ${card.bgColor} rounded-xl group-hover:scale-110 transition-transform duration-300`}
                  >
                    <div className={card.iconColor}>{card.icon}</div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors ml-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Performance Trends
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Revenue and order trends over {year}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-600">
              Growth Trending
            </span>
          </div>
        </div>
        <div className="h-80">
          <Line data={trendChartData} options={chartOptions} />
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Key Insights
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Best performing month
              </span>
              <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                {monthlyData.length > 0
                  ? monthsShort[
                      monthlyData.reduce(
                        (max, d, i, arr) =>
                          d.total_revenue > arr[max].total_revenue ? i : max,
                        0
                      )?.month - 1
                    ]
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Growth rate
              </span>
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                +{stats?.revenue_growth || 0}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Conversion rate
              </span>
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-400">
                {(
                  ((stats?.orders_placed || 0) / (stats?.site_visits || 1)) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Goals & Targets
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Monthly Revenue Goal
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {Math.round(((stats?.total_revenue || 0) / 50000) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      ((stats?.total_revenue || 0) / 50000) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Order Target
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {Math.round(((stats?.orders_placed || 0) / 100) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      ((stats?.orders_placed || 0) / 100) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
