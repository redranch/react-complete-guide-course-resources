import Button from "./Button";
import { useState } from "react";

function SelectedCategoryDetails({ category, onBackClick, onDelete, onEdit }) {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [dueDate, setDueDate] = useState(category.dueDate);
  
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

  return (
    <div className="flex-1 p-8">
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
        
        <div className="p-4 rounded bg-gray-900">
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
      </div>
    </div>
  );
}

export default SelectedCategoryDetails; 