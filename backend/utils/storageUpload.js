// Wraps Supabase Storage uploads for the batch import pipeline.
// Reuses the existing 'product-images' bucket that AddProduct.jsx uses.

const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../supabaseClient');

const BUCKET_NAME = 'product-images';
const FOLDER = 'products';

/**
 * Upload an image buffer to Supabase Storage.
 * @param {Buffer} buffer - Raw image bytes
 * @param {string} extension - File extension (jpg, png, etc.)
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} Public URL of the uploaded image
 */
async function uploadImageBuffer(buffer, extension, contentType) {
  const fileName = `${uuidv4()}.${extension}`;
  const filePath = `${FOLDER}/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, buffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return data.publicUrl;
}

module.exports = { uploadImageBuffer };
