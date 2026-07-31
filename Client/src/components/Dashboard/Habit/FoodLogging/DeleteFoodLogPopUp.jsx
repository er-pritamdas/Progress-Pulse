import React, { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

function DeleteFoodLogPopUp({ isOpen, onClose, onConfirm, foodName }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-base-200 w-full max-w-md h-[260px] rounded-3xl shadow-2xl border border-base-300 flex flex-col justify-between overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-base-300 flex items-center justify-between">
          <h2 className="text-xl font-bold text-base-content flex items-center gap-2">
            <AlertTriangle className="text-error" size={22} />
            Confirm Deletion
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-base-content/80 text-sm leading-relaxed">
            You’re about to <span className="font-semibold text-error">permanently delete</span>{" "}
            {foodName ? <span className="font-bold text-base-content">"{foodName}"</span> : "this food log entry"}.
            This action <strong>cannot</strong> be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-base-300/30 flex justify-end space-x-3 border-t border-base-300">
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

export default DeleteFoodLogPopUp;
