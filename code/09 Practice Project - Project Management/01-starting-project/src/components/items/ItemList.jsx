import React from 'react';
import CategoryItem from './CategoryItem';

function ItemList({ items, onRemoveItem, isNested }) {
  if (items.length === 0) {
    return (
      <p className="text-gray-400 italic bg-black p-3 rounded">
        No items in this {isNested ? "nested subcategory" : "subcategory"} yet. 
        Add items using the form above.
      </p>
    );
  }

  return (
    <ul className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
      {items.map(item => (
        <CategoryItem 
          key={item.id} 
          item={item} 
          onRemove={onRemoveItem} 
        />
      ))}
    </ul>
  );
}

export default ItemList; 