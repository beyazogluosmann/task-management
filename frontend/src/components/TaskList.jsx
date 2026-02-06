import { TaskItem } from './TaskItem';
import { getEmptyStateMessage } from '../utils/taskFilters';

export function TaskList({ tasks, filterStatus, user, onEdit, onDelete, constants = null }) {
  const isEmpty = tasks.length === 0;
  const emptyMessage = getEmptyStateMessage(filterStatus, constants);

  return (
    <div className="divide-y">
      {isEmpty ? (
        <div className="p-6 text-center text-gray-500">
          {emptyMessage}
        </div>
      ) : (
        tasks.map((task) => (
          <TaskItem
            key={task._id}
            task={task}
            user={user}
            onEdit={onEdit}
            onDelete={onDelete}
            constants={constants}
          />
        ))
      )}
    </div>
  );
}
