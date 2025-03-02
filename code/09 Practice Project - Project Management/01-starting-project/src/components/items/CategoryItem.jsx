import React from 'react';

function CategoryItem({ item, onRemove }) {
  return (
    <li className="bg-black p-3 rounded text-gray-300 flex justify-between items-center">
      <span>{item.text}</span>
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