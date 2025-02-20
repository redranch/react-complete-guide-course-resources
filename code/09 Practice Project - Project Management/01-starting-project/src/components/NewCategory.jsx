function NewCategory() {
    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">New Category</h2>
            
            <div className="space-y-4">
                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-2">Title</label>
                    <input 
                        type="text" 
                        placeholder="Enter category title" 
                        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-2">Description</label>
                    <textarea 
                        placeholder="Enter category description" 
                        className="p-2 border border-gray-300 rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-2">Due Date</label>
                    <input 
                        type="date" 
                        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            <menu className="mt-8 flex justify-end gap-4">
                <li>
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200">
                        Save
                    </button>
                </li>
                <li>
                    <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200">
                        Cancel
                    </button>
                </li>
            </menu>
        </div>
    );
}

export default NewCategory;