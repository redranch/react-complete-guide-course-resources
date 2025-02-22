import CategoriesSidebar from "./components/CategoriesSidebar";
import NoCategorySelected from "./components/NoCategorySelected";
import { useState } from "react";
import NewCategory from "./components/NewCategory";
function App() {
  const [categoryState, setCategoryState] = useState({
    isCreating: false,
    categories: []
  });

  function showCategoryForm() {
    setCategoryState(prev => ({
      ...prev,
      isCreating: true,
    }));
  }

  function addCategory(newCategory) {
    setCategoryState(prev => ({
      isCreating: false,
      categories: [...prev.categories, newCategory],
    }));
  }

  function cancelCategoryCreation() {
    setCategoryState(prev => ({
      ...prev,
      isCreating: false,
    }));
  }

  console.log(categoryState.categories);

  return (
    <main className="h-screen my-8 flex gap-8">
      <CategoriesSidebar onAddClick={showCategoryForm} />
      {categoryState.isCreating ?  
      <NewCategory 
      onCancel={cancelCategoryCreation} 
      onSave={addCategory} /> : <NoCategorySelected onAddClick={showCategoryForm} />}
    </main>
  );
}
export default App;