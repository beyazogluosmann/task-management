export function TaskPagination({ pagination, onPageChange }) {
  
  if (!pagination) return null;

  const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
      <div className="text-sm text-gray-600 font-medium">
        Sayfa <span className="text-blue-600 font-bold">{currentPage}</span> / <span className="text-blue-600 font-bold">{totalPages}</span>
      </div>

    
      <div className="flex gap-2">
       
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Önceki sayfaya git"
        >
          ← Önceki
        </button>

       
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Sonraki sayfaya git"
        >
          Sonraki →
        </button>
      </div>
    </div>
  );
}
