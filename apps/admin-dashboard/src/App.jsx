// src/App.jsx
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Auth
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Context
import { NotificationProvider } from "./context/NotificationContext";

// Layout
import AdminLayout from "./layouts/AdminLayout";

// Auth Pages
import Login from "./pages/Login";

// Dashboard
import Dashboard from "./pages/Dashboard";

// Products
import Products from "./pages/Products";
import ProductList from "./pages/ProductList";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import BulkImport from "./pages/BulkImport";

// Inquiries
import Inquiries from "./pages/Inquiries";
import ServiceInquiries from "./pages/ServiceInquiries";
import ContactMessages from "./pages/ContactMessages";

// Notifications
import Notifications from "./pages/Notifications";

// Newsletter
import Newsletter from "./pages/Newsletter";

// Customers
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";

// Categories & Content
import Categories from "./pages/Categories";
import ContentManagement from "./pages/ContentManagement";
import BlogPostList from "./pages/BlogPostList";
import CreateBlogPost from "./pages/CreateBlogpost";
import EditBlogPost from "./pages/EditBlogPost";
import HomePageBanners from "./pages/HomepageBanners";
import UploadImages from "./pages/UploadImages";

// Discounts
import Discounts from "./pages/Discounts";
import CreateDiscount from "./pages/CreateDiscount";
import EditDiscount from "./pages/EditDiscount";

// Analytics
import AnalyticsOverview from "./pages/AnalyticsOverview";
import SalesPerformance from "./pages/SalesPerformance";
import TopProducts from "./pages/TopProducts";
import UserBehavior from "./pages/UserBehavior";

// User Management
import Users from "./pages/Users";
import AddUser from "./pages/AddUser";
import EditUser from "./pages/EditUser";

// Admin Roles
import AdminRoles from "./pages/Adminroles";
import AddRole from "./pages/AddRole";
import EditAdminRole from "./pages/EditAdminRole";
import AdminUsersManagement from "./pages/AdminUsersManagement";

// Profile
import AdminProfile from "./pages/AdminProfile";

// Protected Layout Wrapper
function ProtectedLayout({ children, toggleDarkMode, darkMode }) {
  return (
    <ProtectedRoute>
      <AdminLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
        {children}
      </AdminLayout>
    </ProtectedRoute>
  );
}

// Super Admin Protected Layout
function SuperAdminLayout({ children, toggleDarkMode, darkMode }) {
  return (
    <ProtectedRoute requireSuperAdmin={true}>
      <AdminLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
        {children}
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <AuthProvider>
      <NotificationProvider>
        <div
          className={
            darkMode ? "dark bg-gray-900 text-gray-100" : "bg-white text-gray-900"
          }
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <Dashboard />
                </ProtectedLayout>
              }
            />

            {/* Products */}
            <Route
              path="/products"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <Products />
                </ProtectedLayout>
              }
            />
            <Route
              path="/product-list"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <ProductList />
                </ProtectedLayout>
              }
            />
            <Route
              path="/add-product"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <AddProduct />
                </ProtectedLayout>
              }
            />
            <Route
              path="/edit-product/:id"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <EditProduct />
                </ProtectedLayout>
              }
            />
            <Route
              path="/bulk-import"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <BulkImport />
                </ProtectedLayout>
              }
            />

            {/* Inquiries */}
            <Route
              path="/inquiries"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <Inquiries />
                </ProtectedLayout>
              }
            />
            <Route
              path="/service-inquiries"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <ServiceInquiries />
                </ProtectedLayout>
              }
            />
            <Route
              path="/contact-messages"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <ContactMessages />
                </ProtectedLayout>
              }
            />

            {/* Notifications */}
            <Route
              path="/notifications"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <Notifications />
                </ProtectedLayout>
              }
            />

            {/* Newsletter */}
            <Route
              path="/newsletter"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <Newsletter />
                </ProtectedLayout>
              }
            />

            {/* Customers */}
            <Route
              path="/customers"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <Customers />
                </ProtectedLayout>
              }
            />
            <Route
              path="/customers/:id"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <CustomerDetails />
                </ProtectedLayout>
              }
            />

            {/* Categories & Content */}
            <Route
              path="/categories"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <Categories />
                </ProtectedLayout>
              }
            />
            <Route
              path="/content"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <ContentManagement />
                </ProtectedLayout>
              }
            />
            <Route
              path="/content/blogs"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <BlogPostList />
                </ProtectedLayout>
              }
            />
            <Route
              path="/content/blogs/create"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <CreateBlogPost />
                </ProtectedLayout>
              }
            />
            <Route
              path="/content/blogs/edit/:id"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <EditBlogPost />
                </ProtectedLayout>
              }
            />
            <Route
              path="/content/banners"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <HomePageBanners />
                </ProtectedLayout>
              }
            />
            <Route
              path="/content/media-upload"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <UploadImages />
                </ProtectedLayout>
              }
            />

            {/* Analytics */}
            <Route
              path="/analytics"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <AnalyticsOverview />
                </ProtectedLayout>
              }
            />
            <Route
              path="/analytics/sales-performance"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <SalesPerformance />
                </ProtectedLayout>
              }
            />
            <Route
              path="/analytics/top-products"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <TopProducts />
                </ProtectedLayout>
              }
            />
            <Route
              path="/analytics/user-behavior"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <UserBehavior />
                </ProtectedLayout>
              }
            />

            {/* Discounts */}
            <Route
              path="/discounts"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <Discounts />
                </ProtectedLayout>
              }
            />
            <Route
              path="/discounts/create"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <CreateDiscount />
                </ProtectedLayout>
              }
            />
            <Route
              path="/discounts/edit/:id"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <EditDiscount />
                </ProtectedLayout>
              }
            />

            {/* User Management */}
            <Route
              path="/users"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <Users />
                </ProtectedLayout>
              }
            />
            <Route
              path="/add-user"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <AddUser />
                </ProtectedLayout>
              }
            />
            <Route
              path="/edit-user/:id"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <EditUser />
                </ProtectedLayout>
              }
            />

            {/* Admin Roles - Super Admin Only */}
            <Route
              path="/admin-roles"
              element={
                <SuperAdminLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <AdminRoles />
                </SuperAdminLayout>
              }
            />
            <Route
              path="/add-role"
              element={
                <SuperAdminLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <AddRole />
                </SuperAdminLayout>
              }
            />
            <Route
              path="/edit-role/:id"
              element={
                <SuperAdminLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <EditAdminRole />
                </SuperAdminLayout>
              }
            />
            <Route
              path="/admin-users"
              element={
                <SuperAdminLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <AdminUsersManagement />
                </SuperAdminLayout>
              }
            />

            {/* Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                  <AdminProfile />
                </ProtectedLayout>
              }
            />

            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}
