import { getTaskStatusBadge } from '../utils/taskFilters';

export function TaskItem({ task, user, onEdit, onDelete, constants = null }) {
  const statusConfig = getTaskStatusBadge(task.status, constants);

  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex justify-between items-start">
        
        <div className="flex-1">
          <h3 className="font-semibold">{task.title}</h3>
          <p className="text-gray-600 text-sm">{task.description}</p>
          
          
          {task.assignedTo && (
            <p className="text-gray-500 text-xs mt-2">
              👤 <span className="font-medium">
                {typeof task.assignedTo === 'object' 
                  ? task.assignedTo.name 
                  : task.assignedTo}
              </span>
            </p>
          )}
          
          <p className="text-gray-400 text-xs mt-2">
            Oluşturulma: {new Date(task.createdAt).toLocaleDateString('tr-TR')}
          </p>
        </div>

        
        <div className="flex items-center gap-2 ml-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}>
            {statusConfig.label}
          </span>

          {user?.role === 'admin' ? (
            <>
              <button
                onClick={() => onEdit(task)}
                className="text-blue-500 hover:text-blue-700"
                title="Düzenle"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(task._id)}
                className="text-red-500 hover:text-red-700"
                title="Sil"
              >
                🗑️
              </button>
            </>
          ) : (
            <button
              onClick={() => onEdit(task)}
              className="text-blue-500 hover:text-blue-700"
              title="Durum Değiştir"
            >
              ✏️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
