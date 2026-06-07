// frontend/src/components/common/Modal.jsx
import React from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
console.log('Modal is open, should render'); // මේක add කරන්න

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  
   return (
  <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', minWidth: '300px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3>{title}</h3>
        <button onClick={onClose}>X</button>
      </div>
      {children}
    </div>
  </div>
);
 
};

export default Modal;