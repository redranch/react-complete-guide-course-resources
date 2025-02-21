

function Input({type, value, onChange, label, ...props}){
    const classes = "p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    return (
        <div className="flex flex-col">
            <label className="text-white font-medium mb-2">{label}</label>
            <input className = {classes} type={type} value={value} onChange={onChange} {...props} />
        </div>
        
    )
}

export default Input;
