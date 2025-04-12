import React from 'react';

const Loader = () => {
    return (
      <div className="fixed inset-0 bg-white/10 flex justify-center items-center z-50">
        <div className="loading loading-bars loading-xl"></div>
      </div>
    );
  };
  
  export default Loader;
  
  