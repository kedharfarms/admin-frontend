import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange, maxPagesToShow = 3 }) => {
  if (totalPages <= 1) return null;

  const renderPageButtons = () => {
    const pageButtons = [];
    let startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(2, endPage - maxPagesToShow + 1);
    }

    // Always show first page
    pageButtons.push(
      <button
        key={1}
        onClick={() => onPageChange(1)}
        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
          currentPage === 1 ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        1
      </button>
    );

    if (startPage > 2) {
      pageButtons.push(
        <span key="start-ellipsis" className="px-2 text-gray-400">
          ...
        </span>
      );
    }

    for (let page = startPage; page <= endPage; page++) {
      pageButtons.push(
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            currentPage === page
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      );
    }

    if (endPage < totalPages - 1) {
      pageButtons.push(
        <span key="end-ellipsis" className="px-2 text-gray-400">
          ...
        </span>
      );
    }

    if (totalPages > 1) {
      pageButtons.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            currentPage === totalPages
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return pageButtons;
  };

  return (
    <div className="flex items-center gap-1">
      {/* First & Prev */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="First page"
      >
        {'<<'}
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Previous page"
      >
        {'<'}
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">{renderPageButtons()}</div>

      {/* Next & Last */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Next page"
      >
        {'>'}
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Last page"
      >
        {'>>'}
      </button>
    </div>
  );
};

export default Pagination;
