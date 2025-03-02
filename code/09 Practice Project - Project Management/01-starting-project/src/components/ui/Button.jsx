import React from 'react';

/**
 * Button Component
 * 
 * A reusable button component with multiple variants and sizes.
 * 
 * @param {Object} props
 * @param {string} [props.variant='primary'] - Button style variant ('primary', 'secondary', 'icon')
 * @param {string} [props.size='medium'] - Button size ('small', 'medium', 'large')
 * @param {boolean} [props.disabled=false] - Whether the button is disabled
 * @param {Function} props.onClick - Click handler function
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.title] - Button title/tooltip
 * @param {React.ReactNode} props.children - Button content
 */
function Button({ 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  onClick, 
  className = '', 
  title,
  children 
}) {
  // Base classes for all buttons
  const baseClasses = 'rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50';
  
  // Variant-specific classes
  const variantClasses = {
    primary: 'bg-red-800 text-white hover:bg-red-900 active:bg-red-950',
    secondary: 'bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-600 border border-gray-700',
    icon: 'w-8 h-8 rounded-full bg-red-800 text-white flex items-center justify-center hover:bg-red-900 transition-colors'
  };
  
  // Size-specific classes (not applied to icon variant)
  const sizeClasses = variant !== 'icon' ? {
    small: 'px-3 py-1 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg'
  } : {};
  
  // Disabled state classes
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || ''}
    ${disabledClasses}
    ${className}
  `.trim();
  
  return (
    <button
      className={buttonClasses}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}

export default Button;