import Button from "../ui/Button";

/**
 * NoCategorySelected Component
 * 
 * Displays a welcome screen when no category is selected, with options to:
 * - Create a new category
 * - Import categories from a JSON file
 * - Export categories to a JSON file
 * 
 * @param {Object} props
 * @param {Function} props.onAddClick - Handler for the "Add Category" button
 * @param {Function} props.onExportData - Handler for exporting data to JSON
 * @param {Function} props.onToggleImport - Handler for toggling the import interface
 * @param {boolean} props.isImporting - Whether the import interface is visible
 * @param {Function} props.onFileImport - Handler for the file input change event
 * @param {boolean} props.hasCategories - Whether there are any categories to export
 */
function NoCategorySelected({ 
  onAddClick, 
  onExportData, 
  onToggleImport, 
  isImporting, 
  onFileImport,
  hasCategories
}) {
  return (
    <div className="flex-1 p-8 bg-black">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold mb-4 text-white">
            No Category Selected
          </h2>
          <Button 
            variant="icon" 
            onClick={onAddClick}
            title="Add Category"
          >
            <span className="text-xl font-bold">+</span>
          </Button>
        </div>
        
        <p className="text-gray-400 mb-8">
          Select a category from the sidebar or create a new one to get started.
        </p>
        
      </div>
    </div>
  );
}

export default NoCategorySelected;