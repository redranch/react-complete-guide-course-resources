import React, { useRef } from 'react';
import Button from '../ui/Button';

function ItemForm({ onAddItem }) {
  const itemInputRef = useRef(null);

  const handleSubmit = () => {
    if (!itemInputRef.current || !itemInputRef.current.value.trim()) return;
    onAddItem(itemInputRef.current.value.trim());
    itemInputRef.current.value = '';
  };

  return (
    <div className="mb-4 flex gap-2">
      <input
        type="text"
        ref={itemInputRef}
        placeholder="Add a new item..."
        className="flex-1 p-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSubmit();
          }
        }}
      />
      <Button
        variant="secondary"
        onClick={handleSubmit}
      >
        Add Item
      </Button>
    </div>
  );
}

export default ItemForm; 