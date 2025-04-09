/**
 * Converts a string to a URL-friendly slug
 * @param {string} text - The text to convert to a slug
 * @returns {string} - The URL-friendly slug
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

/**
 * Generates a unique slug for a product
 * @param {string} name - The product name
 * @param {string} id - The product ID (optional)
 * @returns {string} - A unique slug
 */
function generateUniqueSlug(name, id = '') {
  const baseSlug = slugify(name);
  return id ? `${baseSlug}-${id.substring(0, 6)}` : baseSlug;
}

module.exports = {
  slugify,
  generateUniqueSlug
}; 