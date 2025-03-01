import Button from "./Button";

function NoCategorySelected({ onAddClick }) {
    return (
        <div className="flex-1 p-8">
            <div className="text-left">
                <h1 className="text-4xl font-bold text-white">No Category Selected</h1>
                <p className="text-gray-400 mt-2">Please select a category or create a new one to get started.</p>
                <div className="mt-8">
                    <Button variant="primary" onClick={onAddClick}>Add Category</Button>
                </div>
            </div>
        </div>
    );
}

export default NoCategorySelected;