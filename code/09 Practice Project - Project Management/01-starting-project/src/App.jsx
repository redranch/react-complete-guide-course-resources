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

  function handleCancelCategory(){
    setCategoryState(prevState => ({
      ...prevState,
      newCategoryInProgress: false,
    }));
  }

  return (
    <main className="h-screen my-8 flex gap-8">
      <CategoriesSidebar handleAddCategory={handleAddCategory} />
      {categoryState.newCategoryInProgress ?  <NewCategory handleAddCategory={handleAddCategory} handleCancelCategory={handleCancelCategory} /> : <NoCategorySelected handleAddCategory={handleAddCategory} />}
    </main>
  );
}
export default App;