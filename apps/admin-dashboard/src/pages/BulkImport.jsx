import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Papa from "papaparse";
import {
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  X,
  FileText,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { toast } from "react-toastify";

export default function BulkImport() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data: catData } = await supabase.from("categories").select("*");
      const { data: subData } = await supabase.from("subcategories").select("*");
      setCategories(catData || []);
      setSubcategories(subData || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories for validation");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        toast.error("Please upload a valid CSV file");
        return;
      }
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file) => {
    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPreviewData(results.data);
        validateData(results.data);
        setLoading(false);
      },
      error: (error) => {
        toast.error("Error parsing CSV: " + error.message);
        setLoading(false);
      }
    });
  };

  const validateData = (data) => {
    const newErrors = [];
    data.forEach((row, index) => {
      const rowErrors = [];
      if (!row.Name) rowErrors.push("Name is required");
      if (!row.Price || isNaN(parseFloat(row.Price))) rowErrors.push("Valid Price is required");
      if (!row.Stock || isNaN(parseInt(row.Stock))) rowErrors.push("Valid Stock is required");
      
      // Validate Category
      if (row.Category) {
        const cat = categories.find(c => c.name.toLowerCase() === row.Category.toLowerCase());
        if (!cat) rowErrors.push(`Category '${row.Category}' not found`);
      }

      if (rowErrors.length > 0) {
        newErrors.push({ row: index + 1, errors: rowErrors });
      }
    });
    setErrors(newErrors);
  };

  const handleDownloadTemplate = () => {
    const headers = ["Name", "Description", "Price", "Stock", "Category", "Subcategory", "SKU", "Status"];
    const example = ["Executive Desk", "Premium wooden desk", "1200", "15", "Desks", "Executive Desks", "DSK-001", "In Stock"];
    const csvContent = [headers.join(","), example.join(",")].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "product_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    if (errors.length > 0) {
      toast.error("Please fix errors before importing");
      return;
    }

    setImporting(true);
    try {
      const productsToInsert = previewData.map(row => {
        const category = categories.find(c => c.name.toLowerCase() === (row.Category || "").toLowerCase());
        const subcategory = subcategories.find(s => s.name.toLowerCase() === (row.Subcategory || "").toLowerCase());

        return {
          name: row.Name,
          description: row.Description,
          price: parseFloat(row.Price),
          stock_quantity: parseInt(row.Stock),
          sku: row.SKU,
          status: row.Status || "In Stock",
          category_id: category?.id,
          subcategory_id: subcategory?.id,
          created_at: new Date().toISOString()
        };
      });

      const { error } = await supabase.from("products").insert(productsToInsert);

      if (error) throw error;

      toast.success(`Successfully imported ${productsToInsert.length} products`);
      navigate("/products");
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import products: " + error.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/products")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Bulk Import Products
              </h1>
              <p className="text-gray-600 mt-1">Upload a CSV file to add multiple products at once</p>
            </div>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download Template
          </button>
        </div>

        {/* File Format Instructions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            File Format Requirements
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Accepted Files */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-2">Accepted File Types</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>CSV files (.csv)</strong> - Comma-separated values</li>
                <li>• UTF-8 encoding recommended</li>
                <li>• Maximum file size: 5MB</li>
              </ul>
            </div>

            {/* Required Columns */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <h3 className="font-semibold text-green-900 mb-2">Required Columns</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• <strong>Name</strong> - Product name (required)</li>
                <li>• <strong>Price</strong> - Number (required)</li>
                <li>• <strong>Stock</strong> - Integer (required)</li>
              </ul>
            </div>
          </div>

          {/* Column Format Table */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Column Format Reference</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Column</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Required</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Format</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr><td className="px-4 py-2 font-medium">Name</td><td className="px-4 py-2 text-green-600">Yes</td><td className="px-4 py-2">Text</td><td className="px-4 py-2 text-gray-500">Executive Chair</td></tr>
                  <tr><td className="px-4 py-2 font-medium">Description</td><td className="px-4 py-2 text-gray-500">No</td><td className="px-4 py-2">Text</td><td className="px-4 py-2 text-gray-500">Premium leather chair</td></tr>
                  <tr><td className="px-4 py-2 font-medium">Price</td><td className="px-4 py-2 text-green-600">Yes</td><td className="px-4 py-2">Number (no currency)</td><td className="px-4 py-2 text-gray-500">1500</td></tr>
                  <tr><td className="px-4 py-2 font-medium">Stock</td><td className="px-4 py-2 text-green-600">Yes</td><td className="px-4 py-2">Integer</td><td className="px-4 py-2 text-gray-500">25</td></tr>
                  <tr><td className="px-4 py-2 font-medium">Category</td><td className="px-4 py-2 text-gray-500">No</td><td className="px-4 py-2">Exact match to existing</td><td className="px-4 py-2 text-gray-500">Office Chairs</td></tr>
                  <tr><td className="px-4 py-2 font-medium">Subcategory</td><td className="px-4 py-2 text-gray-500">No</td><td className="px-4 py-2">Exact match to existing</td><td className="px-4 py-2 text-gray-500">Executive Chairs</td></tr>
                  <tr><td className="px-4 py-2 font-medium">SKU</td><td className="px-4 py-2 text-gray-500">No</td><td className="px-4 py-2">Text (unique)</td><td className="px-4 py-2 text-gray-500">CHR-EXE-001</td></tr>
                  <tr><td className="px-4 py-2 font-medium">Status</td><td className="px-4 py-2 text-gray-500">No</td><td className="px-4 py-2">"In Stock" or "Out of Stock"</td><td className="px-4 py-2 text-gray-500">In Stock</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 bg-yellow-50 rounded-lg p-4 border border-yellow-100">
            <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Tips to Avoid Errors
            </h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Download and use the template for the correct format</li>
              <li>• Don't include currency symbols in prices (e.g., use "1200" not "GHS 1200")</li>
              <li>• Category and Subcategory names must match exactly (case-insensitive)</li>
              <li>• First row must be the header row</li>
              <li>• Remove any empty rows from your file</li>
            </ul>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/20 shadow-lg text-center">
          {!file ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 hover:border-blue-500 transition-colors">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Drag & Drop or Click to Upload
              </h3>
              <p className="text-gray-500 mb-6">
                Supported format: .csv
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <FileText className="w-5 h-5" />
                Select File
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <button
                onClick={() => { setFile(null); setPreviewData([]); setErrors([]); }}
                className="p-2 hover:bg-blue-100 rounded-full text-gray-500 hover:text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Validation Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="font-semibold text-red-900">Validation Errors ({errors.length})</h3>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {errors.map((err, idx) => (
                <div key={idx} className="text-sm text-red-700 bg-red-100/50 p-2 rounded">
                  <span className="font-medium">Row {err.row}:</span> {err.errors.join(", ")}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview Table */}
        {previewData.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Data Preview ({previewData.length} rows)</h3>
              <button
                onClick={handleImport}
                disabled={importing || errors.length > 0}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Import Products
                  </>
                )}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(previewData[0]).map((header) => (
                      <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className={errors.find(e => e.row === idx + 1) ? "bg-red-50" : ""}>
                      {Object.values(row).map((cell, cellIdx) => (
                        <td key={cellIdx} className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 10 && (
                <div className="px-6 py-4 bg-gray-50 text-center text-sm text-gray-500 border-t border-gray-200">
                  Showing first 10 rows of {previewData.length}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
