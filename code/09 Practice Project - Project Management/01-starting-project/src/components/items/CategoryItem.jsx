import React from 'react';

/**
 * CategoryItem Component
 * 
 * Renders a single item in a subcategory with a remove button.
 * 
 * @param {Object} props
 * @param {Object} props.item - The item object with text and id
 * @param {Function} props.onRemove - Function to call when the remove button is clicked
 * 
 * This component demonstrates:
 * - Simple presentational component pattern
 * - Event handling with callback props
 * - Destructuring props for cleaner code
 */
function CategoryItem({ item, onRemove }) {
  return (
    <li className="bg-black p-3 rounded text-gray-300 flex justify-between items-center">
      {/* Display the item text */}
      <span>{item.text}</span>
      
      {/* Remove button that calls the onRemove function with the item's id */}
      <button
        onClick={() => onRemove(item.id)}
        className="text-red-500 hover:text-red-700 text-sm"
      >
        Remove
      </button>
    </li>
  );
}

export default CategoryItem; 