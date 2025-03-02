import React from 'react';

function SubcategoryTabs({ 
  subcategories, 
  selectedId, 
  onSelect, 
  isNested = false 
}) {
  const baseClasses = "flex border-b border-gray-800 mb-4 overflow-x-auto scrollbar-thin pb-1";
  const nestedClasses = isNested ? "pl-4" : "";
  
  const buttonBaseClasses = "py-2 px-4 mr-2 rounded-t-lg transition-colors flex-shrink-0";
  const buttonActiveClasses = isNested 
    ? "bg-red-800 text-white font-medium" 
    : "bg-red-900 text-white font-medium";
  const buttonInactiveClasses = isNested
    ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
    : "bg-gray-900 text-gray-400 hover:bg-gray-800";
  
  // Adjust button size for nested tabs
  const buttonSizeClasses = isNested ? "py-1 px-3 text-sm" : "";
  
  return (
    <div className={`${baseClasses} ${nestedClasses}`}>
      {subcategories.map(subcategory => (
        <button
          key={subcategory.id}
          onClick={() => onSelect(subcategory)}
          className={`
            ${buttonBaseClasses} 
            ${buttonSizeClasses}
            ${selectedId === subcategory.id ? buttonActiveClasses : buttonInactiveClasses}
          `}
        >
          {subcategory.name}
        </button>
      ))}
    </div>
  );
}

export default SubcategoryTabs; 