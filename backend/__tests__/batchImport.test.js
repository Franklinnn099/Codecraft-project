const {
  normalizeHeaders,
  validateRow,
  buildCategoryMaps,
  parsePrice,
  parseStock,
  isValidUrl,
  normalizeCell,
} = require('../utils/validateProduct');

const { extractGoogleDriveFileId, isGooglePhotosUrl } = require('../utils/imageDownloader');

const XLSX = require('xlsx');

// Helper: build a minimal context for validateRow
function makeContext(overrides = {}) {
  const categories = overrides.categories || [
    { id: 'cat-1', name: 'Chairs' },
    { id: 'cat-2', name: 'Desks' },
  ];
  const subcategories = overrides.subcategories || [
    { id: 'sub-1', name: 'Office chair', category_id: 'cat-1' },
    { id: 'sub-2', name: 'Executive Desks', category_id: 'cat-2' },
  ];
  const { categoryMap, subcategoryMap } = buildCategoryMaps(categories, subcategories);
  return {
    categoryMap,
    subcategoryMap,
    skusInFile: overrides.skusInFile || new Set(),
    existingSkus: overrides.existingSkus || new Set(),
  };
}

function validRow(overrides = {}) {
  return {
    name: 'Test Product',
    sku: 'TST-001',
    category: 'Chairs',
    subcategory: 'Office chair',
    price: '1200',
    stock: '10',
    description: 'A test product',
    ...overrides,
  };
}

// ========================================
// Header Normalization
// ========================================

describe('normalizeHeaders', () => {
  test('maps standard headers correctly', () => {
    const { headerMap, errors } = normalizeHeaders(['Name', 'SKU', 'Category', 'Subcategory', 'Price']);
    expect(errors).toHaveLength(0);
    expect(Object.values(headerMap)).toEqual(
      expect.arrayContaining(['name', 'sku', 'category', 'subcategory', 'price'])
    );
  });

  test('handles case-insensitive headers', () => {
    const { headerMap, errors } = normalizeHeaders(['NAME', 'sku', 'CATEGORY', 'Sub Category', 'PRICE']);
    expect(errors).toHaveLength(0);
    expect(Object.values(headerMap)).toContain('name');
    expect(Object.values(headerMap)).toContain('subcategory');
  });

  test('reports missing required columns', () => {
    const { errors } = normalizeHeaders(['Name', 'Price']);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.includes('sku'))).toBe(true);
    expect(errors.some(e => e.includes('category'))).toBe(true);
  });

  test('warns about unrecognized columns', () => {
    const { warnings } = normalizeHeaders(['Name', 'SKU', 'Category', 'Subcategory', 'Price', 'Foo Bar']);
    expect(warnings.some(w => w.includes('Foo Bar'))).toBe(true);
  });

  test('handles duplicate columns by using first occurrence', () => {
    const { warnings } = normalizeHeaders(['Name', 'SKU', 'Category', 'Subcategory', 'Price', 'Price']);
    expect(warnings.some(w => w.includes('Duplicate'))).toBe(true);
  });
});

// ========================================
// Cell normalization
// ========================================

describe('normalizeCell', () => {
  test('trims whitespace', () => {
    expect(normalizeCell('  hello  ')).toBe('hello');
  });

  test.each(['', 'nan', 'NaN', 'null', 'undefined', 'N/A', 'na', 'none', '-', '#N/A'])(
    'treats "%s" as blank', (val) => {
      expect(normalizeCell(val)).toBeNull();
    }
  );

  test('returns null for null/undefined', () => {
    expect(normalizeCell(null)).toBeNull();
    expect(normalizeCell(undefined)).toBeNull();
  });
});

// ========================================
// Price Parsing
// ========================================

describe('parsePrice', () => {
  test('parses plain number', () => {
    expect(parsePrice('1200')).toBe(1200);
  });

  test('parses number with commas', () => {
    expect(parsePrice('2,350.00')).toBe(2350);
  });

  test('parses number with currency symbol', () => {
    expect(parsePrice('GHS 1,200.50')).toBe(1200.5);
  });

  test('returns null for negative', () => {
    expect(parsePrice('-100')).toBeNull();
  });

  test('returns null for non-numeric', () => {
    expect(parsePrice('abc')).toBeNull();
  });

  test('handles numeric type directly', () => {
    expect(parsePrice(500)).toBe(500);
  });

  test('returns null for null/undefined', () => {
    expect(parsePrice(null)).toBeNull();
    expect(parsePrice(undefined)).toBeNull();
  });
});

