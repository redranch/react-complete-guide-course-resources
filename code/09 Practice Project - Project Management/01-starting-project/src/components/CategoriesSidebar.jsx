
function CategoriesSidebar() {
    return <aside className="bg-black md:w-72 h-screen p-4 text-white">
        <h2 className="text-2xl md:text-4xl font-bold mb-4">Categories</h2>
        <div className="bg-black rounded-md p-2 flex justify-left items-center">
            <button className="px-4 py-2 md:text-base bg-green-800 rounded-md hover:bg-green-900 transition-colors duration-300 text-white font-bold">
                Add Category
            </button>
        </div>
    </aside>
}

export default CategoriesSidebar;
