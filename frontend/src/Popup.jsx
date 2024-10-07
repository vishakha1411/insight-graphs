import React from 'react';

const Popup = ({ point, onClose }) => {
  if (!point) return null;

  return (
    <div style={popupStyle}>
      <div style={popupContentStyle}>
        <h3>Car Information</h3>
        <p><strong>Year:</strong> {point.year}</p>
        <p><strong>Price:</strong> ₹{point.price}</p>
        <p><strong>City:</strong> {point.city}</p>
        <p><strong>Source:</strong> {point.source}</p>
        <p><strong>Transmission:</strong> {point.transmission}</p>
        <p><strong>Fuel Type:</strong> {point.fuel}</p>
        <button onClick={onClose} style={closeButtonStyle}>Close</button>
      </div>
    </div>
  );
};
const popupStyle = {
  position: 'fixed',
  width:'200px',
  height:'auto',
  top: '50%',

  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: '15px',
  border: '1px solid #ccc',
  zIndex: 1000
};

const popupContentStyle = {
    margin:'0',
  display: 'flex',
  flexDirection: 'column',
  gap: '0'
};

const closeButtonStyle = {
  
  padding: '5px 10px',
  backgroundColor: '#f44336',
  color: 'white',
  border: 'none',
  cursor: 'pointer'
};

export default Popup;
