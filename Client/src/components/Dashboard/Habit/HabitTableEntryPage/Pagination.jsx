import React from "react";

function Pagination({ currentPage, totalPages, setCurrentPage, fetchHabits }) {
  return (
    <div className="mt-4 flex justify-end gap-2">
      {/* Previous Button */}
      <button
        className="btn btn-soft btn-secondary btn-sm"
        onClick={() => {
          const prevPageNumber = Math.max(currentPage - 1, 1);
          setCurrentPage(prevPageNumber);
          fetchHabits(prevPageNumber);
        }}
        disabled={currentPage === 1}
      >
        Prev
      </button>

      <span className="flex items-center px-2">
        Page {currentPage} of {totalPages}
      </span>

      {/* Next Button */}
      <button
        className="btn btn-soft btn-secondary btn-sm"
        onClick={() => {
          const nextPageNumber = Math.min(currentPage + 1, totalPages);
          setCurrentPage(nextPageNumber);
          fetchHabits(nextPageNumber);
        }}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;
