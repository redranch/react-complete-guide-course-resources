function Button({ children, variant = "primary", ...props }) {
    const baseClasses = "px-6 py-2 text-white rounded-md transition-colors duration-200";
    const variantClasses = {
        primary: "bg-blue-600 hover:bg-blue-700",
        secondary: "bg-gray-500 hover:bg-gray-600"
    };

    const classes = `${baseClasses} ${variantClasses[variant]}`;
    return <button className={classes} {...props}>{children}</button>
}

export default Button;