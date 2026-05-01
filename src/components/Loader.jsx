// src/components/Loader.js
import React from 'react';

const Loader = ({ message = "Loading..." }) => {
  return (
    <div className="loader-container flex-center" style={{ flexDirection: 'column' }}>
      <div className="spinner"></div>
      <p className="mt-2" style={{ fontWeight: 600 }}>{message}</p>
    </div>
  );
};

export default Loader;
