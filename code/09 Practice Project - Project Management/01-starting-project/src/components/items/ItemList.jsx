import React from 'react';
import CategoryItem from './CategoryItem';

/**
 * ItemList Component
 * 
 * Renders a list of items for a subcategory, or a message if no items exist.
 * 
 * @param {Object} props
 * @param {Array} props.items - Array of item objects to display
 * @param {Function} props.onRemoveItem - Function to call when an item is removed
 * @param {boolean} props.isNested - Whether these items are in a nested subcategory
 * 
 * This component demonstrates:
 * - Conditional rendering based on data
 * - Component composition (using CategoryItem for each item)
 * - Passing callbacks down to child components
 */
function ItemList({ items, onRemoveItem, isNested }) {
  // If there are no items, show a helpful message
  if (items.length === 0) {
    return (
      <p className="text-gray-400 italic bg-black p-3 rounded">
        No items in this {isNested ? "nested subcategory" : "subcategory"} yet. 
        Add items using the form above.
      </p>
    );
  }

  // If there are items, render the list
  return (
    <ul className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
      {/* Map each item to a CategoryItem component */}
      {items.map(item => (
        <CategoryItem 
          key={item.id} // Key is required for efficient list rendering
          item={item} 
          onRemove={onRemoveItem} // Pass the remove function down to each item
        />
      ))}
    </ul>
  );
}

export default ItemList; 