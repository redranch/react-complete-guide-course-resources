function NewCategory() {
    return <div>
        <h2>New Category</h2>
        <input type="text" placeholder="Title" />
        <textarea placeholder="Description" />
        <input type="date" placeholder="Due Date" />

        <menu>
            <button>Save</button>
            <button>Cancel</button>
        </menu>
    </div>
}

export default NewCategory;