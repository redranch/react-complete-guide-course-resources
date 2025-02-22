import { forwardRef, useImperativeHandle, useState } from 'react';

const Modal = forwardRef(function Modal({ title, message }, ref) {
  const [isVisible, setIsVisible] = useState(false);

  useImperativeHandle(ref, () => {
    return {
      open() {
        setIsVisible(true);
      },
      close() {
        setIsVisible(false);
      }
    };
  });

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      style={{ backgroundColor: 'rgba(18, 18, 18, 0.8)' }}
    >
      <div 
        className="p-6 rounded-lg shadow-xl"
        style={{ 
          backgroundColor: '#2A2A2E',
          border: '1px solid #008080',
          maxWidth: '400px',
          width: '100%'
        }}
      >
        <h2 
          className="text-xl font-bold mb-4"
          style={{ color: '#EAEAEA' }}
        >
          {title}
        </h2>
        <p 
          className="mb-6"
          style={{ color: '#D1D1D1' }}
        >
          {message}
        </p>
        <button
          onClick={() => setIsVisible(false)}
          className="px-4 py-2 rounded hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#0D3B2E', color: '#EAEAEA' }}
        >
          OK
        </button>
      </div>
    </div>
  );
});

export default Modal; 