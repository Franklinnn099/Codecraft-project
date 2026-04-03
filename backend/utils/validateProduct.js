// Shared validation logic for batch product import.
// Used by both validate-only and actual import modes to guarantee consistency.

const REQUIRED_COLUMNS = ['name', 'sku', 'category', 'subcategory', 'price'];

const OPTIONAL_COLUMNS = [
  'stock', 'brand', 'color', 'description', 'dimensions', 'image_urls', 'status'
];

const ALL_KNOWN_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];

// Maps messy spreadsheet headers to canonical column names
const HEADER_ALIASES = {
  'product name': 'name',
  'product_name': 'name',
  'productname': 'name',
  'name': 'name',
  'sku': 'sku',
  'product sku': 'sku',
  'category': 'category',
  'subcategory': 'subcategory',
  'sub category': 'subcategory',
  'sub_category': 'subcategory',
  'price': 'price',
  'unit price': 'price',
  'unit_price': 'price',
  'stock': 'stock',
  'stock quantity': 'stock',
  'stock_quantity': 'stock',
  'quantity': 'stock',
  'brand': 'brand',
  'color': 'color',
  'colour': 'color',
  'colors': 'color',
  'colours': 'color',
  'description': 'description',
  'product description': 'description',
  'dimensions': 'dimensions',
  'size': 'dimensions',
  'image': 'image_urls',
  'image url': 'image_urls',
  'image urls': 'image_urls',
  'image_url': 'image_urls',
  'image_urls': 'image_urls',
  'images': 'image_urls',
  'status': 'status',
};

// Values that spreadsheet software often produces for blank cells
const BLANK_SENTINELS = new Set([
  '', 'nan', 'null', 'undefined', 'n/a', 'na', 'none', '-', '#n/a', '#ref!', '#value!'
]);

function normalizeHeaderName(raw) {
  return String(raw).trim().toLowerCase().replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ');
}

// Returns { normalized: string, canonical: string|null }
function resolveHeader(raw) {
  const normalized = normalizeHeaderName(raw);
  const canonical = HEADER_ALIASES[normalized] || null;
  return { normalized, canonical };
}

// Normalize a cell value — returns null for blank sentinels
function normalizeCell(value) {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (BLANK_SENTINELS.has(str.toLowerCase())) return null;
  return str;
}

// Parse a price string that may contain commas or currency symbols
function parsePrice(raw) {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') return raw >= 0 ? raw : null;
  const cleaned = String(raw).replace(/[^0-9.\-]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num) || num < 0) return null;
  return Math.round(num * 100) / 100; // 2 decimal places
}

function parseStock(raw) {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') return Number.isInteger(raw) && raw >= 0 ? raw : null;
  // Strip commas but keep decimal point for proper truncation
  const cleaned = String(raw).replace(/,/g, '').trim();
  const num = parseInt(cleaned, 10);
  if (isNaN(num) || num < 0) return null;
  return num;
}

function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

const MAX_IMAGES_PER_ROW = 5;

/**
 * Normalize spreadsheet headers and return a mapping + any issues.
 * @param {string[]} rawHeaders
 * @returns {{ headerMap: Object<number, string>, errors: string[], warnings: string[] }}
 */
function normalizeHeaders(rawHeaders) {
  const headerMap = {}; // index -> canonical name
  const errors = [];
  const warnings = [];
  const seen = new Set();

  for (let i = 0; i < rawHeaders.length; i++) {
    const { normalized, canonical } = resolveHeader(rawHeaders[i]);
    if (!canonical) {
      warnings.push(`Column "${rawHeaders[i]}" is not recognized and will be ignored`);
      continue;
    }
    if (seen.has(canonical)) {
      warnings.push(`Duplicate column "${rawHeaders[i]}" mapped to "${canonical}" — using first occurrence`);
      continue;
    }
    seen.add(canonical);
    headerMap[i] = canonical;
  }

  // Check required columns are present
  for (const req of REQUIRED_COLUMNS) {
    if (!seen.has(req)) {
      errors.push(`Missing required column: "${req}"`);
    }
  }

  return { headerMap, errors, warnings };
}

/**
 * Validate a single row of product data.
 * @param {Object} row - Object with canonical column keys
 * @param {number} rowIndex - 1-based row number for error messages
 * @param {Object} context - { categoryMap, subcategoryMap, skusInFile, existingSkus }
 * @returns {{ errors: string[], warnings: string[], normalized: Object|null }}
 */
