// Core batch import logic. Handles parsing, validation, image processing, and DB insertion.
// Called by the route handler for both validate-only and full import modes.

const XLSX = require('xlsx');
const { supabase } = require('../supabaseClient');
const {
  normalizeHeaders,
  normalizeCell,
  validateRow,
  buildCategoryMaps,
  MAX_IMAGES_PER_ROW,
} = require('../utils/validateProduct');
const { processImageUrl } = require('../utils/imageDownloader');
const { uploadImageBuffer } = require('../utils/storageUpload');

const MAX_ROWS = 500;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Parse an uploaded file buffer into an array of row objects.
 * Supports CSV, XLSX, and XLS.
 */
function parseSpreadsheet(buffer, originalName) {
  const workbook = XLSX.read(buffer, {
    type: 'buffer',
    cellDates: true,
    cellText: false,
    raw: true, // Keep raw values to avoid XLSX auto-formatting issues
  });

  if (workbook.SheetNames.length === 0) {
    throw new Error('Spreadsheet contains no sheets');
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

  if (rawData.length < 2) {
    throw new Error('Spreadsheet must have a header row and at least one data row');
  }

  const rawHeaders = rawData[0].map(h => h === null ? '' : String(h));
  const rows = rawData.slice(1).filter(row => {
    // Skip completely empty rows
    return row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '');
  });

  return { rawHeaders, rows };
}

/**
 * Prefetch all categories, subcategories, and existing SKUs from the database.
 */
async function prefetchLookupData() {
  const [catResult, subResult, skuResult] = await Promise.all([
    supabase.from('categories').select('id, name'),
    supabase.from('subcategories').select('id, name, category_id'),
    supabase.from('products').select('sku'),
  ]);

  if (catResult.error) throw new Error(`Failed to fetch categories: ${catResult.error.message}`);
  if (subResult.error) throw new Error(`Failed to fetch subcategories: ${subResult.error.message}`);
  if (skuResult.error) throw new Error(`Failed to fetch existing SKUs: ${skuResult.error.message}`);

  const existingSkus = new Set(
    (skuResult.data || [])
      .map(p => p.sku)
      .filter(Boolean)
      .map(s => s.toUpperCase())
  );

  return {
    categories: catResult.data || [],
    subcategories: subResult.data || [],
    existingSkus,
  };
}

/**
 * Run the batch import pipeline.
 * @param {Buffer} fileBuffer
 * @param {string} originalName
 * @param {boolean} validateOnly - If true, only validate without importing
 * @returns {Object} Import/validation result summary
 */
