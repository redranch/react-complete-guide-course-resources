import Button from "./Button";

function NoCategorySelected({ onAddClick }) {
    return (
        <div className="mt-24 text-center w-2/3">
            <h1 className="text-4xl font-bold">No Category Selected</h1>
            <p className="text-gray-500">Please select a category to get started.</p>
            <p className="mt-4">
                <Button variant="primary" onClick={onAddClick}>Add Category</Button>
            </p>
        </div>
    );
}

export default NoCategorySelected;