// ========================================
// Stock Parsing
// ========================================

describe('parseStock', () => {
  test('parses integer string', () => {
    expect(parseStock('25')).toBe(25);
  });

  test('returns null for negative', () => {
    expect(parseStock('-5')).toBeNull();
  });

  test('truncates decimal', () => {
    expect(parseStock('10.5')).toBe(10);
  });

  test('returns null for non-numeric', () => {
    expect(parseStock('abc')).toBeNull();
  });

  test('handles numeric type', () => {
    expect(parseStock(42)).toBe(42);
  });
});

// ========================================
// URL Validation
// ========================================

describe('isValidUrl', () => {
  test('accepts valid https URL', () => {
    expect(isValidUrl('https://example.com/image.jpg')).toBe(true);
  });

  test('accepts valid http URL', () => {
    expect(isValidUrl('http://example.com/image.jpg')).toBe(true);
  });

  test('rejects non-URL', () => {
    expect(isValidUrl('not a url')).toBe(false);
  });

  test('rejects ftp', () => {
    expect(isValidUrl('ftp://example.com/file')).toBe(false);
  });
});

// ========================================
// Row Validation
// ========================================

describe('validateRow', () => {
  test('valid row passes', () => {
    const ctx = makeContext();
    const { errors, normalized } = validateRow(validRow(), 2, ctx);
    expect(errors).toHaveLength(0);
    expect(normalized).not.toBeNull();
    expect(normalized.name).toBe('Test Product');
    expect(normalized.sku).toBe('TST-001');
    expect(normalized.price).toBe(1200);
    expect(normalized.stock_quantity).toBe(10);
    expect(normalized.category_id).toBe('cat-1');
    expect(normalized.subcategory_id).toBe('sub-1');
  });

  test('missing name errors', () => {
    const ctx = makeContext();
    const { errors } = validateRow(validRow({ name: '' }), 2, ctx);
    expect(errors.some(e => e.includes('Name'))).toBe(true);
  });

  test('missing SKU errors', () => {
    const ctx = makeContext();
    const { errors } = validateRow(validRow({ sku: '' }), 2, ctx);
    expect(errors.some(e => e.includes('SKU'))).toBe(true);
  });

  test('invalid price errors', () => {
    const ctx = makeContext();
    const { errors } = validateRow(validRow({ price: 'abc' }), 2, ctx);
    expect(errors.some(e => e.includes('price') || e.includes('Price'))).toBe(true);
  });

  test('invalid stock errors', () => {
    const ctx = makeContext();
    const { errors } = validateRow(validRow({ stock: 'xyz' }), 2, ctx);
    expect(errors.some(e => e.includes('stock') || e.includes('Stock'))).toBe(true);
  });

  test('unknown category errors', () => {
    const ctx = makeContext();
    const { errors } = validateRow(validRow({ category: 'Nonexistent' }), 2, ctx);
    expect(errors.some(e => e.includes('Category') && e.includes('not found'))).toBe(true);
  });

  test('unknown subcategory errors', () => {
    const ctx = makeContext();
    const { errors } = validateRow(validRow({ subcategory: 'Nonexistent' }), 2, ctx);
    expect(errors.some(e => e.includes('Subcategory') && e.includes('not found'))).toBe(true);
  });

  test('duplicate SKU in file errors', () => {
    const ctx = makeContext({ skusInFile: new Set(['TST-001']) });
    const { errors } = validateRow(validRow(), 2, ctx);
    expect(errors.some(e => e.includes('Duplicate SKU') && e.includes('upload file'))).toBe(true);
  });

  test('duplicate SKU in database errors', () => {
    const ctx = makeContext({ existingSkus: new Set(['TST-001']) });
    const { errors } = validateRow(validRow(), 2, ctx);
    expect(errors.some(e => e.includes('already exists'))).toBe(true);
  });

  test('invalid image URL produces warning', () => {
    const ctx = makeContext();
    const { warnings } = validateRow(validRow({ image_urls: 'not-a-url' }), 2, ctx);
    expect(warnings.some(w => w.includes('Invalid image URL'))).toBe(true);
  });

  test('valid image URL passes', () => {
    const ctx = makeContext();
    const { normalized } = validateRow(
      validRow({ image_urls: 'https://example.com/img.jpg' }),
      2, ctx
    );
    expect(normalized.image_urls).toEqual(['https://example.com/img.jpg']);
  });

  test('multiple image URLs separated by pipe', () => {
    const ctx = makeContext();
    const { normalized } = validateRow(
      validRow({ image_urls: 'https://a.com/1.jpg|https://b.com/2.jpg' }),
      2, ctx
    );
    expect(normalized.image_urls).toHaveLength(2);
  });

  test('price with commas parses correctly', () => {
    const ctx = makeContext();
    const { normalized } = validateRow(validRow({ price: '2,350.00' }), 2, ctx);
    expect(normalized.price).toBe(2350);
  });

  test('blank cell sentinel "nan" is treated as missing', () => {
    const ctx = makeContext();
    const { errors } = validateRow(validRow({ name: 'nan' }), 2, ctx);
    expect(errors.some(e => e.includes('Name'))).toBe(true);
  });
});

