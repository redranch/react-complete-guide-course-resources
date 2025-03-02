import Button from "./Button";

function CategoriesSidebar({ onAddClick, categories, onSelectCategory, selectedCategoryId }) {
    return (
        <aside className="bg-black md:w-72 h-full border-r border-gray-800">
            <div className="p-8 pb-4 flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white font-sans">Categories</h2>
                <button 
                    onClick={onAddClick}
                    className="w-8 h-8 rounded-full bg-red-800 text-white flex items-center justify-center hover:bg-red-900 transition-colors"
                    title="Add Category"
                >
                    <span className="text-xl font-bold">+</span>
                </button>
            </div>
            <ul className="px-8 space-y-2 overflow-y-auto max-h-[calc(100vh-120px)]">
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
