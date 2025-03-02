import Button from "./Button";

function SelectedCategoryDetails({ category, onBackClick, onDelete }) {
  const formattedDate = new Date(category.dueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="flex-1 p-8">
      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white font-sans">
            {category.title}
          </h1>
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              onClick={onDelete}
            >
              Delete
            </Button>
            <Button 
              variant="secondary" 
              onClick={onBackClick}
            >
              Back
            </Button>
          </div>
        </div>
        
        <div className="mb-6 p-4 rounded bg-gray-900 border-l-4 border-red-800">
          <h2 className="text-xl mb-2 text-white">Description</h2>
          <p className="text-gray-300 bg-black p-3 rounded">{category.description}</p>
        </div>
        
        <div className="p-4 rounded bg-gray-900">
          <h2 className="text-xl mb-2 text-white">Due Date</h2>
          <p className="text-red-700 font-bold bg-black p-3 rounded">{formattedDate}</p>
        </div>
      </div>
    </div>
  );
}

export default SelectedCategoryDetails; 