import Button from "./Button";
import { useState, useEffect } from "react";

function SelectedCategoryDetails({ category, onBackClick, onDelete, onEdit }) {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [dueDate, setDueDate] = useState(category.dueDate);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedNestedSubcategory, setSelectedNestedSubcategory] = useState(null);
  
  const formattedDate = new Date(dueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  function handleDateChange(e) {
    setDueDate(e.target.value);
    // Here you would typically update the category in the parent component
    // For example: onUpdateCategory({ ...category, dueDate: e.target.value });
    setIsEditingDate(false);
  }
  
  // Reset selected subcategories when category changes
  useEffect(() => {
    // Reset main subcategory selection when category changes
    if (!category.subcategories?.find(sub => sub.id === selectedSubcategory?.id)) {
      setSelectedSubcategory(null);
      setSelectedNestedSubcategory(null);
    }
    // If category has subcategories but none is selected, select the first one
    else if (category.subcategories?.length > 0 && !selectedSubcategory) {
      setSelectedSubcategory(category.subcategories[0]);
    }
  }, [category, selectedSubcategory]);
  
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
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white font-sans">
            {category.title}
          </h1>
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              onClick={() => onEdit(category)}
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
          <p className="text-gray-300 bg-black p-3 rounded">{category.description}</p>
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
        {category.subcategories && category.subcategories.length > 0 ? (
          <div className="mt-6">
            <h2 className="text-xl mb-4 text-white">Subcategories</h2>
            
            {/* Main Subcategory Tabs */}
            <div className="flex border-b border-gray-800 mb-4 overflow-x-auto pb-1">
              {category.subcategories.map(subcategory => (
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
              <div className="flex border-b border-gray-800 mb-4 pl-4 overflow-x-auto pb-1">
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
                <h3 className="text-lg font-medium mb-3 text-white">{contentToDisplay.title}</h3>
                
                {contentToDisplay.items.length > 0 ? (
                  <ul className="space-y-2">
                    {contentToDisplay.items.map(item => (
                      <li key={item.id} className="bg-black p-3 rounded text-gray-300">
                        {item.text}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic bg-black p-3 rounded">
                    No items in this {selectedNestedSubcategory ? "nested subcategory" : "subcategory"} yet. 
                    Edit the category to add items.
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