async function processBatchImport(fileBuffer, originalName, validateOnly = false) {
  const startTime = Date.now();

  // 1. Parse the spreadsheet
  const { rawHeaders, rows } = parseSpreadsheet(fileBuffer, originalName);

  if (rows.length > MAX_ROWS) {
    throw new Error(`File contains ${rows.length} data rows, maximum allowed is ${MAX_ROWS}`);
  }

  // 2. Normalize headers
  const { headerMap, errors: headerErrors, warnings: headerWarnings } = normalizeHeaders(rawHeaders);

  if (headerErrors.length > 0) {
    return {
      success: false,
      mode: validateOnly ? 'validate' : 'import',
      headerErrors,
      headerWarnings,
      totalRows: rows.length,
      validRows: 0,
      invalidRows: rows.length,
      importedRows: 0,
      failedRows: 0,
      rowResults: [],
      duration: Date.now() - startTime,
    };
  }

  // 3. Prefetch lookup data once
  const { categories, subcategories, existingSkus } = await prefetchLookupData();
  const { categoryMap, subcategoryMap } = buildCategoryMaps(categories, subcategories);

  // 4. Convert raw rows to objects using header map
  const dataRows = rows.map(row => {
    const obj = {};
    for (const [idx, canonical] of Object.entries(headerMap)) {
      obj[canonical] = row[parseInt(idx)] ?? null;
    }
    return obj;
  });

  // 5. Validate all rows (shared logic for both modes)
  const skusInFile = new Set(); // tracks SKUs seen so far for in-file duplicate detection
  const rowResults = [];
  const validProducts = [];

  for (let i = 0; i < dataRows.length; i++) {
    const rowNum = i + 2; // +2 because row 1 is headers, and we're 1-indexed
    const result = validateRow(dataRows[i], rowNum, {
      categoryMap,
      subcategoryMap,
      skusInFile,
      existingSkus,
    });

    rowResults.push({
      row: rowNum,
      status: result.errors.length === 0 ? 'valid' : 'invalid',
      errors: result.errors,
      warnings: result.warnings,
      data: result.normalized ? { name: result.normalized.name, sku: result.normalized.sku } : null,
    });

    if (result.normalized) {
      validProducts.push({ index: i, rowNum, product: result.normalized });
    }
  }

  const validCount = validProducts.length;
  const invalidCount = dataRows.length - validCount;

  // If validate-only, return results without importing
  if (validateOnly) {
    return {
      success: true,
      mode: 'validate',
      headerErrors: [],
      headerWarnings,
      totalRows: dataRows.length,
      validRows: validCount,
      invalidRows: invalidCount,
      importedRows: 0,
      failedRows: 0,
      rowResults,
      duration: Date.now() - startTime,
    };
  }

  // 6. IMPORT MODE: Process images and insert valid products
  if (validCount === 0) {
    return {
      success: false,
      mode: 'import',
      headerErrors: [],
      headerWarnings,
      totalRows: dataRows.length,
      validRows: 0,
      invalidRows: invalidCount,
      importedRows: 0,
      failedRows: 0,
      rowResults,
      duration: Date.now() - startTime,
    };
  }

  // Race-condition guard: Re-check SKUs right before insert to prevent
  // concurrent imports from creating duplicates
  const skusToInsert = validProducts.map(vp => vp.product.sku).filter(Boolean);
  if (skusToInsert.length > 0) {
    const { data: recheck } = await supabase
      .from('products')
      .select('sku')
      .in('sku', skusToInsert);

    const recheckSet = new Set((recheck || []).map(r => r.sku?.toUpperCase()));
    for (const vp of validProducts) {
      if (vp.product.sku && recheckSet.has(vp.product.sku)) {
        const rr = rowResults.find(r => r.row === vp.rowNum);
        if (rr) {
          rr.status = 'invalid';
          rr.errors.push(`SKU "${vp.product.sku}" was inserted by another import while processing`);
        }
        vp.blocked = true;
      }
    }
  }

  const productsToInsert = validProducts.filter(vp => !vp.blocked);

  // 7. Download and upload images for valid products
  for (const vp of productsToInsert) {
    const imageUrls = vp.product.image_urls || [];
    const uploadedUrls = [];
    const imageWarnings = [];

    for (const url of imageUrls) {
      const result = await processImageUrl(url);
      if (result.error) {
        imageWarnings.push(`Image failed: ${result.error}`);
        continue;
      }
      try {
        const publicUrl = await uploadImageBuffer(result.buffer, result.extension, result.contentType);
        uploadedUrls.push(publicUrl);
      } catch (err) {
        imageWarnings.push(`Image upload failed: ${err.message}`);
      }
    }

    // Set image URLs on product
    vp.product.image_url = uploadedUrls[0] || null;
    vp.product.additional_images = uploadedUrls.slice(1);

    // Add image warnings to row result
    if (imageWarnings.length > 0) {
      const rr = rowResults.find(r => r.row === vp.rowNum);
      if (rr) rr.warnings.push(...imageWarnings);
    }
  }

  // 8. Insert products into database
  let importedCount = 0;
  let failedCount = 0;

  // Insert one-by-one to get row-level error reporting.
  // For bulk performance with thousands of rows, batch insert would be better,
  // but row-level errors are more valuable for this use case with <=500 rows.
  for (const vp of productsToInsert) {
    const rr = rowResults.find(r => r.row === vp.rowNum);
    const p = vp.product;

    const payload = {
      name: p.name,
      description: p.description,
      price: p.price,
      stock_quantity: p.stock_quantity,
      sku: p.sku,
      status: p.status,
      category_id: p.category_id,
      subcategory_id: p.subcategory_id,
      image_url: p.image_url || null,
      additional_images: p.additional_images || [],
      colors: p.colors || [],
      brand: p.brand || null,
      dimensions: p.dimensions || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('products').insert([payload]);

    if (error) {
      failedCount++;
      if (rr) {
        rr.status = 'failed';
        rr.errors.push(`Database insert failed: ${error.message}`);
      }
    } else {
      importedCount++;
      if (rr) rr.status = 'imported';
    }
  }

  return {
    success: importedCount > 0,
    mode: 'import',
    headerErrors: [],
    headerWarnings,
    totalRows: dataRows.length,
    validRows: validCount,
    invalidRows: invalidCount,
    importedRows: importedCount,
    failedRows: failedCount,
    rowResults,
    duration: Date.now() - startTime,
  };
}

module.exports = {
  processBatchImport,
  parseSpreadsheet,
  prefetchLookupData,
  MAX_ROWS,
  MAX_FILE_SIZE,
};
