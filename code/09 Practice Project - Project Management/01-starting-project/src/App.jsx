import CategoriesSidebar from "./components/CategoriesSidebar";
import NoCategorySelected from "./components/NoCategorySelected";
import { useState } from "react";
import NewEditCategory from "./components/NewEditCategory";
import SelectedCategoryDetails from "./components/SelectedCategoryDetails";

function App() {
  const [categoryState, setCategoryState] = useState({
    isCreating: false,
    categories: [],
    selectedCategoryId: null,
    categoryToEdit: null
  });

  function handleShowCategoryForm() {
    setCategoryState(prev => ({
      ...prev,
      isCreating: true,
      selectedCategoryId: null
    }));
  }

  function handleAddCategory(newCategory) {
    newCategory.id = crypto.randomUUID();
    setCategoryState(prev => ({
      isCreating: false,
      categories: [...prev.categories, newCategory],
      selectedCategoryId: newCategory.id // Automatically select the new category
    }));
  }

  function handleCancelAddCategory() {
    setCategoryState(prev => ({
      ...prev,
      isCreating: false,
    }));
  }

  function handleSelectCategory(categoryId) {
    setCategoryState(prev => ({
      ...prev,
      selectedCategoryId: categoryId,
      isCreating: false
    }));
  }

  function handleBackToOverview() {
    setCategoryState(prev => ({
      ...prev,
      selectedCategoryId: null
    }));
  }

  function handleDeleteCategory() {
    setCategoryState(prev => ({
      ...prev,
      selectedCategoryId: null,
      categories: prev.categories.filter(category => category.id !== categoryState.selectedCategoryId)
    }));
  }
  
  function handleEditCategory(category) {
    setCategoryState(prev => ({
      ...prev,
      categoryToEdit: category
    }));
  }
  
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
  
  function handleCancelEditCategory() {
    setCategoryState(prev => ({
      ...prev,
      categoryToEdit: null
    }));
  }

  // Find the selected category object
  const selectedCategory = categoryState.categories.find(
    category => category.id === categoryState.selectedCategoryId
  );

  // Determine what to show in the main content area
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
      />
    );
  } else {
    mainContent = <NoCategorySelected onAddClick={handleShowCategoryForm} />;
  }

  return (
    <>
      <main className="h-screen flex bg-black text-gray-100">
        <CategoriesSidebar 
          onAddClick={handleShowCategoryForm} 
          categories={categoryState.categories} 
          onSelectCategory={handleSelectCategory}
          selectedCategoryId={categoryState.selectedCategoryId}
        />
        {mainContent}
      </main>
      
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