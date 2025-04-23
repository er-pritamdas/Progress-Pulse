import React from 'react';

function DeleteHabitPopUp({ isDeletePopupOpen, onClose, onConfirm }) {
  if (!isDeletePopupOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-xs flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
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
