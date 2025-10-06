import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Box,
  ShoppingCart,
  Users,
  FileText,
  List,
  UserCheck,
  BarChart2,
  Percent,
  ChevronDown,
  ChevronUp,
  Settings,
  Package,
  TrendingUp,
  Star,
  Shield,
  Globe,
  Image,
  Tag,
  UserPlus,
  Menu,
  LogOut,
  Home,
  Sparkles,
  Award,
  Target,
  Clock,
  MessageSquare,
  Mail,
} from "lucide-react";

export default function Sidebar({ collapsed, onToggle }) {
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [contentOpen, setContentOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [inquiriesOpen, setInquiriesOpen] = useState(false);
  const location = useLocation();

  // Close dropdowns when sidebar collapses
  useEffect(() => {
    if (collapsed) {
      setAnalyticsOpen(false);
      setProductsOpen(false);
      setContentOpen(false);
      setUsersOpen(false);
      setInquiriesOpen(false);
    }
  }, [collapsed]);

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/",
      color: "text-blue-500",
    },
    {
      title: "Products",
      icon: Package,
      color: "text-green-500",
      isDropdown: true,
      isOpen: productsOpen,
      setIsOpen: setProductsOpen,
      subItems: [
        { title: "All Products", path: "/products", icon: Box },
        { title: "Product List", path: "/product-list", icon: List },
        { title: "Add Product", path: "/add-product", icon: UserPlus },
        { title: "Categories", path: "/categories", icon: Tag },
      ],
    },
    {
      title: "Inquiries",
      icon: MessageSquare,
      color: "text-cyan-500",
      isDropdown: true,
      isOpen: inquiriesOpen,
      setIsOpen: setInquiriesOpen,
      subItems: [
        { title: "Product Inquiries", path: "/inquiries", icon: Package },
        {
          title: "Service Inquiries",
          path: "/service-inquiries",
          icon: Target,
        },
        {
          title: "Contact Messages",
          path: "/contact-messages",
          icon: Mail,
        },
      ],
    },
    {
      title: "Newsletter",
      icon: Mail,
      path: "/newsletter",
      color: "text-indigo-500",
    },
    {
      title: "Users",
      icon: Users,
      color: "text-purple-500",
      isDropdown: true,
      isOpen: usersOpen,
      setIsOpen: setUsersOpen,
      subItems: [
        { title: "All Users", path: "/users", icon: Users },
        { title: "Add User", path: "/add-user", icon: UserPlus },
        { title: "Admin Roles", path: "/admin-roles", icon: Shield },
        { title: "Customers", path: "/customers", icon: UserCheck },
      ],
    },
    {
      title: "Content",
      icon: FileText,
      color: "text-pink-500",
      isDropdown: true,
      isOpen: contentOpen,
      setIsOpen: setContentOpen,
      subItems: [
        { title: "Content Hub", path: "/content", icon: Globe },
        { title: "Blog Posts", path: "/content/blogs", icon: FileText },
        { title: "Banners", path: "/content/banners", icon: Image },
        { title: "Media Upload", path: "/content/media-upload", icon: Image },
      ],
    },
    {
      title: "Analytics",
      icon: BarChart2,
      color: "text-indigo-500",
      isDropdown: true,
      isOpen: analyticsOpen,
      setIsOpen: setAnalyticsOpen,
      subItems: [
        { title: "Overview", path: "/analytics", icon: TrendingUp },
        {
          title: "Sales Performance",
          path: "/analytics/sales-performance",
          icon: Target,
        },
        { title: "Top Products", path: "/analytics/top-products", icon: Star },
        {
          title: "User Behavior",
          path: "/analytics/user-behavior",
          icon: Clock,
        },
      ],
    },
    {
      title: "Discounts",
      icon: Percent,
      path: "/discounts",
      color: "text-red-500",
    },
    {
      title: "Profile",
      icon: Settings,
      path: "/profile",
      color: "text-gray-500",
    },
  ];

  const renderNavItem = (item) => {
    if (item.isDropdown) {
      return (
        <div key={item.title} className="mb-2">
          <button
            onClick={() => !collapsed && item.setIsOpen(!item.isOpen)}
            className={`flex items-center w-full p-3 rounded-xl transition-all duration-200 group hover:bg-white/10 backdrop-blur-sm ${
              item.isOpen ? "bg-white/20 shadow-lg" : ""
            }`}
          >
            <item.icon
              className={`${collapsed ? "w-6 h-6" : "w-5 h-5"} ${
                item.color
              } transition-all duration-200 group-hover:scale-110`}
            />
            {!collapsed && (
              <>
                <span className="ml-3 font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">
                  {item.title}
                </span>
                <div className="ml-auto">
                  {item.isOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500 transition-transform duration-200" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 transition-transform duration-200" />
                  )}
                </div>
              </>
            )}
          </button>

          {item.isOpen && !collapsed && (
            <div className="mt-2 ml-4 space-y-1 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
              {item.subItems.map((subItem) => (
                <NavLink
                  key={subItem.path}
                  to={subItem.path}
                  className={({ isActive }) =>
                    `flex items-center p-2 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? "bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-lg transform scale-105"
                        : "hover:bg-white/10 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`
                  }
                >
                  <subItem.icon className="w-4 h-4 mr-3 transition-all duration-200 group-hover:scale-110" />
                  <span className="text-sm font-medium">{subItem.title}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) =>
          `flex items-center p-3 mb-2 rounded-xl transition-all duration-200 group ${
            isActive
              ? "bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-lg transform scale-105"
              : "hover:bg-white/10 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
          }`
        }
      >
        <item.icon
          className={`${collapsed ? "w-6 h-6" : "w-5 h-5"} ${
            item.color
          } transition-all duration-200 group-hover:scale-110`}
        />
        {!collapsed && <span className="ml-3 font-medium">{item.title}</span>}
      </NavLink>
    );
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg shadow-2xl transition-all duration-300 z-50 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-700 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        {!collapsed ? (
          <>
            <div className="relative">
              <img
                src="/pics/Company logo.png"
                alt="Logo"
                className="h-10 w-10 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
                Expert Office Furnish
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Admin Panel
              </span>
            </div>
          </>
        ) : (
          <div className="relative">
            <img
              src="/pics/Company logo.png"
              alt="Logo"
              className="h-10 w-10 object-cover rounded-xl shadow-lg"
            />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-yellow-400 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-140px)]">
        {menuItems.map(renderNavItem)}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <div
          className={`flex items-center gap-3 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <button
            onClick={onToggle}
            className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Menu className="w-4 h-4" />
          </button>
          {!collapsed && (
            <button className="flex items-center gap-2 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-all duration-200 hover:scale-105">
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
