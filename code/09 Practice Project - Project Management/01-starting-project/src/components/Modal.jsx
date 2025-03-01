import { forwardRef, useImperativeHandle, useState } from 'react';
import Button from './Button';

const Modal = forwardRef(function Modal({ title, message }, ref) {
  const [isVisible, setIsVisible] = useState(false);

  //Encapsulation: The parent component only sees the methods we explicitly expose 
//   The close() method exposed through useImperativeHandle serves a different purpose - it allows parent components to programmatically close the modal from the outside using the ref.
// For example, you might want to close the modal:
// After a certain time period
// When another action happens elsewhere in the app
// When an API call completes
// When the escape key is pressed
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

  //Note that the if statement is used to prevent the modal from being rendered when it is not visible
  //This is a good practice to avoid unnecessary rendering of components that are not visible 
  if (!isVisible) return null;

     //button closes the modal, by setting the isVisible state to false, which triggers the if statement in the return statement to return null, and the modal is not rendered
    
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