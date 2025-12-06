/**
 * Converts an array of objects to CSV format and triggers a file download.
 * @param {Array<Object>} data - The data to export.
 * @param {string} filename - The name of the file to save (without extension).
 */
export const exportToCSV = (data, filename = "export") => {
  if (!data || !data.length) {
    console.warn("No data to export");
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(","), // Header row
    ...data.map(row => 
      headers.map(fieldName => {
        const value = row[fieldName];
        // Handle strings with commas or quotes by wrapping in quotes
        const stringValue = String(value === null || value === undefined ? "" : value);
        return `"${stringValue.replace(/"/g, '""')}"`;
      }).join(",")
    )
  ].join("\n");

  // Create blob and download link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
