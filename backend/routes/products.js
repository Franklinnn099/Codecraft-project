const express = require('express');
const multer = require('multer');
const { processBatchImport, MAX_FILE_SIZE } = require('../services/batchImportService');

const router = express.Router();

// Multer config: store file in memory (no temp files), enforce size limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      // Some systems report CSV as these
      'application/csv',
      'text/plain',
      'application/octet-stream',
    ];
    const ext = file.originalname.toLowerCase().split('.').pop();
    const allowedExts = ['csv', 'xlsx', 'xls'];

    if (allowed.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype} (.${ext}). Accepted: CSV, XLSX, XLS`));
    }
  },
});

/**
 * POST /api/products/batch-import
 * Query params:
 *   ?validate=true  — validate only, do not import
 *
 * Body: multipart/form-data with field "file"
 *
 * Returns a structured JSON summary with row-level results.
 */
router.post('/batch-import', (req, res, next) => {
  // Wrap multer to catch its errors (file too large, bad type) cleanly
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
          });
        }
        return res.status(400).json({ success: false, error: err.message });
      }
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
}, async (req, res) => {
  const requestStart = Date.now();

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Send a CSV or Excel file as "file" in multipart/form-data.',
      });
    }

    const validateOnly = req.query.validate === 'true';

    console.log(`[BatchImport] ${validateOnly ? 'VALIDATE' : 'IMPORT'} - File: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)}KB)`);

    const result = await processBatchImport(
      req.file.buffer,
      req.file.originalname,
      validateOnly
    );

    // Audit log
    console.log(
      `[BatchImport] ${result.mode.toUpperCase()} complete - ` +
      `Total: ${result.totalRows}, Valid: ${result.validRows}, Invalid: ${result.invalidRows}, ` +
      `Imported: ${result.importedRows}, Failed: ${result.failedRows}, ` +
      `Duration: ${result.duration}ms`
    );

    const httpStatus = result.success ? 200 : (result.headerErrors?.length > 0 ? 400 : 200);
    return res.status(httpStatus).json(result);
  } catch (err) {
    console.error(`[BatchImport] ERROR - ${err.message}`);
    return res.status(500).json({
      success: false,
      error: err.message,
      duration: Date.now() - requestStart,
    });
  }
});

module.exports = router;
