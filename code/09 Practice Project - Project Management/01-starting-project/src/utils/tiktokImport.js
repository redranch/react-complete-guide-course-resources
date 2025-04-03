/**
 * Utilities for handling TikTok favorites import and processing
 */

/**
 * Parse a TikTok favorites list from a text file
 * 
 * Supports two formats:
 * 1. Original format:
 *    Date: YYYY-MM-DD
 *    URL: https://www.tiktok.com/...
 * 
 * 2. User's format:
 *    Date: YYYY-MM-DD HH:MM:SS
 *    Link: https://www.tiktokv.com/...
 * 
 * (blank line between entries)
 * 
 * @param {string} fileContent - The content of the imported file
 * @returns {Array} - Array of parsed TikTok item objects
 */
export function parseTikTokList(fileContent) {
  // Split the content by double newlines to get individual entries
  const entries = fileContent.split(/\n\s*\n/);
  
  const parsedItems = entries
    .map(entry => {
      // Parse each entry to extract date and URL
      // Support both "Date:" and date-time format, and both "URL:" and "Link:"
      const dateMatch = entry.match(/Date:\s*(.+)/i);
      const urlMatch = entry.match(/URL:\s*(.+)/i) || entry.match(/Link:\s*(.+)/i);
      
      if (!dateMatch || !urlMatch) return null;
      
      const date = dateMatch[1].trim();
      const url = urlMatch[1].trim();
      
      return {
        id: crypto.randomUUID(),
        date,
        url,
        redirectUrl: null, // Store the redirect URL once resolved
        text: `TikTok: ${date}`, // Default text
        notes: "",
        categoryId: null,
        subcategoryId: null,
        nestedSubcategoryId: null
      };
    })
    .filter(item => item !== null); // Remove failed parses
  
  return parsedItems;
}

/**
 * Read a text file and return its content
 * 
 * @param {File} file - The file to read
 * @returns {Promise<string>} - Promise resolving to the file content
 */
export function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        resolve(event.target.result);
      } catch (error) {
        reject(new Error('Error parsing file content'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Load the TikTok items from localStorage
 * 
 * @returns {Array} - Array of TikTok items
 */
export function loadTikTokItems() {
  try {
    const data = localStorage.getItem('tiktok_favorites');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading TikTok items:', error);
    return [];
  }
}

/**
 * Save TikTok items to localStorage
 * 
 * @param {Array} items - Array of TikTok items to save
 */
export function saveTikTokItems(items) {
  try {
    localStorage.setItem('tiktok_favorites', JSON.stringify(items));
    return true;
  } catch (error) {
    console.error('Error saving TikTok items:', error);
    return false;
  }
}

/**
 * Categorize a TikTok item
 * 
 * @param {string} itemId - ID of the item to categorize
 * @param {string} categoryId - ID of the category
 * @param {string} subcategoryId - ID of the subcategory (optional)
 * @param {string} nestedSubcategoryId - ID of the nested subcategory (optional)
 * @param {Array} items - Current array of TikTok items
 * @returns {Array} - Updated array of TikTok items
 */
export function categorizeTikTokItem(itemId, categoryId, subcategoryId, nestedSubcategoryId, items) {
  return items.map(item => {
    if (item.id === itemId) {
      return {
        ...item,
        categoryId,
        subcategoryId,
        nestedSubcategoryId
      };
    }
    return item;
  });
}

/**
 * Update the notes for a TikTok item
 * 
 * @param {string} itemId - ID of the item to update
 * @param {string} notes - New notes content
 * @param {string} redirectUrl - New redirect URL (optional)
 * @param {Array} items - Current array of TikTok items
 * @returns {Array} - Updated array of TikTok items
 */
export function updateTikTokItemNotes(itemId, notes, redirectUrl, items) {
  return items.map(item => {
    if (item.id === itemId) {
      return {
        ...item,
        notes,
        // Only update redirectUrl if provided
        ...(redirectUrl !== undefined ? { redirectUrl } : {})
      };
    }
    return item;
  });
}

/**
 * Get all TikTok items assigned to a specific category
 * 
 * @param {string} categoryId - ID of the category
 * @param {string} subcategoryId - ID of the subcategory (optional)
 * @param {string} nestedSubcategoryId - ID of the nested subcategory (optional)
 * @param {Array} items - Array of all TikTok items
 * @returns {Array} - Filtered array of TikTok items
 */
export function getTikTokItemsByCategory(categoryId, subcategoryId, nestedSubcategoryId, items) {
  return items.filter(item => {
    if (nestedSubcategoryId) {
      return item.categoryId === categoryId && 
             item.subcategoryId === subcategoryId && 
             item.nestedSubcategoryId === nestedSubcategoryId;
    } else if (subcategoryId) {
      return item.categoryId === categoryId && 
             item.subcategoryId === subcategoryId;
    } else {
      return item.categoryId === categoryId;
    }
  });
}

/**
 * Get all uncategorized TikTok items
 * 
 * @param {Array} items - Array of all TikTok items
 * @returns {Array} - Array of uncategorized items
 */
export function getUncategorizedTikTokItems(items) {
  return items.filter(item => !item.categoryId);
}

/**
 * Update the redirect URL for a TikTok item
 * 
 * @param {string} itemId - ID of the item to update
 * @param {string} redirectUrl - The redirect URL to save
 * @param {Array} items - Current array of TikTok items
 * @returns {Array} - Updated array of TikTok items
 */
export function updateTikTokItemRedirectUrl(itemId, redirectUrl, items) {
  return items.map(item => {
    if (item.id === itemId) {
      return {
        ...item,
        redirectUrl
      };
    }
    return item;
  });
} 