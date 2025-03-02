import Input from "./Input";
import Button from "./Button";
import Modal from "./Modal";
import { useRef, useEffect } from "react";

function NewCategory({ onCancel, onSave, initialData, isEditing }) {
    const titleRef = useRef(null);
    const descriptionRef = useRef(null);
    const dueDateRef = useRef(null);
    const modalRef = useRef(null);

    // Format today's date as YYYY-MM-DD for the date input
    const getTodayFormatted = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Set the default date when the component mounts
    useEffect(() => {
        if (dueDateRef.current) {
            dueDateRef.current.value = initialData?.dueDate || getTodayFormatted();
        }
        
        // If we're editing, populate the fields with existing data
        if (isEditing && initialData && titleRef.current && descriptionRef.current) {
            titleRef.current.value = initialData.title || '';
            descriptionRef.current.value = initialData.description || '';
        }
    }, [initialData, isEditing]);

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

        const categoryData = {
            title: titleRef.current.value,
            description: descriptionRef.current.value,
            dueDate: dueDateRef.current.value,
        };
        
        // If editing, preserve the ID
        if (isEditing && initialData) {
            categoryData.id = initialData.id;
        }
        
        onSave(categoryData);
    }

    return (
        <>
            <div className="flex-1 p-8">
                <div className="w-full max-w-2xl">
                    <h2 className="text-2xl font-bold mb-6 text-white">
                        {isEditing ? 'Edit Category' : 'New Category'}
                    </h2>
                    
                    <div className="space-y-4">
                        <Input 
                            label="Title" 
                            type="text" 
                            placeholder="Enter category title" 
                            ref={titleRef} 
                            defaultValue={initialData?.title || ''}
                        />
                        <Input 
                            label="Description" 
                            type="textarea" 
                            placeholder="Enter category description" 
                            ref={descriptionRef} 
                            defaultValue={initialData?.description || ''}
                        />
                        <Input 
                            label="Due Date" 
                            type="date" 
                            defaultValue={initialData?.dueDate || getTodayFormatted()}
                            ref={dueDateRef} 
                        />
                    </div>

                    <menu className="mt-8 flex justify-end gap-4">
                        <li>
                            <Button variant="primary" onClick={handleSave}>
                                {isEditing ? 'Update' : 'Save'}
                            </Button>
                        </li>
                        <li>
                            <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                        </li>
                    </menu>
                </div>
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