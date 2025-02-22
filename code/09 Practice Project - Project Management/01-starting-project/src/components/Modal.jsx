import { forwardRef, useImperativeHandle, useState } from 'react';
import Button from './Button';
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
    <dialog 
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      style={{ backgroundColor: 'rgba(18, 18, 18, 0.8)' }}
    >
      <div 
        className="p-6 rounded-lg shadow-xl"
        style={{ 
          backgroundColor: '#2A2A2E',
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
        <Button
          onClick={() => setIsVisible(false)}

        >
          OK
        </Button>
      </div>
    </dialog>
  );
});

export default Modal; 