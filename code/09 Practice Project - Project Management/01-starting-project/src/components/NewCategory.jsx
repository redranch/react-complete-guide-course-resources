import Input from "./Input";
import Button from "./Button";

function NewCategory({handleAddCategory, handleCancelCategory}) {
    return (
        <div className="max-w-2xl mx-auto p-6 bg-black rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-white">New Category</h2>
            
            <div className="space-y-4">

                <Input label="Title" type="text" placeholder="Enter category title" />
                <Input label="Description" type="textarea" placeholder="Enter category description" />
                <Input label="Due Date" type="date" placeholder="Enter category due date" />

            </div>

            <menu className="mt-8 flex justify-end gap-4">
                <li>
                    <Button variant="primary" onClick={handleAddCategory}>Save</Button>
                </li>
                <li>
                    <Button variant="secondary" onClick={handleCancelCategory}>Cancel</Button>
                </li>
            </menu>
        </div>
    );
}

export default NewCategory;