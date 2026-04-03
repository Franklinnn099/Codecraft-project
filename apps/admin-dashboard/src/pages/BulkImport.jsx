import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  X,
  FileText,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Info,
} from "lucide-react";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api";
const API_KEY = import.meta.env.VITE_API_KEY || "";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB — must match backend

async function callBatchImport(file, validateOnly) {
  const formData = new FormData();
  formData.append("file", file);

  const url = `${API_URL}/products/batch-import?validate=${validateOnly}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "x-api-key": API_KEY },
    body: formData,
  });

  if (!res.ok && res.status !== 400) {
    const text = await res.text();
    throw new Error(`Server error (${res.status}): ${text}`);
  }

  return res.json();
}

function StatusBadge({ status }) {
  const styles = {
    valid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    imported: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    invalid: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    failed: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

export default function BulkImport() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [validated, setValidated] = useState(false);

  const handleFileChange = useCallback((e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const ext = selected.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      toast.error("Please upload a CSV or Excel (.xlsx, .xls) file");
      return;
    }

    if (selected.size > MAX_FILE_SIZE) {
      toast.error(`File too large (${(selected.size / 1024 / 1024).toFixed(1)}MB). Maximum is 5MB.`);
      return;
    }

    setFile(selected);
    setResult(null);
    setValidated(false);
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setResult(null);
    setValidated(false);
  }, []);

  const handleValidate = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await callBatchImport(file, true);
      setResult(data);
      setValidated(data.validRows > 0 && data.invalidRows === 0);
      if (data.validRows > 0 && data.invalidRows === 0) {
        toast.success(`All ${data.validRows} rows passed validation`);
      } else if (data.validRows > 0) {
        toast.warning(`${data.validRows} valid, ${data.invalidRows} invalid rows`);
      } else {
        toast.error("No valid rows found. Check errors below.");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [file]);

  const handleImport = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    try {
      const data = await callBatchImport(file, false);
      setResult(data);
      setValidated(false); // Reset so they can't double-import
      if (data.importedRows > 0) {
        toast.success(`Successfully imported ${data.importedRows} product(s)`);
      }
      if (data.failedRows > 0) {
        toast.warning(`${data.failedRows} row(s) failed during import`);
      }
      if (data.importedRows === 0 && data.failedRows === 0) {
        toast.error("No products were imported. Check errors below.");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [file]);

  const handleDownloadTemplate = () => {
    const headers = ["Name", "SKU", "Category", "Subcategory", "Price", "Stock", "Brand", "Color", "Description", "Dimensions", "Image URLs", "Status"];
    const example = [
      "Executive Desk", "DSK-001", "Desks", "Executive Desks", "1200", "15",
      "OfficePro", "Brown", "Premium wooden desk", "120x60x75cm",
      "https://example.com/desk.jpg", "active"
    ];
    const csvContent = [headers.join(","), example.map(v => `"${v}"`).join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "product_import_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasErrors = result?.rowResults?.some((r) => r.errors.length > 0);
  const hasWarnings = result?.rowResults?.some((r) => r.warnings.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/products")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Bulk Import Products
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Upload a CSV or Excel file to add multiple products
            </p>
          </div>
        </div>
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Download Template
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          File Format Requirements
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Accepted Files</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <li>CSV (.csv), Excel (.xlsx, .xls)</li>
              <li>Maximum 5MB, up to 500 rows</li>
              <li>First row must be headers</li>
            </ul>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800">
            <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">Required Columns</h3>
            <ul className="text-sm text-green-800 dark:text-green-400 space-y-1">
              <li><strong>Name</strong>, <strong>SKU</strong>, <strong>Category</strong>, <strong>Subcategory</strong>, <strong>Price</strong></li>
              <li>Optional: Stock, Brand, Color, Description, Dimensions, Image URLs, Status</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Column</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Required</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Format</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Example</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              <tr><td className="px-4 py-2 font-medium">Name</td><td className="px-4 py-2 text-green-600">Yes</td><td className="px-4 py-2">Text</td><td className="px-4 py-2 text-gray-500">Executive Chair</td></tr>
              <tr><td className="px-4 py-2 font-medium">SKU</td><td className="px-4 py-2 text-green-600">Yes</td><td className="px-4 py-2">Unique text</td><td className="px-4 py-2 text-gray-500">CHR-EXE-001</td></tr>
              <tr><td className="px-4 py-2 font-medium">Category</td><td className="px-4 py-2 text-green-600">Yes</td><td className="px-4 py-2">Must match existing</td><td className="px-4 py-2 text-gray-500">Chairs</td></tr>
              <tr><td className="px-4 py-2 font-medium">Subcategory</td><td className="px-4 py-2 text-green-600">Yes</td><td className="px-4 py-2">Must match existing</td><td className="px-4 py-2 text-gray-500">Office chair</td></tr>
              <tr><td className="px-4 py-2 font-medium">Price</td><td className="px-4 py-2 text-green-600">Yes</td><td className="px-4 py-2">Number (no currency)</td><td className="px-4 py-2 text-gray-500">1200</td></tr>
              <tr><td className="px-4 py-2 font-medium">Stock</td><td className="px-4 py-2 text-gray-400">No</td><td className="px-4 py-2">Integer (default 0)</td><td className="px-4 py-2 text-gray-500">25</td></tr>
              <tr><td className="px-4 py-2 font-medium">Image URLs</td><td className="px-4 py-2 text-gray-400">No</td><td className="px-4 py-2">URL(s) separated by |</td><td className="px-4 py-2 text-gray-500">https://drive.google.com/file/d/.../view</td></tr>
              <tr><td className="px-4 py-2 font-medium">Status</td><td className="px-4 py-2 text-gray-400">No</td><td className="px-4 py-2">active / inactive</td><td className="px-4 py-2 text-gray-500">active</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-100 dark:border-yellow-800">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Tips
          </h3>
          <ul className="text-sm text-yellow-800 dark:text-yellow-400 space-y-1">
            <li>Headers are case-insensitive (e.g., "PRICE", "price", "Price" all work)</li>
            <li>Prices can include commas (e.g., "2,350.00")</li>
            <li>Google Drive links must be publicly shared</li>
            <li>Google Photos links are NOT supported — use Drive or direct URLs</li>
            <li>Multiple image URLs per row: separate with | (pipe)</li>
            <li>Duplicate SKUs (in file or in database) will be rejected</li>
          </ul>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
        {!file ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-center">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Click to Upload
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Supported: .csv, .xlsx, .xls (max 5MB)
            </p>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
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
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                onClick={clearFile}
                disabled={loading}
                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleValidate}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && !result ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                Validate
              </button>
              <button
                onClick={handleImport}
                disabled={loading || !validated}
                title={!validated ? "Validate first before importing" : ""}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && result?.mode === "validate" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Import Products
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <SummaryCard label="Total Rows" value={result.totalRows} color="gray" />
            <SummaryCard label="Valid" value={result.validRows} color="green" />
            <SummaryCard label="Invalid" value={result.invalidRows} color="red" />
            {result.mode === "import" && (
              <>
                <SummaryCard label="Imported" value={result.importedRows} color="blue" />
                <SummaryCard label="Failed" value={result.failedRows} color="orange" />
              </>
            )}
          </div>

          {/* Header-level errors */}
          {result.headerErrors?.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-900 dark:text-red-300">File Structure Errors</h3>
              </div>
              <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                {result.headerErrors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          {/* Header warnings */}
          {result.headerWarnings?.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-amber-600" />
                <h3 className="font-medium text-amber-900 dark:text-amber-300 text-sm">Warnings</h3>
              </div>
              <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                {result.headerWarnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}

          {/* Row Results Table */}
          {result.rowResults?.length > 0 && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Row Details ({result.rowResults.length} rows)
                </h3>
                {result.duration && (
                  <span className="text-xs text-gray-500">Processed in {(result.duration / 1000).toFixed(1)}s</span>
                )}
              </div>
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Row</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Issues</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {result.rowResults.map((rr) => (
                      <tr
                        key={rr.row}
                        className={
                          rr.status === "invalid" || rr.status === "failed"
                            ? "bg-red-50/50 dark:bg-red-900/10"
                            : rr.status === "imported"
                            ? "bg-green-50/50 dark:bg-green-900/10"
                            : ""
                        }
                      >
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{rr.row}</td>
                        <td className="px-4 py-3"><StatusBadge status={rr.status} /></td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {rr.data ? (
                            <span>{rr.data.name} <span className="text-gray-400">({rr.data.sku})</span></span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {rr.errors.length > 0 && (
                            <div className="space-y-1">
                              {rr.errors.map((e, i) => (
                                <div key={i} className="text-xs text-red-600 dark:text-red-400 flex items-start gap-1">
                                  <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                                  {e}
                                </div>
                              ))}
                            </div>
                          )}
                          {rr.warnings.length > 0 && (
                            <div className="space-y-1 mt-1">
                              {rr.warnings.map((w, i) => (
                                <div key={i} className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1">
                                  <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                                  {w}
                                </div>
                              ))}
                            </div>
                          )}
                          {rr.errors.length === 0 && rr.warnings.length === 0 && (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  const colors = {
    gray: "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
    green: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400",
    red: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400",
  };
  return (
    <div className={`rounded-xl p-4 border border-gray-200 dark:border-gray-700 ${colors[color]}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
