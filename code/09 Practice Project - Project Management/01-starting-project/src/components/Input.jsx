import { forwardRef } from "react";

const Input = forwardRef(function Input({type, label, ...props}, ref) {
    const classes = "w-full p-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent";
    
    return (
        <div className="flex flex-col">
            <label className="text-white font-medium mb-2">{label}</label>
            {type === 'textarea' ? (
                <textarea 
                    className={classes} 
                    ref={ref} 
                    {...props} 
                />
            ) : (
                <input 
                    className={classes} 
                    type={type} 
                    ref={ref} 
                    {...props} 
                />
            )}
        </div>
    );
});

export default Input;
