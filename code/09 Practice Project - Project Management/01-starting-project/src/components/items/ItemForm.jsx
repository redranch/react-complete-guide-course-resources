import React, { useRef } from 'react';
import Button from '../ui/Button';

/**
 * ItemForm Component
 * 
 * A form for adding new items to a subcategory.
 * 
 * @param {Object} props
 * @param {Function} props.onAddItem - Function to call when an item is added
 * 
 * This component demonstrates:
 * - Using refs to access DOM elements directly
 * - Handling form submission via button click and Enter key
 * - Validating input before submission
 * - Clearing input after submission
 */
function ItemForm({ onAddItem }) {
  /**
   * useRef hook creates a mutable reference object that persists across renders
   * 
   * Unlike state, changing a ref doesn't trigger a re-render
   * This makes refs ideal for:
   * - Accessing DOM elements directly
   * - Storing values that don't affect rendering
   * 
   * Here, itemInputRef will be attached to the input element
   * so we can access its value and clear it programmatically
   */
  const itemInputRef = useRef(null);

  /**
   * Handles the submission of a new item
   * 
   * This function:
   * 1. Validates that the input exists and isn't empty
   * 2. Calls the parent's onAddItem function with the trimmed text
   * 3. Clears the input field for the next item
   */
  const handleSubmit = () => {
    // Validation: Check if input exists and has content
    if (!itemInputRef.current || !itemInputRef.current.value.trim()) return;
    
    // Call the parent's function with the trimmed input value
    onAddItem(itemInputRef.current.value.trim());
    
    // Clear the input field for the next item
    itemInputRef.current.value = '';
  };

  return (
    <div className="mb-4 flex gap-2">
      <input
        type="text"
        ref={itemInputRef} // Attach the ref to this input element
        placeholder="Add a new item..."
        className="flex-1 p-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        onKeyDown={(e) => {
          // Allow submission with the Enter key for better UX
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