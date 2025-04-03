import Button from "../ui/Button";
import TikTokManager from "../tiktok/TikTokManager";
import { useState } from "react";

/**
 * NoCategorySelected Component
 * 
 * Displays a welcome screen when no category is selected, with options to:
 * - Create a new category
 * - Import categories from a JSON file
 * - Export categories to a JSON file
 * - Manage TikTok favorites
 * 
 * @param {Object} props
 * @param {Function} props.onAddClick - Handler for the "Add Category" button
 * @param {Function} props.onExportData - Handler for exporting data to JSON
 * @param {Function} props.onToggleImport - Handler for toggling the import interface
 * @param {boolean} props.isImporting - Whether the import interface is visible
 * @param {Function} props.onFileImport - Handler for the file input change event
 * @param {boolean} props.hasCategories - Whether there are any categories to export
 * @param {Array} props.categories - Available categories for TikTok classification
 * @param {Function} props.onCreateCategory - Handler for creating a new category
 */
function NoCategorySelected({ 
  onAddClick, 
  onExportData, 
  onToggleImport, 
  isImporting, 
  onFileImport,   
  hasCategories,
  categories,
  onCreateCategory
}) {
  const [activeTab, setActiveTab] = useState('welcome'); // 'welcome' or 'tiktok'
  
  return (
    <div className="flex-1 p-8 bg-black overflow-y-auto scrollbar-thin">
      {/* Tabs */}
      <div className="w-full max-w-4xl mx-auto mb-6 border-b border-gray-800">
        <div className="flex gap-4">
          <TabButton 
            isActive={activeTab === 'welcome'} 
            onClick={() => setActiveTab('welcome')}
          >
            Welcome
          </TabButton>
          <TabButton 
            isActive={activeTab === 'tiktok'} 
            onClick={() => setActiveTab('tiktok')}
          >
            TikTok Favorites
          </TabButton>
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'welcome' ? (
        <WelcomeTab 
          onAddClick={onAddClick}
          onExportData={onExportData}
          onToggleImport={onToggleImport}
          isImporting={isImporting}
          onFileImport={onFileImport}
          hasCategories={hasCategories}
        />
      ) : (
        <TikTokManager 
          categories={categories} 
          onCreateCategory={onCreateCategory}
        />
      )}
    </div>
  );
}

/**
 * TabButton Component
 * 
 * A styled button for tabs in the NoCategorySelected component.
 */
function TabButton({ isActive, onClick, children }) {
  return (
    <button
      className={`px-4 py-2 font-medium transition-colors ${
        isActive 
          ? 'text-white border-b-2 border-red-800' 
          : 'text-gray-400 hover:text-gray-300'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/**
 * WelcomeTab Component
 * 
 * The default welcome content with category management options.
 */
function WelcomeTab({
  onAddClick,
  onExportData,
  onToggleImport,
  isImporting,
  onFileImport,
  hasCategories
}) {
    return (
    <div className="w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">
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
    );
}

export default NoCategorySelected;