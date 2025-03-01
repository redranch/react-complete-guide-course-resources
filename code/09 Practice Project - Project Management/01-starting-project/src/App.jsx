import CategoriesSidebar from "./components/CategoriesSidebar";
import NoCategorySelected from "./components/NoCategorySelected";
import { useState } from "react";
import NewCategory from "./components/NewCategory";
import CategoryDetails from "./components/CategoryDetails";

function App() {
  const [categoryState, setCategoryState] = useState({
    isCreating: false,
    categories: [],
    selectedCategoryId: null
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

  // Find the selected category object
  const selectedCategory = categoryState.categories.find(
    category => category.id === categoryState.selectedCategoryId
  );

  // Determine what to show in the main content area
  let mainContent;
  if (categoryState.isCreating) {
    mainContent = <NewCategory onCancel={handleCancelAddCategory} onSave={handleAddCategory} />;
  } else if (selectedCategory) {
    mainContent = <CategoryDetails category={selectedCategory} onBackClick={handleBackToOverview} />;
  } else {
    mainContent = <NoCategorySelected onAddClick={handleShowCategoryForm} />;
  }

  return (
    <main className="h-screen flex bg-black text-gray-100">
      <CategoriesSidebar 
        onAddClick={handleShowCategoryForm} 
        categories={categoryState.categories} 
        onSelectCategory={handleSelectCategory}
        selectedCategoryId={categoryState.selectedCategoryId}
      />
      {mainContent}
    </main>
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