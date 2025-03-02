function Button({ children, variant = "primary", className = "", ...props }) {
    const baseClasses = "px-6 py-2 text-white rounded-md transition-colors duration-200";
    const variantClasses = {
        primary: "bg-red-800 hover:bg-red-900",
        secondary: "bg-gray-800 hover:bg-gray-700",
        blue: "bg-blue-800 hover:bg-blue-900",
        danger: "bg-red-700 hover:bg-red-800"
    };

    // This line combines three parts using template literals (`):
    // • baseClasses: Common styles for all buttons (padding, text color, rounded corners, transitions)
    // • variantClasses[variant]: Looks up specific styles based on variant prop:
    //   - primary → "bg-red-800 hover:bg-red-900" (muted red)
    //   - secondary → "bg-gray-800 hover:bg-gray-700" (dark gray)
    //   - blue → "bg-blue-800 hover:bg-blue-900" (deep blue)
    //   - danger → "bg-red-700 hover:bg-red-800" (brighter red for warnings)
    // • className: Any additional custom classes passed as a prop
    //
    // Example usage: <Button variant="primary" className="w-full">Click me</Button>
    // Results in: "px-6 py-2 text-white rounded-md transition-colors duration-200 bg-red-800 hover:bg-red-900 w-full"
    const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;
    
    return <button className={classes} {...props}>{children}</button>
}

export default Button;