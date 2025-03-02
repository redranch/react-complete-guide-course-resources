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
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black">
      <div className="w-full max-w-md text-center">
        <h2 className="text-3xl font-bold mb-4 text-white">
          No Category Selected
        </h2>
        <p className="text-gray-400 mb-8">
          Select a category from the sidebar or create a new one to get started.
        </p>
        
        <div className="space-y-4">
          <Button onClick={onAddClick} className="w-full">
            Add a New Category
          </Button>
          
          {/* Data Import/Export Section */}
          <div className="mt-8 pt-8 border-t border-gray-800">
            <h3 className="text-xl font-bold mb-4 text-white">
              Data Management
            </h3>
            
            {/* Import Interface */}
            <div className="mb-4">
              <Button 
                variant="secondary" 
                onClick={onToggleImport}
                className="w-full mb-2"
              >
                {isImporting ? 'Cancel Import' : 'Import from JSON'}
              </Button>
              
              {isImporting && (
                <div className="bg-gray-900 p-4 rounded mt-2">
                  <p className="text-gray-400 mb-2 text-sm">
                    Select a JSON file to import categories:
                  </p>
                  <input
                    type="file"
                    accept=".json"
                    onChange={onFileImport}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-red-900 file:text-white hover:file:bg-red-800"
                  />
                </div>
              )}
            </div>
            
            {/* Export Button - Only enabled if there are categories */}
            <Button 
              variant="secondary" 
              onClick={onExportData}
              disabled={!hasCategories}
              className={`w-full ${!hasCategories ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Export to JSON
            </Button>
            
            {!hasCategories && (
              <p className="text-gray-500 text-xs mt-2 italic">
                Add some categories first to enable export
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoCategorySelected;