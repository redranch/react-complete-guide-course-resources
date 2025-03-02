/**
 * Storage utility functions for persisting application state
 * 
 * These functions provide a simple interface for saving and loading
 * application state to/from localStorage, with JSON serialization.
 */

// Key used for storing the categories data in localStorage
const STORAGE_KEY = 'project_management_categories';

/**
 * Saves the categories data to localStorage
 * 
 * @param {Array} categories - Array of category objects to save
 * @returns {boolean} - Whether the save was successful
 */
export function saveCategories(categories) {
  try {
    const serializedData = JSON.stringify(categories);
    localStorage.setItem(STORAGE_KEY, serializedData);
    return true;
  } catch (error) {
    console.error('Error saving categories to localStorage:', error);
    return false;
  }
}

/**
 * Loads the categories data from localStorage
 * 
 * @returns {Array|null} - Array of category objects, or null if none found
 */
export function loadCategories() {
  try {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    if (!serializedData) return null;
    
    return JSON.parse(serializedData);
  } catch (error) {
    console.error('Error loading categories from localStorage:', error);
    return null;
  }
}

/**
 * Clears all saved categories data from localStorage
 * 
 * @returns {boolean} - Whether the clear was successful
 */
export function clearCategories() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing categories from localStorage:', error);
    return false;
  }
}

/**
 * Exports the categories data as a JSON file for download
 * 
 * @param {Array} categories - Array of category objects to export
 */
export function exportCategoriesToFile(categories) {
  try {
    const serializedData = JSON.stringify(categories, null, 2); // Pretty print with 2 spaces
    const blob = new Blob([serializedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a link element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project_categories.json';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting categories to file:', error);
  }
}

/**
 * Imports categories data from a JSON file
 * 
 * @param {File} file - The JSON file to import
 * @returns {Promise<Array>} - Promise resolving to the imported categories array
 */
export function importCategoriesFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const categories = JSON.parse(event.target.result);
        resolve(categories);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
} 