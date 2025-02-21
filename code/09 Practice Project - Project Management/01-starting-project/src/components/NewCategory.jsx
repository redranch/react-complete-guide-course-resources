import Input from "./Input";
import Button from "./Button";
import {useRef} from "react";

function NewCategory({handleCancelCategory,handleSaveCategory}) {
    const titleRef = useRef(null);
    const descriptionRef = useRef(null);
    const dueDateRef = useRef(null);

function handleSaveCategoryAction(){
    console.log(titleRef.current.value);
    const enteredTitle = titleRef.current.value;
    console.log(descriptionRef.current.value);  
    const enteredDescription = descriptionRef.current.value;
    console.log(dueDateRef.current.value);
    const enteredDueDate = dueDateRef.current.value;

    handleSaveCategory({
        title: enteredTitle,
        description: enteredDescription,
        dueDate: enteredDueDate,
    });

}


    return (
        <div className="max-w-2xl mx-auto p-6 bg-black rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-white">New Category</h2>
            
            <div className="space-y-4">

                <Input label="Title" type="text" placeholder="Enter category title" ref={titleRef} />
                <Input label="Description" type="textarea" placeholder="Enter category description" ref={descriptionRef} />
                <Input label="Due Date" type="date" placeholder="Enter category due date" ref={dueDateRef} />

            </div>

            <menu className="mt-8 flex justify-end gap-4">
                <li>
                    <Button variant="primary" onClick={handleSaveCategoryAction}>Save</Button>
                </li>
                <li>
                    <Button variant="secondary" onClick={handleCancelCategory}>Cancel</Button>
                </li>
            </menu>
        </div>
    );
}

export default NewCategory;