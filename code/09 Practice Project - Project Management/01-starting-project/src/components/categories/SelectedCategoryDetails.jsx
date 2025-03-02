import Button from "../ui/Button";
import { useState, useEffect } from "react";
import ItemForm from "../items/ItemForm";
import ItemList from "../items/ItemList";
import SubcategoryTabs from "./SubcategoryTabs";

/**
 * SelectedCategoryDetails Component
 * 
 * Displays the details of a selected category, including:
 * - Title and description
 * - Due date (with editing capability)
 * - Subcategories and nested subcategories as tabs
 * - Items within the selected subcategory
 * - Form to add new items
 * 
 * @param {Object} props
 * @param {Object} props.category - The category object to display
 * @param {Function} props.onBackClick - Handler for the back button
 * @param {Function} props.onDelete - Handler for deleting the category
 * @param {Function} props.onEdit - Handler for editing the category
 * @param {Function} props.onUpdateItems - Handler for updating items in the category
 */
function SelectedCategoryDetails({ category, onBackClick, onDelete, onEdit, onUpdateItems }) {
  // State for managing the due date editing UI
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [dueDate, setDueDate] = useState(category.dueDate);
  
  // State for tracking selected subcategories
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedNestedSubcategory, setSelectedNestedSubcategory] = useState(null);
  
  // Local copy of the category that we can modify
  const [updatedCategory, setUpdatedCategory] = useState(category);
  
  // Format the date for display
  const formattedDate = new Date(dueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  /**
   * Effect: Update local state when the category prop changes
   * 
   * This ensures our component stays in sync with parent state.
   * Without this, if the category is updated elsewhere, our local
   * state would be out of date.
   */
  useEffect(() => {
    setUpdatedCategory(category);
    setDueDate(category.dueDate);
  }, [category]);

  /**
   * Handles changes to the due date
   * 
   * @param {Event} e - The change event from the date input
   * 
   * This function:
   * 1. Updates the local dueDate state
   * 2. Updates the local category copy
   * 3. Calls the parent's update function to persist changes
   * 4. Exits editing mode
   */
  function handleDateChange(e) {
    const newDate = e.target.value;
    setDueDate(newDate);
    
    // Update the category with the new date
    const updatedCategoryData = {
      ...updatedCategory,
      dueDate: newDate
    };
    
    setUpdatedCategory(updatedCategoryData);
    // Update the parent component
    onUpdateItems(updatedCategoryData);
    setIsEditingDate(false);
  }
  
  /**
   * Effect: Reset selected subcategories when category changes
   * 
   * This effect handles two scenarios:
   * 1. If the selected subcategory no longer exists, reset selections
   * 2. If no subcategory is selected but they exist, select the first one
   */
  useEffect(() => {
    // Reset main subcategory selection when category changes
    if (!updatedCategory.subcategories?.find(sub => sub.id === selectedSubcategory?.id)) {
      setSelectedSubcategory(null);
      setSelectedNestedSubcategory(null);
    }
    // If category has subcategories but none is selected, select the first one
    else if (updatedCategory.subcategories?.length > 0 && !selectedSubcategory) {
      setSelectedSubcategory(updatedCategory.subcategories[0]);
    }
  }, [updatedCategory, selectedSubcategory]);
  
  /**
   * Effect: Reset nested subcategory when parent subcategory changes
   * 
   * When a different main subcategory is selected:
   * 1. Clear any selected nested subcategory
   * 2. If the new subcategory has nested subcategories, select the first one
   */
  useEffect(() => {
    if (selectedSubcategory) {
      // Reset nested selection when parent changes
      setSelectedNestedSubcategory(null);
      
      // If parent has subcategories, select the first one
      if (selectedSubcategory.subcategories?.length > 0) {
        setSelectedNestedSubcategory(selectedSubcategory.subcategories[0]);
      }
    }
  }, [selectedSubcategory]);

  /**
   * Adds a new item to the selected subcategory or nested subcategory
   * 
   * @param {string} itemText - The text content of the new item
   * 
   * This function:
   * 1. Creates a new item object with a unique ID
   * 2. Determines where to add it (main or nested subcategory)
   * 3. Updates the local category state
   * 4. Updates references to selected subcategories
   * 5. Calls the parent's update function to persist changes
   */
  function handleAddItem(itemText) {
    const newItem = {
      id: crypto.randomUUID(),
      text: itemText
    };
    
    let newSubcategories;
    
    if (selectedNestedSubcategory) {
      // Add to nested subcategory
      newSubcategories = updatedCategory.subcategories.map(subcat => {
        if (subcat.id === selectedSubcategory.id) {
          const updatedNestedSubcategories = subcat.subcategories.map(nestedSub => {
            if (nestedSub.id === selectedNestedSubcategory.id) {
              return {
                ...nestedSub,
                items: [...(nestedSub.items || []), newItem]
              };
            }
            return nestedSub;
          });
          
          return {
            ...subcat,
            subcategories: updatedNestedSubcategories
          };
        }
        return subcat;
      });
    } else if (selectedSubcategory) {
      // Add to main subcategory
      newSubcategories = updatedCategory.subcategories.map(subcat => {
        if (subcat.id === selectedSubcategory.id) {
          return {
            ...subcat,
            items: [...(subcat.items || []), newItem]
          };
        }
        return subcat;
      });
    } else {
      return; // No subcategory selected
    }
    
    const updatedCategoryData = {
      ...updatedCategory,
      subcategories: newSubcategories
    };
    
    setUpdatedCategory(updatedCategoryData);
    
    // Update the selected subcategory and nested subcategory references
    const updatedSelectedSubcategory = updatedCategoryData.subcategories.find(
      sub => sub.id === selectedSubcategory.id
    );
    setSelectedSubcategory(updatedSelectedSubcategory);
    
    if (selectedNestedSubcategory) {
      const updatedNestedSubcategory = updatedSelectedSubcategory.subcategories.find(
        nestedSub => nestedSub.id === selectedNestedSubcategory.id
      );
      setSelectedNestedSubcategory(updatedNestedSubcategory);
    }
    
    // Update the parent component
    onUpdateItems(updatedCategoryData);
  }
  
  /**
   * Removes an item from the selected subcategory or nested subcategory
   * 
   * @param {string} itemId - The ID of the item to remove
   * 
   * This function:
   * 1. Determines where to remove from (main or nested subcategory)
   * 2. Filters out the item with the matching ID
   * 3. Updates the local category state
   * 4. Updates references to selected subcategories
   * 5. Calls the parent's update function to persist changes
   */
  function handleRemoveItem(itemId) {
    let newSubcategories;
    
    if (selectedNestedSubcategory) {
      // Remove from nested subcategory
      newSubcategories = updatedCategory.subcategories.map(subcat => {
        if (subcat.id === selectedSubcategory.id) {
          const updatedNestedSubcategories = subcat.subcategories.map(nestedSub => {
            if (nestedSub.id === selectedNestedSubcategory.id) {
              return {
                ...nestedSub,
                items: (nestedSub.items || []).filter(item => item.id !== itemId)
              };
            }
            return nestedSub;
          });
          
          return {
            ...subcat,
            subcategories: updatedNestedSubcategories
          };
        }
        return subcat;
      });
    } else if (selectedSubcategory) {
      // Remove from main subcategory
      newSubcategories = updatedCategory.subcategories.map(subcat => {
        if (subcat.id === selectedSubcategory.id) {
          return {
            ...subcat,
            items: (subcat.items || []).filter(item => item.id !== itemId)
          };
        }
        return subcat;
      });
    } else {
      return; // No subcategory selected
    }
    
    const updatedCategoryData = {
      ...updatedCategory,
      subcategories: newSubcategories
    };
    
    setUpdatedCategory(updatedCategoryData);
    
    // Update the selected subcategory and nested subcategory references
    const updatedSelectedSubcategory = updatedCategoryData.subcategories.find(
      sub => sub.id === selectedSubcategory.id
    );
    setSelectedSubcategory(updatedSelectedSubcategory);
    
    if (selectedNestedSubcategory) {
      const updatedNestedSubcategory = updatedSelectedSubcategory.subcategories.find(
        nestedSub => nestedSub.id === selectedNestedSubcategory.id
      );
      setSelectedNestedSubcategory(updatedNestedSubcategory);
    }
    
    // Update the parent component
    onUpdateItems(updatedCategoryData);
  }

  /**
   * Helper function to determine which content to display
   * 
   * This function returns an object with:
   * - title: The name of the selected subcategory
   * - items: The array of items in that subcategory
   * 
   * It prioritizes nested subcategories over main subcategories
   */
  const getContentToDisplay = () => {
    if (selectedNestedSubcategory) {
      // Show nested subcategory content
      return {
        title: selectedNestedSubcategory.name,
        items: selectedNestedSubcategory.items || []
      };
    } else if (selectedSubcategory) {
      // Show main subcategory content
      return {
        title: selectedSubcategory.name,
        items: selectedSubcategory.items || []
      };
    }
    return null;
  };
  
  const contentToDisplay = getContentToDisplay();

  return (
    <div className="flex-1 p-8 overflow-y-auto scrollbar-thin">
      <div className="w-full max-w-3xl">
        {/* Header with title and action buttons */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white font-sans">
            {updatedCategory.title}
          </h1>
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              onClick={() => onEdit(updatedCategory)}
            >
              Edit
            </Button>
            <Button 
              variant="secondary" 
              onClick={onDelete}
            >
              Delete
            </Button>
            <Button 
              variant="secondary" 
              onClick={onBackClick}
            >
              Back
            </Button>
          </div>
        </div>
        
        {/* Description section */}
        <div className="mb-6 p-4 rounded bg-gray-900 border-l-4 border-red-800">
          <h2 className="text-xl mb-2 text-white">Description</h2>
          <p className="text-gray-300 bg-black p-3 rounded">{updatedCategory.description}</p>
        </div>
        
        {/* Due date section with editable functionality */}
        <div className="p-4 rounded bg-gray-900 mb-6">
          <h2 className="text-xl mb-2 text-white">Due Date</h2>
          
          {isEditingDate ? (
            <div className="bg-black p-3 rounded">
              <input 
                type="date" 
                value={dueDate}
                onChange={handleDateChange}
                className="w-full p-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                autoFocus
              />
            </div>
          ) : (
            <p 
              className="text-red-700 font-bold bg-black p-3 rounded cursor-pointer hover:bg-gray-900 transition-colors"
              onClick={() => setIsEditingDate(true)}
              title="Click to edit date"
            >
              {formattedDate}
            </p>
          )}
        </div>
        
        {/* Subcategories Section */}
        {updatedCategory.subcategories && updatedCategory.subcategories.length > 0 ? (
          <div className="mt-6">
            <h2 className="text-xl mb-4 text-white">Subcategories</h2>
            
            {/* Main Subcategory Tabs */}
            <SubcategoryTabs 
              subcategories={updatedCategory.subcategories}
              selectedId={selectedSubcategory?.id}
              onSelect={setSelectedSubcategory}
            />
            
            {/* Nested Subcategory Tabs */}
            {selectedSubcategory && selectedSubcategory.subcategories && selectedSubcategory.subcategories.length > 0 && (
              <SubcategoryTabs 
                subcategories={selectedSubcategory.subcategories}
                selectedId={selectedNestedSubcategory?.id}
                onSelect={setSelectedNestedSubcategory}
                isNested={true}
              />
            )}
            
            {/* Content Display */}
            {contentToDisplay ? (
              <div className="bg-gray-900 p-4 rounded">
                {/* Item Input Form */}
                <ItemForm onAddItem={handleAddItem} />
                
                {/* Items List */}
                <ItemList 
                  items={contentToDisplay.items} 
                  onRemoveItem={handleRemoveItem}
                  isNested={!!selectedNestedSubcategory}
                />
              </div>
            ) : (
              <p className="text-gray-400 italic bg-gray-900 p-4 rounded">
                Select a subcategory to view its contents
              </p>
            )}
          </div>
        ) : (
          <div className="mt-6 bg-gray-900 p-4 rounded">
            <p className="text-gray-400 italic">
              No subcategories available. Edit this category to add subcategories.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SelectedCategoryDetails; 