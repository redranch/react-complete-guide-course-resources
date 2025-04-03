import React from 'react';
import Button from '../ui/Button';
import { suggestCategory } from '../../utils/categorySuggestions';

/**
 * CategorySuggestions Component
 * 
 * Displays and manages category suggestions for TikTok videos
 * 
 * @param {Object} props
 * @param {Object} props.item - The TikTok item to suggest categories for
 * @param {Array} props.categories - Available categories
 * @param {Function} props.onApplySuggestion - Handler for applying a suggestion
 * @param {Function} props.onCreateCategory - Handler for creating a new category
 */
function CategorySuggestions({ 
  item, 
  categories, 
  onApplySuggestion,
  onCreateCategory 
}) {
  // Get suggestion for this item
  const suggestedCategory = suggestCategory(item, categories);
  
  if (!suggestedCategory || item.categoryId) {
    return null;
  }

  return (
    <div className="mb-4">
      {/* Suggested Category Badge */}
      <div className="mb-2 flex items-center justify-between">
        <div className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
          suggestedCategory.isNewCategory 
            ? 'bg-green-900 text-green-200' 
            : 'bg-blue-900 text-blue-200'
        }`}>
          <span>
            {suggestedCategory.isNewCategory 
              ? `Create: ${suggestedCategory.categoryTitle}` 
              : `Suggested: ${suggestedCategory.categoryTitle}`}
          </span>
          <span className="text-xs opacity-75 ml-1">
            ({suggestedCategory.confidence})
          </span>
        </div>
        
        <Button
          variant={suggestedCategory.isNewCategory ? "primary" : "secondary"}
          size="small"
          onClick={onApplySuggestion}
        >
          {suggestedCategory.isNewCategory ? "Create & Apply" : "Apply"}
        </Button>
      </div>
      
      {/* Suggestion Reason */}
      <div className={`p-2 rounded mb-3 text-xs ${
        suggestedCategory.isNewCategory 
          ? 'bg-green-900/30 text-green-200' 
          : 'bg-blue-900/30 text-blue-200'
      }`}>
        <p>
          <span className="font-medium">Why this suggestion:</span> {suggestedCategory.reason}
        </p>
        {suggestedCategory.isNewCategory && (
          <p className="mt-1 text-green-300">
            <span className="font-medium">New category will be created:</span> {suggestedCategory.categoryTitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default CategorySuggestions; 