import Button from "./Button";

function CategoriesSidebar({ onAddClick, categories, onSelectCategory, selectedCategoryId }) {
    return (
        <aside className="bg-black md:w-72 h-full p-4 text-gray-100 border-r border-gray-800">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white font-sans">Categories</h2>
            </div>
            <div className="bg-black p-2 flex justify-end items-center mb-4">
                <Button variant="primary" onClick={onAddClick}>Add Category</Button>
            </div>
            <ul className="mt-4 space-y-2 overflow-y-auto max-h-[calc(100vh-180px)]">
                {categories.map((category) => (
                    <li 
                        key={category.id} 
                        onClick={() => onSelectCategory(category.id)}
                        className={`p-3 rounded cursor-pointer transition-colors ${
                            selectedCategoryId === category.id 
                                ? 'bg-red-900 border-l-4 border-red-800' 
                                : 'bg-gray-900 hover:bg-gray-800'
                        }`}
                    >
                        <h3 className="font-bold text-white">{category.title}</h3>
                        <p className="text-sm truncate text-gray-400">
                            {category.description}
                        </p>
                    </li>
                ))}
            </ul>
        </aside>
    );
}

export default CategoriesSidebar;
