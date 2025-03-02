import Input from "../ui/Input";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { useRef, useEffect, useState } from "react";

function NewEditCategory({ onCancel, onSave, initialData, isEditing }) {
    const titleRef = useRef(null);
    const descriptionRef = useRef(null);
    const dueDateRef = useRef(null);
    const subcategoryInputRef = useRef(null);
    const nestedSubcategoryInputRef = useRef(null);
    const modalRef = useRef(null);
    
    const [subcategories, setSubcategories] = useState([]);
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(null);
    const [isAddingNestedSubcategory, setIsAddingNestedSubcategory] = useState(false);

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
        if (isEditing && initialData) {
            if (titleRef.current && descriptionRef.current) {
                titleRef.current.value = initialData.title || '';
                descriptionRef.current.value = initialData.description || '';
            }
            
            // Load subcategories if they exist
            if (initialData.subcategories) {
                setSubcategories(initialData.subcategories);
                // Select the first subcategory if any exist
                if (initialData.subcategories.length > 0) {
                    setSelectedSubcategoryId(initialData.subcategories[0].id);
                }
            }
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
            subcategories: subcategories
        };
        
        // If editing, preserve the ID
        if (isEditing && initialData) {
            categoryData.id = initialData.id;
        }
        
        onSave(categoryData);
    }
    
    function handleAddSubcategory() {
        const subcategoryName = subcategoryInputRef.current.value.trim();
        if (!subcategoryName) return;
        
        // Add new subcategory with a unique ID
        const newSubcategory = { 
            id: crypto.randomUUID(),
            name: subcategoryName,
            items: [],
            subcategories: []
        };
        
        setSubcategories(prev => [...prev, newSubcategory]);
        
        // Select the newly created subcategory
        setSelectedSubcategoryId(newSubcategory.id);
        
        // Clear the input
        subcategoryInputRef.current.value = '';
    }
    
    function handleAddNestedSubcategory() {
        if (!selectedSubcategoryId) return;
        
        const nestedSubcategoryName = nestedSubcategoryInputRef.current.value.trim();
        if (!nestedSubcategoryName) return;
        
        // Create new nested subcategory
        const newNestedSubcategory = {
            id: crypto.randomUUID(),
            name: nestedSubcategoryName,
            items: []
        };
        
        // Add to the selected subcategory
        setSubcategories(prev => prev.map(subcategory => {
            if (subcategory.id === selectedSubcategoryId) {
                return {
                    ...subcategory,
                    subcategories: [
                        ...(subcategory.subcategories || []),
                        newNestedSubcategory
                    ]
                };
            }
            return subcategory;
        }));
        
        // Clear the input and hide the form
        nestedSubcategoryInputRef.current.value = '';
        setIsAddingNestedSubcategory(false);
    }
    
    function handleRemoveSubcategory(id) {
        setSubcategories(prev => prev.filter(subcategory => subcategory.id !== id));
        
        // If the removed subcategory was selected, clear the selection
        if (selectedSubcategoryId === id) {
            setSelectedSubcategoryId(null);
        }
    }
    
    function handleRemoveNestedSubcategory(parentId, nestedId) {
        setSubcategories(prev => prev.map(subcategory => {
            if (subcategory.id === parentId) {
                return {
                    ...subcategory,
                    subcategories: subcategory.subcategories.filter(
                        nestedSub => nestedSub.id !== nestedId
                    )
                };
            }
            return subcategory;
        }));
    }
    
    // Get the currently selected subcategory
    const selectedSubcategory = subcategories.find(sub => sub.id === selectedSubcategoryId);

    return (
        <>
            <div className="w-full">
                <div className="space-y-4 mb-20">
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
                    
                    {/* Subcategories Section */}
                    <div className="mt-6">
                        <h3 className="text-lg font-medium mb-2 text-white">Subcategories</h3>
                        
                        <div className="flex gap-2 mb-4">
                            <Input 
                                label="" 
                                type="text" 
                                placeholder="Enter subcategory name" 
                                ref={subcategoryInputRef}
                            />
                            <Button 
                                variant="secondary" 
                                onClick={handleAddSubcategory}
                                className="mt-auto"
                            >
                                Add
                            </Button>
                        </div>
                        
                        {subcategories.length > 0 ? (
                            <div className="bg-gray-900 p-3 rounded">
                                {/* Subcategory List */}
                                <ul className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                                    {subcategories.map(subcategory => (
                                        <li 
                                            key={subcategory.id} 
                                            className={`flex justify-between items-center p-2 rounded cursor-pointer ${
                                                selectedSubcategoryId === subcategory.id 
                                                    ? 'bg-red-900 text-white' 
                                                    : 'bg-black text-gray-300 hover:bg-gray-800'
                                            }`}
                                            onClick={() => setSelectedSubcategoryId(subcategory.id)}
                                        >
                                            <span>{subcategory.name}</span>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveSubcategory(subcategory.id);
                                                }}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                
                                {/* Selected Subcategory Content */}
                                {selectedSubcategory && (
                                    <div className="mt-4 border-t border-gray-800 pt-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-md font-medium text-white">
                                                Managing "{selectedSubcategory.name}"
                                            </h4>
                                            <Button 
                                                variant="secondary"
                                                className="text-sm py-1 px-2"
                                                onClick={() => setIsAddingNestedSubcategory(!isAddingNestedSubcategory)}
                                            >
                                                {isAddingNestedSubcategory ? 'Cancel' : 'Add Nested Subcategory'}
                                            </Button>
                                        </div>
                                        
                                        {/* Nested Subcategory Form */}
                                        {isAddingNestedSubcategory && (
                                            <div className="mb-4 bg-gray-800 p-3 rounded">
                                                <h5 className="text-sm font-medium mb-2 text-white">Add Nested Subcategory</h5>
                                                <div className="flex gap-2">
                                                    <Input 
                                                        label="" 
                                                        type="text" 
                                                        placeholder="Enter nested subcategory name" 
                                                        ref={nestedSubcategoryInputRef}
                                                    />
                                                    <Button 
                                                        variant="secondary" 
                                                        onClick={handleAddNestedSubcategory}
                                                        className="mt-auto"
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Nested Subcategories List */}
                                        {selectedSubcategory.subcategories && selectedSubcategory.subcategories.length > 0 && (
                                            <div className="mb-4">
                                                <h5 className="text-sm font-medium mb-2 text-white">Nested Subcategories</h5>
                                                <ul className="space-y-1 bg-gray-800 p-2 rounded max-h-40 overflow-y-auto">
                                                    {selectedSubcategory.subcategories.map(nestedSub => (
                                                        <li key={nestedSub.id} className="flex justify-between items-center p-2 bg-black rounded">
                                                            <span className="text-gray-300">{nestedSub.name}</span>
                                                            <button 
                                                                onClick={() => handleRemoveNestedSubcategory(selectedSubcategory.id, nestedSub.id)}
                                                                className="text-red-500 hover:text-red-700 text-sm"
                                                            >
                                                                Remove
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        {/* Note about items */}
                                        <div className="mt-4 bg-gray-800 p-3 rounded">
                                            <p className="text-gray-400 italic text-sm">
                                                Items can be added to subcategories after creating the category.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-400 italic">No subcategories added yet</p>
                        )}
                    </div>
                </div>

                <menu className="mt-8 flex justify-end gap-4 sticky bottom-0 bg-gray-900 py-4 border-t border-gray-800">
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
            
            <Modal
                ref={modalRef}
                title="Validation Error"
                message="Please fill in all fields (Title, Description, and Due Date) before saving."
            />
        </>
    );
}

export default NewEditCategory;