import Input from "./Input";
import Button from "./Button";
import Modal from "./Modal";
import { useRef } from "react";

function NewCategory({ onCancel, onSave }) {
    const titleRef = useRef(null);
    const descriptionRef = useRef(null);
    const dueDateRef = useRef(null);
    const modalRef = useRef(null);

    function handleValidation() {
        const title = titleRef.current.value.trim();
        const description = descriptionRef.current.value.trim();
        const dueDate = dueDateRef.current.value;

        if (!title || !description || !dueDate) {
            modalRef.current.open();
            return false;
        }
        return true;
    }

    function handleSave() {
        if (!handleValidation()) return;

        const newCategory = {
            title: titleRef.current.value,
            description: descriptionRef.current.value,
            dueDate: dueDateRef.current.value,
        };
        onSave(newCategory);
    }

    return (
        <>
            <div className="max-w-2xl mx-auto p-6 bg-black rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-white">New Category</h2>
                
                <div className="space-y-4">
                    <Input label="Title" type="text" placeholder="Enter category title" ref={titleRef} />
                    <Input label="Description" type="textarea" placeholder="Enter category description" ref={descriptionRef} />
                    <Input label="Due Date" type="date" placeholder="Enter category due date" ref={dueDateRef} />
                </div>

                <menu className="mt-8 flex justify-end gap-4">
                    <li>
                        <Button variant="primary" onClick={handleSave}>Save</Button>
                    </li>
                    <li>
                        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                    </li>
                </menu>
            </div>
            
            <Modal
                ref={modalRef}
                title="Validation Error"
                message="Please fill in all fields (Title, Description, and Due Date) before saving."
            />
        </>
    );
}

export default NewCategory;