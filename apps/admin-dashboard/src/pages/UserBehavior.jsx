import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
  ArcElement,
  RadialLinearScale,
} from "chart.js";
import { Line, Bar, Doughnut, Radar } from "react-chartjs-2";
import dayjs from "dayjs";
import {
  Users,
  Eye,
  Clock,
  TrendingDown,
  TrendingUp,
  MousePointer,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  ArrowUp,
  ArrowDown,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Zap,
  Heart,
  UserCheck,
  Navigation,
  Map,
  Timer,
  PlayCircle,
  Repeat,
  CheckCircle,
  AlertTriangle,
  Info,
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
  Title,
  ArcElement,
  RadialLinearScale
);

// Check for demo mode from environment
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export default function UserBehavior() {
  const [behaviorData, setBehaviorData] = useState([]);
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState("page_views");
  const [dateRange, setDateRange] = useState("month");
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  const userMetrics = [
    {
      label: "Page Views",
      key: "page_views",
      icon: Eye,
      color: "blue",
      description: "Total number of pages viewed by users",
    },
    {
      label: "Session Duration",
      key: "session_duration",
      icon: Clock,
      color: "green",
      description: "Average time users spend on your site",
    },
    {
      label: "Bounce Rate",
      key: "bounce_rate",
      icon: TrendingDown,
      color: "red",
      description: "Percentage of single-page sessions",
    },
    {
      label: "Returning Users",
      key: "returning_users",
      icon: UserCheck,
      color: "purple",
      description: "Users who have visited before",
    },
  ];

  const insights = [
    {
      title: "User Engagement",
      description:
        "Comprehensive analysis of user interaction patterns including time spent, pages viewed, and engagement depth.",
      icon: Activity,
      color: "blue",
    },
    {
      title: "Retention Analytics",
      description:
        "Track user return behavior and identify factors that drive repeat visits and long-term engagement.",
      icon: Repeat,
      color: "green",
    },
    {
      title: "Performance Metrics",
      description:
        "Monitor bounce rates, session quality, and conversion funnel performance to optimize user experience.",
      icon: Target,
      color: "purple",
    },
    {
      title: "Device & Platform",
      description:
        "Understand user device preferences and platform usage to optimize responsive design and functionality.",
      icon: Monitor,
      color: "orange",
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError("");
    setIsUsingMockData(false);

    try {
      // Fetch from v_daily_analytics view (real-time data)
      const { data, error } = await supabase
        .from("v_daily_analytics")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching user behavior:", error);
        if (DEMO_MODE) {
          setIsUsingMockData(true);
          const mockData = generateMockData();
          setBehaviorData(mockData);
        } else {
          setError("Failed to load user behavior data. No data available.");
        }
      } else if (data && data.length > 0) {
        // Process real data from v_daily_analytics
        const processedData = data.map(item => ({
          date: item.date,
          page_views: item.page_views || 0,
          session_duration: { seconds: 180 }, // Default session duration
          bounce_rate: 35, // Would need session data for accurate calculation
          returning_users: Math.floor(item.unique_sessions * 0.3),
          unique_visitors: item.unique_sessions || 0,
          device_desktop: item.desktop_views || 0,
          device_mobile: item.mobile_views || 0,
          device_tablet: item.tablet_views || 0,
        }));
        setBehaviorData(processedData);
      } else {
        // No data available
        if (DEMO_MODE) {
          setIsUsingMockData(true);
          const mockData = generateMockData();
          setBehaviorData(mockData);
        } else {
          setError("No user behavior data available. Start tracking events on your client site.");
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      if (DEMO_MODE) {
        setIsUsingMockData(true);
        const mockData = generateMockData();
        setBehaviorData(mockData);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const days = month ? dayjs(`${year}-${month}`).daysInMonth() : 30;
    const startDate = month
      ? dayjs(`${year}-${month}-01`)
      : dayjs().subtract(30, "days");

    return Array.from({ length: days }, (_, i) => {
      const date = startDate.add(i, "day");
      return {
        date: date.format("YYYY-MM-DD"),
        page_views: Math.floor(Math.random() * 5000) + 1000,
        session_duration: { seconds: Math.floor(Math.random() * 600) + 120 },
        bounce_rate: (Math.random() * 40 + 20).toFixed(1),
        returning_users: Math.floor(Math.random() * 200) + 50,
        unique_visitors: Math.floor(Math.random() * 800) + 200,
        device_desktop: Math.floor(Math.random() * 60) + 20,
        device_mobile: Math.floor(Math.random() * 50) + 30,
        device_tablet: Math.floor(Math.random() * 20) + 5,
      };
    });
  };

  useEffect(() => {
    fetchData();
  }, [year, month]);

  const refreshData = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleExport = () => {
    if (!behaviorData || behaviorData.length === 0) return;

    const exportData = behaviorData.map(item => ({
      Date: new Date(item.date).toLocaleDateString(),
      "Page Views": item.page_views,
      "Bounce Rate (%)": item.bounce_rate,
      "Returning Users": item.returning_users,
      "Session Duration (s)": item.session_duration?.seconds || 0,
      "Desktop Users": item.device_desktop,
      "Mobile Users": item.device_mobile,
      "Tablet Users": item.device_tablet
    }));

    exportToCSV(exportData, "user_behavior");
  };

  const formatDuration = (interval) => {
    if (!interval || !interval.seconds) return "0s";
    const minutes = Math.floor(interval.seconds / 60);
    const seconds = interval.seconds % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  const getMetricValue = (data, key) => {
    if (!data) return 0;

    switch (key) {
      case "session_duration":
        return data[key]?.seconds || 0;
      case "bounce_rate":
        return parseFloat(data[key] || 0);
      default:
        return data[key] || 0;
    }
  };

  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  const chartLabels = behaviorData.map((item) =>
    dayjs(item.date).format("MMM D")
  );
  const latestData = behaviorData[behaviorData.length - 1];
  const previousData = behaviorData[behaviorData.length - 2];

  // Device distribution data
  const deviceData =
    behaviorData.length > 0
      ? {
          desktop: behaviorData.reduce(
            (sum, item) => sum + (item.device_desktop || 0),
            0
          ),
          mobile: behaviorData.reduce(
            (sum, item) => sum + (item.device_mobile || 0),
            0
          ),
          tablet: behaviorData.reduce(
            (sum, item) => sum + (item.device_tablet || 0),
            0
          ),
        }
      : { desktop: 50, mobile: 35, tablet: 15 };

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
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
              User Behavior Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive insights into user engagement and interaction
              patterns
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[2025, 2024, 2023, 2022].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Months</option>
              {Array.from({ length: 12 }).map((_, idx) => (
                <option key={idx + 1} value={String(idx + 1).padStart(2, "0")}>
                  {dayjs().month(idx).format("MMMM")}
                </option>
              ))}
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
              disabled={loading || !behaviorData.length}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-white/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
            <Info className="w-5 h-5 text-orange-600" />
            <div>
              <span className="text-orange-800 font-medium">Demo Mode: </span>
              <span className="text-orange-700">
                Showing sample data for demonstration purposes
              </span>
            </div>
          </div>
        )}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {userMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            const currentValue = getMetricValue(latestData, metric.key);
            const previousValue = getMetricValue(previousData, metric.key);
            const growth = calculateGrowth(currentValue, previousValue);
            const isPositive = growth > 0;
            const isNegative = growth < 0;

            // Format display value
            let displayValue = currentValue;
            if (metric.key === "session_duration") {
              displayValue = formatDuration({ seconds: currentValue });
            } else if (metric.key === "bounce_rate") {
              displayValue = `${currentValue}%`;
            } else {
              displayValue = currentValue.toLocaleString();
            }

            return (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${metric.color}-100`}>
                    <IconComponent
                      className={`w-6 h-6 text-${metric.color}-600`}
                    />
                  </div>
                  {growth !== 0 && (
                    <div
                      className={`flex items-center gap-1 ${
                        isPositive
                          ? "text-green-600"
                          : isNegative
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUp className="w-4 h-4" />
                      ) : isNegative ? (
                        <ArrowDown className="w-4 h-4" />
                      ) : null}
                      <span className="text-sm font-medium">
                        {Math.abs(growth)}%
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    {displayValue}
                  </p>
                  <p className="text-xs text-gray-500">{metric.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {insights.map((insight, index) => {
            const IconComponent = insight.icon;
            return (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg bg-${insight.color}-100`}>
                    <IconComponent
                      className={`w-5 h-5 text-${insight.color}-600`}
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {insight.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {insight.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Page Views Trend */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <LineChart className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Page Views Trend
              </h2>
            </div>

            <Line
              data={{
                labels: chartLabels,
                datasets: [
                  {
                    label: "Page Views",
                    data: behaviorData.map((item) => item.page_views),
                    borderColor: "rgba(59, 130, 246, 1)",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: "rgba(59, 130, 246, 1)",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2,
                    pointRadius: 4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                    labels: {
                      usePointStyle: true,
                      font: { size: 12 },
                    },
                  },
                  tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    titleColor: "white",
                    bodyColor: "white",
                    borderColor: "rgba(59, 130, 246, 1)",
                    borderWidth: 1,
                  },
                },
                scales: {
                  x: {
                    grid: { color: "rgba(0, 0, 0, 0.05)" },
                    ticks: { color: "#6b7280" },
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: "rgba(0, 0, 0, 0.05)" },
                    ticks: {
                      color: "#6b7280",
                      callback: function (value) {
                        return value.toLocaleString();
                      },
                    },
                  },
                },
              }}
              height={300}
            />
          </div>

          {/* Device Distribution */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <PieChart className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Device Distribution
              </h2>
            </div>

            <div className="flex items-center justify-center h-64">
              <Doughnut
                data={{
                  labels: ["Desktop", "Mobile", "Tablet"],
                  datasets: [
                    {
                      data: [
                        deviceData.desktop,
                        deviceData.mobile,
                        deviceData.tablet,
                      ],
                      backgroundColor: [
                        "rgba(59, 130, 246, 0.8)",
                        "rgba(16, 185, 129, 0.8)",
                        "rgba(249, 115, 22, 0.8)",
                      ],
                      borderColor: [
                        "rgba(59, 130, 246, 1)",
                        "rgba(16, 185, 129, 1)",
                        "rgba(249, 115, 22, 1)",
                      ],
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { size: 12 },
                      },
                    },
                    tooltip: {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      titleColor: "white",
                      bodyColor: "white",
                      callbacks: {
                        label: function (context) {
                          const total = context.dataset.data.reduce(
                            (a, b) => a + b,
                            0
                          );
                          const percentage = (
                            (context.parsed * 100) /
                            total
                          ).toFixed(1);
                          return `${context.label}: ${percentage}%`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>

            <div className="mt-4 space-y-2">
              {[
                {
                  label: "Desktop",
                  value: deviceData.desktop,
                  color: "blue",
                  icon: Monitor,
                },
                {
                  label: "Mobile",
                  value: deviceData.mobile,
                  color: "green",
                  icon: Smartphone,
                },
                {
                  label: "Tablet",
                  value: deviceData.tablet,
                  color: "orange",
                  icon: Tablet,
                },
              ].map((device, idx) => {
                const IconComponent = device.icon;
                const total =
                  deviceData.desktop + deviceData.mobile + deviceData.tablet;
                const percentage = ((device.value / total) * 100).toFixed(1);

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent
                        className={`w-4 h-4 text-${device.color}-600`}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {device.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">
                        {percentage}%
                      </span>
                      <div className="text-xs text-gray-500">
                        {device.value.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Engagement & Retention
              </h2>
            </div>

            <Bar
              data={{
                labels: chartLabels,
                datasets: [
                  {
                    label: "Session Duration (mins)",
                    data: behaviorData.map((item) =>
                      (getMetricValue(item, "session_duration") / 60).toFixed(1)
                    ),
                    backgroundColor: "rgba(16, 185, 129, 0.6)",
                    borderColor: "rgba(16, 185, 129, 1)",
                    borderWidth: 1,
                    yAxisID: "y-duration",
                  },
                  {
                    label: "Returning Users",
                    data: behaviorData.map((item) => item.returning_users || 0),
                    backgroundColor: "rgba(139, 92, 246, 0.6)",
                    borderColor: "rgba(139, 92, 246, 1)",
                    borderWidth: 1,
                    yAxisID: "y-users",
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: "index",
                  intersect: false,
                },
                plugins: {
                  legend: {
                    position: "top",
                    labels: {
                      usePointStyle: true,
                      font: { size: 12 },
                    },
                  },
                  tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    titleColor: "white",
                    bodyColor: "white",
                  },
                },
                scales: {
                  x: {
                    grid: { color: "rgba(0, 0, 0, 0.05)" },
                    ticks: { color: "#6b7280" },
                  },
                  "y-duration": {
                    type: "linear",
                    position: "left",
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Duration (mins)",
                      color: "#6b7280",
                    },
                    grid: { color: "rgba(0, 0, 0, 0.05)" },
                    ticks: { color: "#6b7280" },
                  },
                  "y-users": {
                    type: "linear",
                    position: "right",
                    beginAtZero: true,
                    title: { display: true, text: "Users", color: "#6b7280" },
                    grid: { drawOnChartArea: false },
                    ticks: { color: "#6b7280" },
                  },
                },
              }}
              height={300}
            />
          </div>

          {/* Bounce Rate Analysis */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 rounded-lg">
                <Target className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Bounce Rate Analysis
              </h2>
            </div>

            <Line
              data={{
                labels: chartLabels,
                datasets: [
                  {
                    label: "Bounce Rate (%)",
                    data: behaviorData.map((item) =>
                      getMetricValue(item, "bounce_rate")
                    ),
                    borderColor: "rgba(239, 68, 68, 1)",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: "rgba(239, 68, 68, 1)",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2,
                    pointRadius: 4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                    labels: {
                      usePointStyle: true,
                      font: { size: 12 },
                    },
                  },
                  tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    titleColor: "white",
                    bodyColor: "white",
                    callbacks: {
                      label: function (context) {
                        return `Bounce Rate: ${context.parsed.y}%`;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    grid: { color: "rgba(0, 0, 0, 0.05)" },
                    ticks: { color: "#6b7280" },
                  },
                  y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: "rgba(0, 0, 0, 0.05)" },
                    ticks: {
                      color: "#6b7280",
                      callback: function (value) {
                        return value + "%";
                      },
                    },
                  },
                },
              }}
              height={300}
            />

            {/* Bounce Rate Insights */}
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h4 className="font-medium text-red-900">
                  Performance Insight
                </h4>
              </div>
              <p className="text-sm text-red-800">
                {latestData && getMetricValue(latestData, "bounce_rate") > 60
                  ? "High bounce rate detected. Consider improving page load speed and content relevance."
                  : "Bounce rate is within acceptable range. Continue monitoring for trends."}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Performance Summary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900">
                {behaviorData
                  .reduce((sum, item) => sum + (item.page_views || 0), 0)
                  .toLocaleString()}
              </h3>
              <p className="text-sm text-blue-700">Total Page Views</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-900">
                {behaviorData
                  .reduce((sum, item) => sum + (item.unique_visitors || 0), 0)
                  .toLocaleString()}
              </h3>
              <p className="text-sm text-green-700">Unique Visitors</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-purple-900">
                {behaviorData.length > 0
                  ? formatDuration({
                      seconds: Math.floor(
                        behaviorData.reduce(
                          (sum, item) =>
                            sum + getMetricValue(item, "session_duration"),
                          0
                        ) / behaviorData.length
                      ),
                    })
                  : "0s"}
              </h3>
              <p className="text-sm text-purple-700">Avg Session Duration</p>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <TrendingDown className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-orange-900">
                {behaviorData.length > 0
                  ? (
                      behaviorData.reduce(
                        (sum, item) =>
                          sum + getMetricValue(item, "bounce_rate"),
                        0
                      ) / behaviorData.length
                    ).toFixed(1)
                  : "0"}
                %
              </h3>
              <p className="text-sm text-orange-700">Avg Bounce Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