// ========================================
// Google Drive URL handling
// ========================================

describe('extractGoogleDriveFileId', () => {
  test('extracts from /file/d/ format', () => {
    expect(extractGoogleDriveFileId('https://drive.google.com/file/d/abc123/view?usp=sharing')).toBe('abc123');
  });

  test('extracts from open?id= format', () => {
    expect(extractGoogleDriveFileId('https://drive.google.com/open?id=xyz789')).toBe('xyz789');
  });

  test('extracts from uc?id= format', () => {
    expect(extractGoogleDriveFileId('https://drive.google.com/uc?id=def456')).toBe('def456');
  });

  test('returns null for non-Drive URL', () => {
    expect(extractGoogleDriveFileId('https://example.com/image.jpg')).toBeNull();
  });
});

describe('isGooglePhotosUrl', () => {
  test('detects photos.app.goo.gl', () => {
    expect(isGooglePhotosUrl('https://photos.app.goo.gl/abc123')).toBe(true);
  });

  test('detects photos.google.com', () => {
    expect(isGooglePhotosUrl('https://photos.google.com/share/abc')).toBe(true);
  });

  test('does not match normal URLs', () => {
    expect(isGooglePhotosUrl('https://example.com/photo.jpg')).toBe(false);
  });
});

// ========================================
// Spreadsheet Parsing (inline, no service import)
// ========================================

describe('parseSpreadsheet (via XLSX directly)', () => {
  function createTestXlsx(headers, rows) {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  // Replicate parseSpreadsheet logic locally for testing without Supabase dependency
  function parseSpreadsheet(buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer', raw: true });
    if (workbook.SheetNames.length === 0) throw new Error('No sheets');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
    if (rawData.length < 2) throw new Error('Spreadsheet must have a header row and at least one data row');
    const rawHeaders = rawData[0].map(h => h === null ? '' : String(h));
    const rows = rawData.slice(1).filter(row =>
      row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')
    );
    return { rawHeaders, rows };
  }

  test('parses valid spreadsheet', () => {
    const buf = createTestXlsx(['Name', 'SKU', 'Price'], [['Chair', 'CH-001', 100]]);
    const { rawHeaders, rows } = parseSpreadsheet(buf);
    expect(rawHeaders).toEqual(['Name', 'SKU', 'Price']);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual(['Chair', 'CH-001', 100]);
  });

  test('skips empty rows', () => {
    const buf = createTestXlsx(
      ['Name', 'SKU', 'Price'],
      [['Chair', 'CH-001', 100], [null, null, null], ['Desk', 'DK-001', 200]]
    );
    const { rows } = parseSpreadsheet(buf);
    expect(rows).toHaveLength(2);
  });

  test('throws for header-only spreadsheet', () => {
    const ws = XLSX.utils.aoa_to_sheet([['Name']]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    expect(() => parseSpreadsheet(buf)).toThrow('at least one data row');
  });
});

// ========================================
// Category Maps
// ========================================

describe('buildCategoryMaps', () => {
  test('maps categories case-insensitively', () => {
    const { categoryMap } = buildCategoryMaps(
      [{ id: '1', name: 'Chairs' }],
      []
    );
    expect(categoryMap.get('chairs')).toBe('1');
  });

  test('maps subcategories', () => {
    const { subcategoryMap } = buildCategoryMaps(
      [],
      [{ id: '1', name: 'Office chair', category_id: 'cat-1' }]
    );
    expect(subcategoryMap.get('office chair')).toBe('1');
  });
});
