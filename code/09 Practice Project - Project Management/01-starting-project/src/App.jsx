import CategoriesSidebar from "./components/CategoriesSidebar";
import NewCategory from "./components/NewCategory";

function App() {
  return (
    <main className="h-screen my-8 flex gap-8">
      <CategoriesSidebar />
      <NewCategory />
    </main>
  );
}
export default App;