import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Search,
  Filter,
  Tag,
  Folder,
  FolderOpen,
  TrendingUp,
  Package,
  Grid,
  List,
  MoreVertical,
  Edit3,
  Eye,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { populateFromAssets } from "../utils/populateFromAssets";
import { confirmAndCleanup, getDatabaseCounts } from "../utils/cleanupDatabase";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [newSubCategory, setNewSubCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPopulating, setIsPopulating] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: cats, error: catErr } = await supabase
      .from("categories")
      .select("*");
    const { data: subs, error: subErr } = await supabase
      .from("subcategories")
      .select("*");

    if (catErr || subErr) {
      console.error("Error fetching data:", catErr?.message || subErr?.message);
      setLoading(false);
      return;
    }

    const joined = (cats || []).map((cat) => ({
      ...cat,
      subcategories: (subs || []).filter((sub) => sub.category_id === cat.id),
    }));

    setCategories(joined);
    setLoading(false);
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    const { data, error } = await supabase
      .from("categories")
      .insert([
        {
          name: newCategory.trim(),
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Add category failed:", error.message);
      return;
    }

    setCategories((prev) => [...prev, { ...data[0], subcategories: [] }]);
    setNewCategory("");
  };

  const handleAddSubCategory = async () => {
    if (!selectedCategoryId || !newSubCategory.trim()) return;

    const { data, error } = await supabase
      .from("subcategories")
      .insert([
        {
          name: newSubCategory.trim(),
          category_id: selectedCategoryId,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Add subcategory failed:", error.message);
      return;
    }

    const newSub = data[0];

    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === selectedCategoryId
          ? { ...cat, subcategories: [...cat.subcategories, newSub] }
          : cat
      )
    );
    setNewSubCategory("");
  };

  const handleDeleteCategory = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category and all its subcategories?"
    );
    if (!confirmed) return;

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      console.error("Delete category failed:", error.message);
      return;
    }
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    if (selectedCategoryId === id) setSelectedCategoryId(null);
  };

  const handleDeleteSubCategory = async (catId, subId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subcategory?"
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("subcategories")
      .delete()
      .eq("id", subId);
    if (error) {
      console.error("Delete subcategory failed:", error.message);
      return;
    }

    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === catId
          ? {
              ...cat,
              subcategories: cat.subcategories.filter(
                (sub) => sub.id !== subId
              ),
            }
          : cat
      )
    );
  };

  const handlePopulateFromAssets = async () => {
    setIsPopulating(true);
    try {
      const result = await populateFromAssets();
      if (result.success) {
        alert("Categories and products populated successfully!");
        await fetchData();
      } else {
        alert(`Failed to populate: ${result.message}`);
      }
    } catch (error) {
      console.error("Error populating from assets:", error);
      alert(`Error: ${error.message}`);
    }
    setIsPopulating(false);
  };

  const handleCleanupDatabase = async () => {
    const counts = await getDatabaseCounts();
    const totalRecords =
      counts.orderItems +
      counts.orders +
      counts.cartItems +
      counts.categories +
      counts.subcategories +
      counts.products;

    if (totalRecords === 0) {
      alert("Database is already empty!");
      return;
    }

    const confirmed = window.confirm(
      `⚠️ WARNING: This will permanently delete ALL data!\n\n` +
        `Current Database:\n` +
        `• Order Items: ${counts.orderItems}\n` +
        `• Orders: ${counts.orders}\n` +
        `• Cart Items: ${counts.cartItems}\n` +
        `• Categories: ${counts.categories}\n` +
        `• Subcategories: ${counts.subcategories}\n` +
        `• Products: ${counts.products}\n` +
        `• Total Records: ${totalRecords}\n\n` +
        `This action cannot be undone. Are you sure?`
    );

    if (!confirmed) return;

    setIsCleaning(true);
    try {
      const result = await confirmAndCleanup();
      if (result.success) {
        alert(
          "Database cleaned successfully! You can now manually add categories and products."
        );
        await fetchData();
      } else {
        alert(`Failed to clean database: ${result.message}`);
      }
    } catch (error) {
      console.error("Error cleaning database:", error);
      alert(`Error: ${error.message}`);
    }
    setIsCleaning(false);
  };

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  const stats = {
    totalCategories: categories.length,
    totalSubcategories: categories.reduce(
      (sum, cat) => sum + cat.subcategories.length,
      0
    ),
    avgSubcategories:
      categories.length > 0
        ? Math.round(
            categories.reduce((sum, cat) => sum + cat.subcategories.length, 0) /
              categories.length
          )
        : 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <FolderOpen className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Categories Manager</h1>
            <p className="text-xs text-gray-500">Organize your product hierarchy</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePopulateFromAssets}
            disabled={isPopulating}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Package className="w-4 h-4" />
            {isPopulating ? "Populating..." : "Populate Defaults"}
          </button>
          <button
            onClick={handleCleanupDatabase}
            disabled={isCleaning}
            className="px-4 py-2 bg-red-50 border border-red-100 text-red-600 rounded-lg hover:bg-red-100 transition-all text-sm font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {isCleaning ? "Cleaning..." : "Reset Database"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Category List */}
        <aside className="w-1/3 min-w-[320px] max-w-[400px] bg-white border-r border-gray-200 flex flex-col z-0">
          <div className="p-4 border-b border-gray-100 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
              />
            </div>
            
            {/* Add Category Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New category name..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
                className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
              />
              <button
                onClick={handleAddCategory}
                disabled={!newCategory.trim()}
                className="p-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                  selectedCategoryId === cat.id
                    ? "bg-green-50 border-green-200 shadow-sm"
                    : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    selectedCategoryId === cat.id ? "bg-green-200 text-green-700" : "bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-green-600"
                  }`}>
                    <Folder className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-semibold ${
                      selectedCategoryId === cat.id ? "text-green-900" : "text-gray-700"
                    }`}>
                      {cat.name}
                    </h3>
                    <p className={`text-xs ${
                      selectedCategoryId === cat.id ? "text-green-600" : "text-gray-400"
                    }`}>
                      {cat.subcategories.length} items
                    </p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                   {/* Only show delete if not selected or if we want quick action */}
                </div>
              </div>
            ))}
            
            {filteredCategories.length === 0 && (
              <div className="text-center py-10 px-4">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No categories found</p>
              </div>
            )}
          </div>
        </aside>

        {/* Right Content: Details */}
        <main className="flex-1 bg-gray-50/50 p-8 overflow-y-auto">
          {selectedCategory ? (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Category Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium tracking-wide uppercase">
                      Active Category
                    </span>
                    <span className="text-gray-400 text-sm">ID: {selectedCategory.id.slice(0, 8)}...</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">{selectedCategory.name}</h2>
                </div>
                <button
                  onClick={() => handleDeleteCategory(selectedCategory.id)}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 bg-white border border-red-100 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Delete Category</span>
                </button>
              </div>

              {/* Subcategories Section */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-green-600" />
                    Subcategories
                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full ml-2">
                      {selectedCategory.subcategories.length}
                    </span>
                  </h3>
                </div>
                
                <div className="p-6">
                  {/* Add Subcategory */}
                  <div className="flex gap-3 mb-6">
                    <input
                      type="text"
                      placeholder={`Add a subcategory to ${selectedCategory.name}...`}
                      value={newSubCategory}
                      onChange={(e) => setNewSubCategory(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddSubCategory()}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                    />
                    <button
                      onClick={handleAddSubCategory}
                      disabled={!newSubCategory.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-medium rounded-xl hover:shadow-lg hover:from-green-500 hover:to-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add
                    </button>
                  </div>

                  {/* Grid of Subcategories */}
                  {selectedCategory.subcategories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedCategory.subcategories.map((sub) => (
                        <div
                          key={sub.id}
                          className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-green-200 hover:shadow-md transition-all duration-200"
                        >
                          <span className="font-medium text-gray-700 group-hover:text-green-700 transition-colors">
                            {sub.name}
                          </span>
                          <button
                            onClick={() => handleDeleteSubCategory(selectedCategory.id, sub.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                      <Tag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No subcategories yet</p>
                      <p className="text-gray-400 text-sm mt-1">Add one above to get started</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Empty State / Dashboard Overview
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl flex items-center justify-center mb-8 shadow-lg rotate-3">
                <TrendingUp className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Select a Category
              </h2>
              <p className="text-gray-500 text-lg mb-12 max-w-md">
                Choose a category from the sidebar to manage its subcategories and settings, or view the overview below.
              </p>

              <div className="grid grid-cols-3 gap-6 w-full">
                {[
                  { label: "Total Categories", value: stats.totalCategories, icon: Folder, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Total Subcategories", value: stats.totalSubcategories, icon: Tag, color: "text-green-600", bg: "bg-green-50" },
                  { label: "Avg. per Category", value: stats.avgSubcategories, icon: Grid, color: "text-purple-600", bg: "bg-purple-50" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition-shadow">
                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} mb-3`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</span>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
