import Button from "../ui/Button";

/**
 * CategoriesSidebar Component
 * 
 * Displays a sidebar with a list of categories and actions to manage them.
 * 
 * @param {Object} props
 * @param {Array} props.categories - Array of category objects to display
 * @param {Function} props.onAddClick - Handler for the "Add Category" button
 * @param {Function} props.onSelectCategory - Handler for when a category is clicked
 * @param {string|null} props.selectedCategoryId - ID of the currently selected category
 * @param {Function} props.onExportData - Handler for exporting data to JSON
 * @param {Function} props.onToggleImport - Handler for toggling the import interface
 */
function CategoriesSidebar({ 
  categories, 
  onAddClick, 
  onSelectCategory, 
  selectedCategoryId,
  onExportData,
  onToggleImport
}) {
  return (
    <aside className="w-72 bg-gray-900 p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Categories</h2>
        <Button 
          variant="icon" 
          onClick={onAddClick}
          title="Add Category"
        >
          <span className="text-xl font-bold">+</span>
        </Button>
      </div>
      
      {/* Categories List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {categories.length === 0 ? (
          <p className="text-gray-400 text-sm italic">
            No categories yet. Create one to get started.
          </p>
        ) : (
          <ul className="space-y-2">
            {categories.map((category) => (
              <li 
                key={category.id}
                className={`p-3 rounded cursor-pointer transition-colors ${
                  selectedCategoryId === category.id 
                    ? 'bg-red-900 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => onSelectCategory(category.id)}
              >
                <div className="font-medium">{category.title}</div>
                {category.dueDate && (
                  <div className="text-xs mt-1 opacity-80">
                    Due: {new Date(category.dueDate).toLocaleDateString()}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Data Management Section */}
      {(categories.length > 0 || onExportData) && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <h3 className="text-sm font-bold text-gray-400 mb-2">
            Data Management
          </h3>
          <div className="space-y-2">
            {categories.length > 0 && (
              <Button 
                variant="secondary" 
                onClick={onExportData}
                className="w-full text-sm py-1"
                size="small"
              >
                Export to JSON
              </Button>
            )}
            <Button 
              variant="secondary" 
              onClick={onToggleImport}
              className="w-full text-sm py-1"
              size="small"
            >
              Import from JSON
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}

export default CategoriesSidebar;
