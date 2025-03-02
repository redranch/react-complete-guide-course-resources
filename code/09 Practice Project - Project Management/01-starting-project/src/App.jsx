import CategoriesSidebar from "./components/layout/CategoriesSidebar";
import NoCategorySelected from "./components/layout/NoCategorySelected";
import { useState, useEffect } from "react";
import NewEditCategory from "./components/categories/NewEditCategory";
import SelectedCategoryDetails from "./components/categories/SelectedCategoryDetails";
import { saveCategories, loadCategories, exportCategoriesToFile, importCategoriesFromFile } from "./utils/storage";

function App() {
  /**
   * Main application state using the useState hook
   * 
   * This single state object contains:
   * - isCreating: Boolean flag to show/hide the category creation form
   * - categories: Array of all category objects in the application
   * - selectedCategoryId: ID of the currently selected category (or null if none selected)
   * - categoryToEdit: The category object being edited (or null if not editing)
   * - isImporting: Boolean flag to show/hide the file import input
   * 
   * Using a single state object allows us to update multiple related values at once
   */
  const [categoryState, setCategoryState] = useState({
    isCreating: false,
    categories: [],
    selectedCategoryId: null,
    categoryToEdit: null,
    isImporting: false
  });

  /**
   * Effect hook to load categories from localStorage when the app starts
   * 
   * This runs once when the component mounts (empty dependency array)
   * and loads any previously saved categories from localStorage
   */
  useEffect(() => {
    const savedCategories = loadCategories();
    if (savedCategories && savedCategories.length > 0) {
      setCategoryState(prev => ({
        ...prev,
        categories: savedCategories
      }));
    }
  }, []);

  /**
   * Effect hook to save categories to localStorage whenever they change
   * 
   * This runs whenever the categories array changes, ensuring
   * that the localStorage is always up-to-date with the latest data
   */
  useEffect(() => {
    // Only save if we have categories and they've been initialized
    if (categoryState.categories.length > 0) {
      saveCategories(categoryState.categories);
    }
  }, [categoryState.categories]);

  /**
   * Shows the category creation form
   * 
   * This function updates the state to:
   * 1. Set isCreating to true (shows the form)
   * 2. Clear any selected category (prevents confusion)
   * 
   * The spread operator (...prev) copies all existing state values
   * before overriding specific properties
   */
  function handleShowCategoryForm() {
    setCategoryState(prev => ({
      ...prev,
      isCreating: true,
      selectedCategoryId: null
    }));
  }

  /**
   * Adds a new category to the application state
   * 
   * @param {Object} newCategory - The category object to add
   * 
   * This function:
   * 1. Generates a unique ID for the category
   * 2. Adds it to the categories array
   * 3. Selects the new category automatically
   * 4. Exits creation mode
   */
  function handleAddCategory(newCategory) {
    newCategory.id = crypto.randomUUID();
    setCategoryState(prev => ({
      isCreating: false,
      categories: [...prev.categories, newCategory],
      selectedCategoryId: newCategory.id // Automatically select the new category
    }));
  }

  /**
   * Cancels category creation and returns to the main view
   * 
   * This simply sets isCreating to false while preserving all other state
   */
  function handleCancelAddCategory() {
    setCategoryState(prev => ({
      ...prev,
      isCreating: false,
    }));
  }

  /**
   * Selects a category when clicked in the sidebar
   * 
   * @param {string} categoryId - The ID of the category to select
   * 
   * This function:
   * 1. Updates the selectedCategoryId
   * 2. Ensures we're not in creation mode
   */
  function handleSelectCategory(categoryId) {
    setCategoryState(prev => ({
      ...prev,
      selectedCategoryId: categoryId,
      isCreating: false
    }));
  }

  /**
   * Returns to the overview/welcome screen
   * 
   * This clears the selected category ID, showing the NoCategorySelected component
   */
  function handleBackToOverview() {
    setCategoryState(prev => ({
      ...prev,
      selectedCategoryId: null
    }));
  }

  /**
   * Deletes the currently selected category
   * 
   * This function:
   * 1. Filters out the category with the matching ID
   * 2. Clears the selected category ID (returns to overview)
   */
  function handleDeleteCategory() {
    setCategoryState(prev => ({
      ...prev,
      selectedCategoryId: null,
      categories: prev.categories.filter(category => category.id !== categoryState.selectedCategoryId)
    }));
  }
  
  /**
   * Initiates category editing by setting the categoryToEdit state
   * 
   * @param {Object} category - The category object to edit
   * 
   * This opens the modal with the edit form
   */
  function handleEditCategory(category) {
    setCategoryState(prev => ({
      ...prev,
      categoryToEdit: category
    }));
  }
  
  /**
   * Saves changes to an edited category
   * 
   * @param {Object} updatedCategory - The modified category object
   * 
   * This function:
   * 1. Finds and replaces the category in the array
   * 2. Closes the edit modal
   * 3. Ensures we're still viewing the updated category
   */
  function handleUpdateCategory(updatedCategory) {
    setCategoryState(prev => ({
      ...prev,
      categoryToEdit: null,
      categories: prev.categories.map(category => 
        category.id === updatedCategory.id ? updatedCategory : category
      ),
      // Ensure we're still viewing the updated category
      selectedCategoryId: updatedCategory.id
    }));
  }
  
  /**
   * Cancels category editing and closes the modal
   */
  function handleCancelEditCategory() {
    setCategoryState(prev => ({
      ...prev,
      categoryToEdit: null
    }));
  }
  
  /**
   * Updates a category when items are added or removed
   * 
   * @param {Object} updatedCategory - The category with modified items
   * 
   * This function is passed down to the SelectedCategoryDetails component
   * to allow updating the parent state when items change
   */
  function handleUpdateCategoryItems(updatedCategory) {
    setCategoryState(prev => ({
      ...prev,
      categories: prev.categories.map(category => 
        category.id === updatedCategory.id ? updatedCategory : category
      )
    }));
  }

  /**
   * Exports the current categories to a JSON file
   * 
   * This uses the exportCategoriesToFile utility function to
   * create and download a JSON file with the current categories data
   */
  function handleExportData() {
    exportCategoriesToFile(categoryState.categories);
  }

  /**
   * Toggles the file import interface
   */
  function handleToggleImport() {
    setCategoryState(prev => ({
      ...prev,
      isImporting: !prev.isImporting
    }));
  }

  /**
   * Handles the file selection for importing categories
   * 
   * @param {Event} event - The file input change event
   */
  async function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const importedCategories = await importCategoriesFromFile(file);
      
      // Ensure each category has a valid ID
      const processedCategories = importedCategories.map(category => {
        if (!category.id) {
          return { ...category, id: crypto.randomUUID() };
        }
        return category;
      });

      setCategoryState(prev => ({
        ...prev,
        categories: processedCategories,
        isImporting: false,
        selectedCategoryId: null
      }));
    } catch (error) {
      alert(`Error importing file: ${error.message}`);
    }
    
    // Reset the file input
    event.target.value = null;
  }

  // Find the selected category object from the array using its ID
  const selectedCategory = categoryState.categories.find(
    category => category.id === categoryState.selectedCategoryId
  );

  /**
   * Conditional rendering logic to determine what to show in the main content area
   * 
   * Three possible states:
   * 1. Creating a new category (isCreating is true)
   * 2. Viewing a selected category (selectedCategory exists)
   * 3. No category selected (default welcome screen)
   */
  let mainContent;
  if (categoryState.isCreating) {
    mainContent = (
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-white sticky top-0 bg-black py-2 z-10">
            New Category
          </h2>
          <NewEditCategory onCancel={handleCancelAddCategory} onSave={handleAddCategory} />
        </div>
      </div>
    );
  } else if (selectedCategory) {
    mainContent = (
      <SelectedCategoryDetails 
        category={selectedCategory} 
        onBackClick={handleBackToOverview} 
        onDelete={handleDeleteCategory}
        onEdit={handleEditCategory}
        onUpdateItems={handleUpdateCategoryItems}
      />
    );
  } else {
    mainContent = (
      <NoCategorySelected 
        onAddClick={handleShowCategoryForm} 
        onExportData={handleExportData}
        onToggleImport={handleToggleImport}
        isImporting={categoryState.isImporting}
        onFileImport={handleFileImport}
        hasCategories={categoryState.categories.length > 0}
      />
    );
  }

  return (
    <>
      <main className="h-screen flex bg-black text-gray-100">
        <CategoriesSidebar 
          onAddClick={handleShowCategoryForm} 
          categories={categoryState.categories} 
          onSelectCategory={handleSelectCategory}
          selectedCategoryId={categoryState.selectedCategoryId}
          onExportData={handleExportData}
          onToggleImport={handleToggleImport}
        />
        {mainContent}
      </main>
      
      {/* Modal for editing categories - only rendered when categoryToEdit exists */}
      {categoryState.categoryToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-10 overflow-y-auto py-8">
          <div className="bg-gray-900 p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <h2 className="text-2xl font-bold mb-6 text-white sticky top-0 bg-gray-900 py-2 z-10">Edit Category</h2>
            <NewEditCategory 
              initialData={categoryState.categoryToEdit}
              onCancel={handleCancelEditCategory} 
              onSave={handleUpdateCategory} 
              isEditing={true}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default App;

// How It Works:
// When you click on a category in the sidebar:
// The onSelectCategory function is called with the category ID
// This updates the selectedCategoryId in the state
// The App component finds the selected category object
// The CategoryDetails component is rendered with the selected category data
// When you click the "Back" button in the category details:
// The handleBackToOverview function is called
// This clears the selectedCategoryId in the state
// The NoCategorySelected component is shown again
// Visual feedback:
// The selected category is highlighted in the sidebar
// The category details are displayed in the main content area
// The color scheme is consistent with the design we established earlier
// This implementation provides a smooth user experience for navigating between categories and viewing their details