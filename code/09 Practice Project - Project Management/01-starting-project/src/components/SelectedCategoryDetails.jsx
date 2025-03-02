import Button from "./Button";
import { useState, useEffect, useRef } from "react";

function SelectedCategoryDetails({ category, onBackClick, onDelete, onEdit, onUpdateItems }) {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [dueDate, setDueDate] = useState(category.dueDate);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedNestedSubcategory, setSelectedNestedSubcategory] = useState(null);
  const [updatedCategory, setUpdatedCategory] = useState(category);
  const itemInputRef = useRef(null);
  
  const formattedDate = new Date(dueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Update local state when category prop changes
  useEffect(() => {
    setUpdatedCategory(category);
    setDueDate(category.dueDate);
  }, [category]);

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
  
  // Reset selected subcategories when category changes
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
  
  // Reset nested subcategory when parent subcategory changes
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

  // Function to add an item to the selected subcategory or nested subcategory
  function handleAddItem() {
    if (!itemInputRef.current || !itemInputRef.current.value.trim()) return;
    
    const itemText = itemInputRef.current.value.trim();
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
    
    // Clear the input
    itemInputRef.current.value = '';
    
    // Update the parent component
    onUpdateItems(updatedCategoryData);
  }
  
  // Function to remove an item
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

  // Determine which content to display based on selections
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
        
        <div className="mb-6 p-4 rounded bg-gray-900 border-l-4 border-red-800">
          <h2 className="text-xl mb-2 text-white">Description</h2>
          <p className="text-gray-300 bg-black p-3 rounded">{updatedCategory.description}</p>
        </div>
        
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
            <div className="flex border-b border-gray-800 mb-4 overflow-x-auto scrollbar-thin pb-1">
              {updatedCategory.subcategories.map(subcategory => (
                <button
                  key={subcategory.id}
                  onClick={() => setSelectedSubcategory(subcategory)}
                  className={`py-2 px-4 mr-2 rounded-t-lg transition-colors flex-shrink-0 ${
                    selectedSubcategory?.id === subcategory.id
                      ? 'bg-red-900 text-white font-medium'
                      : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  {subcategory.name}
                </button>
              ))}
            </div>
            
            {/* Nested Subcategory Tabs (only if selected subcategory has nested subcategories) */}
            {selectedSubcategory && selectedSubcategory.subcategories && selectedSubcategory.subcategories.length > 0 && (
              <div className="flex border-b border-gray-800 mb-4 pl-4 overflow-x-auto scrollbar-thin pb-1">
                {selectedSubcategory.subcategories.map(nestedSub => (
                  <button
                    key={nestedSub.id}
                    onClick={() => setSelectedNestedSubcategory(nestedSub)}
                    className={`py-1 px-3 mr-2 rounded-t-lg transition-colors text-sm flex-shrink-0 ${
                      selectedNestedSubcategory?.id === nestedSub.id
                        ? 'bg-red-800 text-white font-medium'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {nestedSub.name}
                  </button>
                ))}
              </div>
            )}
            
            {/* Content Display */}
            {contentToDisplay ? (
              <div className="bg-gray-900 p-4 rounded">
                {/* Item Input Form */}
                <div className="mb-4 flex gap-2">
                  <input
                    type="text"
                    ref={itemInputRef}
                    placeholder="Add a new item..."
                    className="flex-1 p-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddItem();
                      }
                    }}
                  />
                  <Button
                    variant="secondary"
                    onClick={handleAddItem}
                  >
                    Add Item
                  </Button>
                </div>
                
                {contentToDisplay.items.length > 0 ? (
                  <ul className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
                    {contentToDisplay.items.map(item => (
                      <li key={item.id} className="bg-black p-3 rounded text-gray-300 flex justify-between items-center">
                        <span>{item.text}</span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic bg-black p-3 rounded">
                    No items in this {selectedNestedSubcategory ? "nested subcategory" : "subcategory"} yet. 
                    Add items using the form above.
                  </p>
                )}
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