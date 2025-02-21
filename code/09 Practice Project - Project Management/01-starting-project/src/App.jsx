import CategoriesSidebar from "./components/CategoriesSidebar";
import NoCategorySelected from "./components/NoCategorySelected";
import { useState } from "react";
import NewCategory from "./components/NewCategory";
function App() {
  const [categoryState, setCategoryState] = useState(null);

  function handleAddCategory(){
    setCategoryState({
      categoryId: 1,
      categories: []
    });
  }

  function handleCancelCategory(){
    setCategoryState(null);
  }

  return (
    <main className="h-screen my-8 flex gap-8">
      <CategoriesSidebar />
      {categoryState  ? <NoCategorySelected /> : <NewCategory handleAddCategory={handleAddCategory} handleCancelCategory={handleCancelCategory} />}
    </main>
  );
}
export default App;