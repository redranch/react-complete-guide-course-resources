// import { useState } from 'react';

// function Sidebar() {
//   const [categories, setCategories] = useState([]);
//   const [isAddingCategory, setIsAddingCategory] = useState(false);
//   const [newCategory, setNewCategory] = useState({
//     title: '',
//     description: '',
//     dueDate: ''
//   });

//   const handleAddCategory = () => {
//     if (newCategory.title.trim() === '') return;

//     setCategories(prevCategories => [...prevCategories, { ...newCategory, id: Date.now() }]);
//     setNewCategory({ title: '', description: '', dueDate: '' });
//     setIsAddingCategory(false);
//   };

//   return (
//     <aside style={{ backgroundColor: '#2A2A2E' }} className="w-72 h-screen p-4">
//       <h2 className="text-2xl font-bold mb-4" style={{ color: '#EAEAEA' }}>Categories</h2>
      
//       {!isAddingCategory ? (
//         <button
//           onClick={() => setIsAddingCategory(true)}
//           style={{ backgroundColor: '#0D3B2E' }}
//           className="w-full text-white px-4 py-2 rounded hover:opacity-90 transition-opacity"
//         >
//           Add Category
//         </button>
//       ) : (
//         <div className="space-y-3">
//           <input
//             type="text"
//             placeholder="Title"
//             value={newCategory.title}
//             onChange={(e) => setNewCategory(prev => ({ ...prev, title: e.target.value }))}
//             className="w-full p-2 rounded"
//             style={{ 
//               backgroundColor: '#1C1C1E',
//               color: '#EAEAEA',
//               border: '1px solid #008080'
//             }}
//           />
//           <textarea
//             placeholder="Description"
//             value={newCategory.description}
//             onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
//             className="w-full p-2 rounded"
//             style={{ 
//               backgroundColor: '#1C1C1E',
//               color: '#EAEAEA',
//               border: '1px solid #008080'
//             }}
//           />
//           <input
//             type="date"
//             value={newCategory.dueDate}
//             onChange={(e) => setNewCategory(prev => ({ ...prev, dueDate: e.target.value }))}
//             className="w-full p-2 rounded"
//             style={{ 
//               backgroundColor: '#1C1C1E',
//               color: '#EAEAEA',
//               border: '1px solid #008080'
//             }}
//           />
//           <div className="flex gap-2">
//             <button
//               onClick={handleAddCategory}
//               style={{ backgroundColor: '#005F6A' }}
//               className="flex-1 text-white px-4 py-2 rounded hover:opacity-90 transition-opacity"
//             >
//               Save
//             </button>
//             <button
//               onClick={() => setIsAddingCategory(false)}
//               style={{ backgroundColor: '#001F3F' }}
//               className="flex-1 text-white px-4 py-2 rounded hover:opacity-90 transition-opacity"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="mt-6 space-y-4">
//         {categories.map(category => (
//           <div 
//             key={category.id} 
//             className="p-3 rounded shadow"
//             style={{ 
//               backgroundColor: '#1C1C1E',
//               borderLeft: '4px solid #A67C52'
//             }}
//           >
//             <h3 style={{ color: '#EAEAEA' }} className="font-bold">{category.title}</h3>
//             <p style={{ color: '#D1D1D1' }} className="text-sm">{category.description}</p>
//             <p style={{ color: '#008080' }} className="text-sm mt-2">
//               Due: {new Date(category.dueDate).toLocaleDateString()}
//             </p>
//           </div>
//         ))}
//       </div>
//     </aside>
//   );
// }

// export default Sidebar; 