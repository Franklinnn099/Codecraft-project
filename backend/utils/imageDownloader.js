// Downloads images from URLs (including Google Drive share links) and
// returns the raw buffer + detected content type for storage upload.

const https = require('https');
const http = require('http');
const { URL } = require('url');

const IMAGE_CONTENT_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff'
]);

const CONTENT_TYPE_TO_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/bmp': 'bmp',
  'image/tiff': 'tiff',
};

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB per image
const DOWNLOAD_TIMEOUT = 15000; // 15 seconds

/**
 * Extract Google Drive file ID from various share link formats.
 * Returns null if the URL is not a recognized Google Drive link.
 */
function extractGoogleDriveFileId(url) {
  const patterns = [
    // https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    // https://drive.google.com/open?id=FILE_ID
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    // https://drive.google.com/uc?id=FILE_ID
    /drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/,
    // https://drive.google.com/uc?export=download&id=FILE_ID
    /drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Convert a Google Drive file ID to a direct download URL.
 */
function googleDriveDownloadUrl(fileId) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Check if a URL is a Google Drive link.
 */
function isGoogleDriveUrl(url) {
  return /drive\.google\.com/.test(url);
}

// Google Photos links are NOT reliably downloadable server-side.
// The sharing URLs go through authentication/redirect layers that
// require browser cookies. We detect and skip them with a clear message.
function isGooglePhotosUrl(url) {
  return /photos\.google\.com|photos\.app\.goo\.gl|lh3\.googleusercontent\.com/.test(url);
}

/**
 * Download an image from a URL. Follows up to 5 redirects.
 * Returns { buffer, contentType, extension } or throws.
 */
function downloadImage(url, redirectCount = 0) {
  const MAX_REDIRECTS = 5;

  return new Promise((resolve, reject) => {
    if (redirectCount > MAX_REDIRECTS) {
      return reject(new Error('Too many redirects'));
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return reject(new Error(`Invalid URL: ${url}`));
    }

    const transport = parsedUrl.protocol === 'https:' ? https : http;
    const req = transport.get(url, { timeout: DOWNLOAD_TIMEOUT, headers: { 'User-Agent': 'ExpertOfficeFurnish-Importer/1.0' } }, (res) => {
      // Follow redirects
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        res.resume(); // drain the response
        return resolve(downloadImage(res.headers.location, redirectCount + 1));
      }

      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} downloading image`));
      }

      const contentType = (res.headers['content-type'] || '').split(';')[0].trim().toLowerCase();

      const chunks = [];
      let totalSize = 0;

      res.on('data', (chunk) => {
        totalSize += chunk.length;
        if (totalSize > MAX_IMAGE_SIZE) {
          res.destroy();
          return reject(new Error(`Image exceeds ${MAX_IMAGE_SIZE / 1024 / 1024}MB limit`));
        }
        chunks.push(chunk);
      });

      res.on('end', () => {
        const buffer = Buffer.concat(chunks);

        if (!IMAGE_CONTENT_TYPES.has(contentType)) {
          // Try to detect from first bytes (magic numbers) if content-type is unreliable
          const detected = detectImageType(buffer);
          if (!detected) {
            return reject(new Error(`Not an image (content-type: ${contentType})`));
          }
          return resolve({
            buffer,
            contentType: detected.contentType,
            extension: detected.extension,
          });
        }

        const extension = CONTENT_TYPE_TO_EXT[contentType] || 'jpg';
        resolve({ buffer, contentType, extension });
      });

      res.on('error', reject);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Download timed out after ${DOWNLOAD_TIMEOUT / 1000}s`));
    });

    req.on('error', reject);
  });
}

// Detect image type from magic bytes as fallback
function detectImageType(buffer) {
  if (buffer.length < 4) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { contentType: 'image/jpeg', extension: 'jpg' };
  }
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { contentType: 'image/png', extension: 'png' };
  }
  // GIF: 47 49 46 38
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
    return { contentType: 'image/gif', extension: 'gif' };
  }
  // WebP: 52 49 46 46 ... 57 45 42 50
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 && buffer.length > 11 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    return { contentType: 'image/webp', extension: 'webp' };
  }

  return null;
}

/**
 * Process an image URL: resolve Google Drive links, download, validate content.
 * Returns { buffer, contentType, extension } or { error }.
 */
async function processImageUrl(url) {
  try {
    // Google Photos: unsupported — explain why
    if (isGooglePhotosUrl(url)) {
      return {
        error: `Google Photos URLs are not supported for server-side download. ` +
               `Upload images to Google Drive (with public sharing) or use direct image URLs instead.`
      };
    }

    let downloadUrl = url;

    // Google Drive: extract file ID and build direct download URL
    if (isGoogleDriveUrl(url)) {
      const fileId = extractGoogleDriveFileId(url);
      if (!fileId) {
        return { error: `Could not extract file ID from Google Drive URL: ${url}` };
      }
      downloadUrl = googleDriveDownloadUrl(fileId);
    }

    const result = await downloadImage(downloadUrl);
    return result;
  } catch (err) {
    return { error: err.message };
  }
}

module.exports = {
  processImageUrl,
  downloadImage,
  extractGoogleDriveFileId,
  isGoogleDriveUrl,
  isGooglePhotosUrl,
  isValidImageContentType: (ct) => IMAGE_CONTENT_TYPES.has(ct),
};
