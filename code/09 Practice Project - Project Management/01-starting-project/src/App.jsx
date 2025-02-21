import CategoriesSidebar from "./components/CategoriesSidebar";
import NoCategorySelected from "./components/NoCategorySelected";
import { useState } from "react";
import NewCategory from "./components/NewCategory";
function App() {
  const [categoryState, setCategoryState] = useState({
    newCategoryInProgress: false,
    categories: []
  });

  function handleAddCategory(){
    setCategoryState(prevState => ({
      ...prevState,
      newCategoryInProgress: true,
    }));
  }

  function handleSaveCategory(newCategory){
    setCategoryState(prevState => ({
      ...prevState,
      newCategoryInProgress: false,
      categories: [...prevState.categories, newCategory],
    }));
  }
  

  function handleCancelCategory(){
    setCategoryState(prevState => ({
      ...prevState,
      newCategoryInProgress: false,
    }));
  }

  console.log(categoryState.categories);

  return (
    <main className="h-screen my-8 flex gap-8">
      <CategoriesSidebar handleAddCategory={handleAddCategory} />
      {categoryState.newCategoryInProgress ?  
      <NewCategory handleAddCategory={handleAddCategory} 
      handleCancelCategory={handleCancelCategory} 
      handleSaveCategory={handleSaveCategory} /> : <NoCategorySelected handleAddCategory={handleAddCategory} />}
    </main>
  );
}
export default App;