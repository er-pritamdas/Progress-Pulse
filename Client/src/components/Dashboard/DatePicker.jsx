import React, { useState, useRef } from 'react';

function DatePicker() {
  const [rawDate, setRawDate] = useState('');
  const dateInputRef = useRef(null);

  // Format to: 09 Apr 2025
  const formatDate = (inputDate) => {
    if (!inputDate) return '';
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(inputDate).toLocaleDateString('en-GB', options).replace(/ /g, ' ');
  };

  const handleTextInputClick = () => {
    dateInputRef.current.showPicker(); // Native date picker trigger
  };

  return (
    <div className="form-control w-full max-w-xs">
      <label className="label">
        <span className="label-text text-sm">Select Date</span>
      </label>

      <div className="relative">
        {/* Styled visible text input */}
        <input
          type="text"
          className="input input-sm input-bordered w-full pr-10 cursor-pointer text-sm"
          onClick={handleTextInputClick}
          value={formatDate(rawDate)}
          readOnly
        />
        <span className="absolute right-3 top-1 pointer-events-none opacity-80 text-sm">📅</span>

        {/* Hidden native date input */}
        <input
          type="date"
          ref={dateInputRef}
          className="absolute opacity-0 pointer-events-none w-0 h-0"
          value={rawDate}
          onChange={(e) => setRawDate(e.target.value)}
        />
      </div>
    </div>
  );
}

export default DatePicker;