function validateRow(row, rowIndex, context) {
  const errors = [];
  const warnings = [];
  const { categoryMap, subcategoryMap, skusInFile, existingSkus } = context;

  // Required fields
  const name = normalizeCell(row.name);
  if (!name) errors.push('Name is required');

  const skuRaw = normalizeCell(row.sku);
  if (!skuRaw) {
    errors.push('SKU is required');
  }

  const categoryName = normalizeCell(row.category);
  if (!categoryName) errors.push('Category is required');

  const subcategoryName = normalizeCell(row.subcategory);
  if (!subcategoryName) errors.push('Subcategory is required');

  const priceRaw = normalizeCell(row.price);
  if (priceRaw === null) {
    errors.push('Price is required');
  }

  // Parse & validate price
  let price = null;
  if (priceRaw !== null) {
    price = parsePrice(priceRaw);
    if (price === null) {
      errors.push(`Invalid price value: "${row.price}"`);
    }
  }

  // Parse & validate stock (optional)
  const stockRaw = normalizeCell(row.stock);
  let stock = 0;
  if (stockRaw !== null) {
    stock = parseStock(stockRaw);
    if (stock === null) {
      errors.push(`Invalid stock value: "${row.stock}" (must be non-negative integer)`);
      stock = 0;
    }
  }

  // SKU duplicate detection
  const sku = skuRaw ? skuRaw.toUpperCase() : null;
  if (sku) {
    if (skusInFile.has(sku)) {
      errors.push(`Duplicate SKU "${sku}" found in upload file`);
    } else {
      skusInFile.add(sku);
    }
    if (existingSkus.has(sku)) {
      errors.push(`SKU "${sku}" already exists in the database`);
    }
  }

  // Category validation
  let categoryId = null;
  if (categoryName) {
    categoryId = categoryMap.get(categoryName.toLowerCase());
    if (!categoryId) {
      errors.push(`Category "${categoryName}" not found in database`);
    }
  }

  // Subcategory validation
  let subcategoryId = null;
  if (subcategoryName) {
    subcategoryId = subcategoryMap.get(subcategoryName.toLowerCase());
    if (!subcategoryId) {
      errors.push(`Subcategory "${subcategoryName}" not found in database`);
    }
    // Cross-check: if both category and subcategory resolved, verify the subcategory belongs to the category
    if (subcategoryId && categoryId) {
      const subEntry = subcategoryMap.getEntry?.(subcategoryName.toLowerCase());
      if (subEntry && subEntry.category_id && subEntry.category_id !== categoryId) {
        errors.push(`Subcategory "${subcategoryName}" does not belong to category "${categoryName}"`);
      }
    }
  }

  // Image URL validation
  const imageUrlsRaw = normalizeCell(row.image_urls);
  const imageUrls = [];
  if (imageUrlsRaw) {
    // Support multiple URLs separated by | or ;
    const urls = imageUrlsRaw.split(/[|;]/).map(u => u.trim()).filter(Boolean);
    if (urls.length > MAX_IMAGES_PER_ROW) {
      warnings.push(`Row has ${urls.length} image URLs, only first ${MAX_IMAGES_PER_ROW} will be processed`);
    }
    for (const url of urls.slice(0, MAX_IMAGES_PER_ROW)) {
      if (isValidUrl(url)) {
        imageUrls.push(url);
      } else {
        warnings.push(`Invalid image URL skipped: "${url.substring(0, 80)}"`);
      }
    }
  }

  // Optional fields
  const description = normalizeCell(row.description) || '';
  const brand = normalizeCell(row.brand) || '';
  const color = normalizeCell(row.color) || '';
  const dimensions = normalizeCell(row.dimensions) || '';
  const status = normalizeCell(row.status) || 'active';

  const normalized = {
    name,
    sku,
    price,
    stock_quantity: stock,
    category_id: categoryId,
    subcategory_id: subcategoryId,
    description,
    brand,
    colors: color ? color.split(/[,;|]/).map(c => c.trim()).filter(Boolean) : [],
    dimensions,
    image_urls: imageUrls,
    status: ['active', 'inactive', 'in stock', 'out of stock'].includes(status.toLowerCase())
      ? (status.toLowerCase() === 'in stock' ? 'active' : status.toLowerCase() === 'out of stock' ? 'inactive' : status.toLowerCase())
      : 'active',
  };

  return { errors, warnings, normalized: errors.length === 0 ? normalized : null };
}

/**
 * Build lookup maps from DB category/subcategory arrays.
 * Returns maps keyed by lowercase name for case-insensitive matching.
 */
function buildCategoryMaps(categories, subcategories) {
  const categoryMap = new Map();
  for (const cat of categories) {
    categoryMap.set(cat.name.toLowerCase(), cat.id);
  }

  // Subcategory map with extra metadata for cross-checking
  const subcategoryMap = new Map();
  subcategoryMap.getEntry = (key) => {
    return subcategories.find(s => s.name.toLowerCase() === key) || null;
  };
  for (const sub of subcategories) {
    subcategoryMap.set(sub.name.toLowerCase(), sub.id);
  }

  return { categoryMap, subcategoryMap };
}

module.exports = {
  REQUIRED_COLUMNS,
  OPTIONAL_COLUMNS,
  ALL_KNOWN_COLUMNS,
  MAX_IMAGES_PER_ROW,
  normalizeHeaders,
  normalizeCell,
  validateRow,
  buildCategoryMaps,
  parsePrice,
  parseStock,
  isValidUrl,
};
