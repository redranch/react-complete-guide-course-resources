import Button from "./Button";

function NoCategorySelected({ onAddClick }) {
    return (
        <div className="flex-1 p-8">
            <div className="w-full max-w-3xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-white font-sans">
                        No Category Selected
                    </h1>
                    <button 
                        onClick={onAddClick}
                        className="w-8 h-8 rounded-full bg-red-800 text-white flex items-center justify-center hover:bg-red-900 transition-colors"
                        title="Add Category"
                    >
                        <span className="text-xl font-bold">+</span>
                    </button>
                </div>
                
                <div className="mb-6 p-4 rounded bg-gray-900 border-l-4 border-red-800">
                    <h2 className="text-xl mb-2 text-white">Getting Started</h2>
                    <p className="text-gray-300 bg-black p-3 rounded">
                        Please select a category from the sidebar or create a new one to get started.
                        You can manage your categories and track their due dates.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default NoCategorySelected;