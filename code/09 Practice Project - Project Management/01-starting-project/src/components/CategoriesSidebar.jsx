import Button from "./Button";

function CategoriesSidebar({ onAddClick, categories }) {
    return <aside className="bg-black rounded-lg md:w-72 h-screen p-4 text-white">
        <h2 className="text-2xl md:text-4xl font-bold mb-4">Categories</h2>
        <div className="bg-black rounded-md p-2 flex justify-left items-center">
            <Button variant="primary" onClick={onAddClick}>Add Category</Button>
        </div>
        <ul className="mt-4">
            {categories.map((category) => (
                <li key={category.id}>{category.title}</li>
            ))}
        </ul>
    </aside>
}

export default CategoriesSidebar;
