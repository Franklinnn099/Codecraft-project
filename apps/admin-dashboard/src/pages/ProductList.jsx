import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Edit,
  Trash2,
  Eye,
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  MoreVertical,
  Download,
  Upload,
  CheckSquare,
  Square,
  X,
  Star,
  Clock,
  ShoppingCart,
  BarChart3,
  Layers,
  Tag,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      // Fetch products with category information
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select(
          `
          *,
          categories (
            id,
            name
          ),
          subcategories (
            id,
            name
          )
        `
        )
        .order(sortBy, { ascending: sortOrder === "asc" });

      if (productsError) {
        setError("Failed to load products: " + productsError.message);
      } else {
        setProducts(productsData || []);
      }

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
      } else {
        setCategories(categoriesData || []);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !selectedCategory || product.category_id === selectedCategory;

    const matchesStatus =
      !selectedStatus ||
      (selectedStatus === "in_stock" && product.status === "In Stock") ||
      (selectedStatus === "out_of_stock" &&
        product.status === "Out of Stock") ||
      (selectedStatus === "low_stock" && product.stock_quantity <= 10);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate statistics
  const totalProducts = products.length;
  const inStockProducts = products.filter(
    (p) => p.status === "In Stock"
  ).length;
  const lowStockProducts = products.filter(
    (p) => p.stock_quantity <= 10
  ).length;
  const totalValue = products.reduce(
    (sum, p) => sum + p.price * p.stock_quantity,
    0
  );

  const deleteProducts = async (productIds) => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .in("id", productIds);

      if (error) {
        setError("Failed to delete products: " + error.message);
      } else {
        await fetchData();
        setSelectedProducts([]);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setDeleting(false);
    }
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  const getStockStatus = (quantity, status) => {
    if (status === "Out of Stock" || quantity === 0)
      return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
    if (quantity <= 10)
      return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    return { label: "In Stock", color: "bg-green-100 text-green-800" };
  };

  const ProductCard = ({ product }) => {
    const stockStatus = getStockStatus(product.stock_quantity, product.status);
    const isSelected = selectedProducts.includes(product.id);

    return (
      <div
        className={`bg-white/80 backdrop-blur-sm rounded-xl p-6 border transition-all duration-200 hover:shadow-lg ${
          isSelected ? "border-blue-300 bg-blue-50/50" : "border-white/20"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <button
            onClick={() => toggleProductSelection(product.id)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isSelected ? (
              <CheckSquare className="w-5 h-5 text-blue-600" />
            ) : (
              <Square className="w-5 h-5 text-gray-400" />
            )}
          </button>
          <div className="relative">
            <button className="p-1 hover:bg-gray-100 rounded">
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500">SKU: {product.sku || "N/A"}</p>
            <p className="text-sm text-gray-500">
              {product.categories?.name || "Uncategorized"}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Price:</span>
            <span className="font-semibold text-gray-900">
              GHS {product.price}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Stock:</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}
            >
              {product.stock_quantity} units
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status:</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                product.status === "In Stock"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {product.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => navigate(`/products/${product.id}`)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          <Link
            to={`/edit-product/${product.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
        </div>
      </div>
    );
  };

  const ProductRow = ({ product }) => {
    const stockStatus = getStockStatus(product.stock_quantity, product.status);
    const isSelected = selectedProducts.includes(product.id);

    return (
      <tr
        className={`hover:bg-gray-50 transition-colors ${
          isSelected ? "bg-blue-50" : ""
        }`}
      >
        <td className="px-6 py-4">
          <button
            onClick={() => toggleProductSelection(product.id)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isSelected ? (
              <CheckSquare className="w-5 h-5 text-blue-600" />
            ) : (
              <Square className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div>
              <div className="font-medium text-gray-900">{product.name}</div>
              <div className="text-sm text-gray-500">
                SKU: {product.sku || "N/A"}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          {product.categories?.name || "Uncategorized"}
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          {product.subcategories?.name || "N/A"}
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">GHS {product.price}</td>
        <td className="px-6 py-4">
          <span
            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}
          >
            {product.stock_quantity}
          </span>
        </td>
        <td className="px-6 py-4">
          <span
            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
              product.status === "In Stock"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {product.status}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/products/${product.id}`)}
              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
              title="View product"
            >
              <Eye className="w-4 h-4" />
            </button>
            <Link
              to={`/edit-product/${product.id}`}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
              title="Edit product"
            >
              <Edit className="w-4 h-4" />
            </Link>
            <button
              onClick={() => deleteProducts([product.id])}
              className="p-1 text-red-600 hover:bg-red-100 rounded"
              title="Delete product"
              disabled={deleting}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Products
            </h1>
            <p className="text-gray-600 mt-1">Manage your product inventory</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                // Open BulkImport in the same window without navigation
                window.open('/bulk-import', '_self');
              }}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Upload className="w-5 h-5" />
              Bulk Import
            </button>
            <Link
              to="/add-product"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalProducts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {inStockProducts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {lowStockProducts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="w-6 h-6 text-purple-600 flex items-center justify-center text-lg font-bold">
                  ₵
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  GHS {totalValue.toFixed(0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => setError("")}
              className="ml-auto p-1 hover:bg-red-100 rounded"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products by name, description, or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="low_stock">Low Stock</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Filter className="w-5 h-5" />
                More Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="created_at">Date Created</option>
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="stock_quantity">Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={fetchData}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-800">
                {selectedProducts.length} product(s) selected
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => deleteProducts(selectedProducts)}
                  disabled={deleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </button>
                <button 
                  onClick={() => {
                    const csvContent = [
                      ["ID", "Name", "SKU", "Category", "Subcategory", "Price", "Stock", "Status", "Description"],
                      ...selectedProducts.map(id => {
                        const p = products.find(prod => prod.id === id);
                        return [
                          p.id,
                          `"${p.name.replace(/"/g, '""')}"`, // Escape quotes
                          p.sku || "",
                          p.categories?.name || "",
                          p.subcategories?.name || "",
                          p.price,
                          p.stock_quantity,
                          p.status,
                          `"${(p.description || "").replace(/"/g, '""')}"`
                        ];
                      })
                    ].map(e => e.join(",")).join("\n");

                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement("a");
                    const url = URL.createObjectURL(blob);
                    link.setAttribute("href", url);
                    link.setAttribute("download", "products_export.csv");
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button 
                  onClick={() => window.open('/bulk-import', '_self')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <Upload className="w-4 h-4" />
                  Import
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Showing {filteredProducts.length} of {totalProducts} products
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm"
                    : "hover:bg-gray-200"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-white shadow-sm"
                    : "hover:bg-gray-200"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Display */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-12 border border-white/20 shadow-lg text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory || selectedStatus
                ? "Try adjusting your search criteria or filters"
                : "Get started by adding your first product"}
            </p>
            {!searchTerm && !selectedCategory && !selectedStatus && (
              <Link
                to="/add-product"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Your First Product
              </Link>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={selectAllProducts}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {selectedProducts.length === filteredProducts.length ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subcategory
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <ProductRow key={product.id} product={product} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
