import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
  Crown,
} from "lucide-react";

export default function Sidebar({ collapsed, onToggle }) {
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [contentOpen, setContentOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [inquiriesOpen, setInquiriesOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, isSuperAdmin, adminUser } = useAuth();

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
        {
          title: "Product Reviews",
          path: "/product-reviews",
          icon: Star,
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
        { title: "Admin Roles", path: "/admin-roles", icon: Shield, superAdminOnly: true },
        { title: "Admin Users", path: "/admin-users", icon: Crown, superAdminOnly: true },
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
            className={`relative flex items-center w-full p-3 rounded-2xl transition-all duration-300 group overflow-hidden ${
              item.isOpen 
                ? "bg-white/10 dark:bg-white/5 shadow-inner" 
                : "hover:bg-white/50 dark:hover:bg-white/5"
            }`}
          >
            <item.icon
              className={`${collapsed ? "w-6 h-6" : "w-5 h-5"} ${
                item.color
              } transition-transform duration-300 group-hover:scale-110 relative z-10`}
            />
            {!collapsed && (
              <>
                <span className="ml-3 font-semibold text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white relative z-10">
                  {item.title}
                </span>
                <div className="ml-auto relative z-10">
                  {item.isOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-200" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-200" />
                  )}
                </div>
              </>
            )}
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          </button>

          {item.isOpen && !collapsed && (
            <div className="mt-2 ml-4 space-y-1 relative pl-4">
              {/* Connector Line */}
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-gray-200 to-transparent dark:from-gray-700 rounded-full"></div>
              
              {item.subItems
                .filter(subItem => !subItem.superAdminOnly || isSuperAdmin)
                .map((subItem) => (
                <NavLink
                  key={subItem.path}
                  to={subItem.path}
                  className={({ isActive }) =>
                    `flex items-center p-2 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                      isActive
                        ? "bg-gradient-to-r from-green-500/10 to-transparent text-green-600 dark:text-green-400 font-bold translate-x-1"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`
                  }
                >
                  <subItem.icon className={`w-4 h-4 mr-3 transition-transform duration-300 ${
                    location.pathname === subItem.path ? "scale-110 rotate-3" : "group-hover:scale-110"
                  }`} />
                  <span className="text-sm">{subItem.title}</span>
                  {location.pathname === subItem.path && (
                    <div className="absolute left-0 w-1 h-4 bg-green-500 rounded-full"></div>
                  )}
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
          `group relative flex items-center p-3 mb-2 rounded-2xl transition-all duration-300 ${
            isActive
              ? "bg-gradient-to-r from-green-600 to-yellow-500 text-white shadow-lg shadow-green-500/20 transform scale-[1.02]"
              : "hover:bg-white/50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          }`
        }
      >
        <item.icon
          className={`${collapsed ? "w-6 h-6" : "w-5 h-5"} ${
            item.color
          } ${location.pathname === item.path ? "text-white" : ""} transition-transform duration-300 group-hover:scale-110 relative z-10`}
        />
        {!collapsed && <span className="ml-3 font-semibold relative z-10">{item.title}</span>}
        
        {/* Active Item Shine */}
        {location.pathname === item.path && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-30 animate-shine-slow"></div>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!collapsed && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed top-4 left-4 bottom-4 rounded-[2rem] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-500 ease-spring z-50 flex flex-col overflow-hidden
          ${collapsed ? "-translate-x-[150%] lg:translate-x-0 lg:w-24" : "translate-x-0 w-72"}
        `}
      >
      {/* Header */}
      <div
        className={`relative flex items-center gap-4 p-6 mb-2 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <div className="relative group cursor-pointer">
           <div className={`absolute -inset-2 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500 ${collapsed ? "w-14 h-14" : "w-14 h-14"}`}></div>
           <img
            src="/pics/Company logo.png"
            alt="Logo"
            className="relative h-12 w-12 object-cover rounded-2xl shadow-sm transition-transform duration-500 group-hover:rotate-6"
           />
           <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse z-10"></div>
        </div>

        {!collapsed && (
          <div className="flex flex-col animate-fadeIn">
            <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-green-600 to-yellow-500 bg-clip-text text-transparent">
              Expert<br/>Office.
            </h1>
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
              Admin Panel
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 hover:scrollbar-thumb-gray-300 pb-20">
        {menuItems.map(renderNavItem)}
      </nav>

      {/* Footer / Actions */}
      <div className="p-4 bg-gradient-to-t from-white/50 to-transparent dark:from-black/20">
        <div className={`flex flex-col gap-3 ${collapsed ? "items-center" : ""}`}>
           
           {/* Visit Site Button - Creative Style */}
           {!collapsed ? (
               <button 
                  onClick={() => window.location.href = "http://localhost:5001"}
                  className="group relative w-full overflow-hidden p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1"
               >
                   <div className="flex items-center justify-center gap-2 relative z-10">
                       <Globe className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                       <span>Live Site</span>
                   </div>
                   <div className="absolute inset-0 bg-blue-100 dark:bg-blue-800/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
               </button>
           ) : (
             <button 
                onClick={() => window.location.href = "http://localhost:5001"}
                className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:scale-110 transition-transform"
                title="Visit Live Site"
             >
                <Globe className="w-5 h-5" />
             </button>
           )}

           <div className="h-[1px] bg-gray-200 dark:bg-gray-700 w-full my-1"></div>

           {/* User & Logout Group */}
           <div className={`flex items-center gap-3 ${collapsed ? "flex-col" : "justify-between"}`}>
              {!collapsed && (
                  <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
                         {adminUser?.email?.[0]?.toUpperCase() || 'A'}
                      </div>
                      <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate max-w-[100px]">
                             {adminUser?.email?.split('@')[0] || 'Admin'}
                          </span>
                          <span className="text-[10px] text-gray-400">Online</span>
                      </div>
                  </div>
              )}
              
              <button 
                onClick={onToggle}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
              >
                  <Menu className="w-5 h-5" />
              </button>

              <button 
                onClick={async () => {
                  await signOut();
                  navigate('/login');
                }}
                className={`p-2 rounded-xl text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 ${!collapsed ? "ml-auto" : ""}`}
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
           </div>
        </div>
      </div>

    </aside>
    </>
  );
}
