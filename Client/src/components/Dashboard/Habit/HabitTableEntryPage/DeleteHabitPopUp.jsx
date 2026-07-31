import React, { useEffect } from 'react';

function DeleteHabitPopUp({ isDeletePopupOpen, onClose, onConfirm }) {
  useEffect(() => {
    if (isDeletePopupOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDeletePopupOpen]);

  if (!isDeletePopupOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-base-200 w-full max-w-md h-[250px] rounded-3xl shadow-2xl border border-base-300 flex flex-col justify-between overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Confirm Deletion
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-gray-600 dark:text-gray-300">
            You’re about to <span className="font-medium text-red-600">permanently delete</span> this habit entry. This action <strong>cannot</strong> be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn btn-sm btn-soft btn-warning"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-sm btn-soft btn-secondary"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteHabitPopUp;
