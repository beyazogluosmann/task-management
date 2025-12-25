import { getStatusCount, getStatusOptions } from '../utils/taskFilters';

export function TaskFilters({
  filterStatus,
  searchTerm,
  tasks,
  taskCounts,
  onFilterChange,
  onSearchChange,
  userRole,
  onAddTaskClick,
  statusOptions = null
}) {
  
  const options = statusOptions || getStatusOptions();

  return (
    <div className="p-6 border-b">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Görevler</h2>
        {userRole === 'admin' && onAddTaskClick && (
          <button
            onClick={onAddTaskClick}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + Yeni Task Ekle
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-2xl">🔍</span>
        <input
          type="text"
          placeholder="Task ara..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
          aria-label="Task arama"
        />
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">⚙️</span>
        <select
          value={filterStatus}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Durum filtreleme"
        >
          {taskCounts ? (
            <>
              <option value="all">Tümü ({taskCounts.all})</option>
              <option value="pending">Beklemede ({taskCounts.pending})</option>
              <option value="in_progress">Devam Ediyor ({taskCounts.in_progress})</option>
              <option value="completed">Tamamlandı ({taskCounts.completed})</option>
            </>
          ) : (
            <>
              <option value="all">Tümü ({getStatusCount(tasks, 'all')})</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({getStatusCount(tasks, option.value)})
                </option>
              ))}
            </>
          )}
        </select>
      </div>
    </div>
  );
}
