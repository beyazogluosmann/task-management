
export const buildTaskQueryParams = (filterStatus, searchTerm, limit = 50, page = 1) => {
  return {
    status: filterStatus !== 'all' ? filterStatus : undefined,
    search: searchTerm || undefined,
    page,
    limit
  };
};


let appConstants = null;

export const getAppConstants = async ( constantsAPI) => {
  if (appConstants) return appConstants;
  
  try {
    const response = await constantsAPI.getAll();
    appConstants = response.data.data;
    return appConstants;
  } catch (error) {
    console.error('Failed to load constants:', error);
    return getDefaultConstants();
  }
};


const getDefaultConstants = () => ({
  taskStatuses: {
    pending: {
      value: 'pending',
      label: 'Beklemede',
      color: { bg: 'bg-yellow-100', text: 'text-yellow-800' }
    },
    in_progress: {
      value: 'in_progress',
      label: 'Devam Ediyor',
      color: { bg: 'bg-blue-100', text: 'text-blue-800' }
    },
    completed: {
      value: 'completed',
      label: 'Tamamlandı',
      color: { bg: 'bg-green-100', text: 'text-green-800' }
    }
  },
  emptyMessages: {
    all: 'Henüz görev yok',
    pending: 'Beklemede görev yok',
    in_progress: 'Devam eden görev yok',
    completed: 'Tamamlanan görev yok'
  },
  pagination: {
    defaultLimit: 50,
    defaultPage: 1
  }
});

export const getTaskStatusBadge = (status, constants = null) => {
  const statusConfig = constants?.taskStatuses?.[status] || getDefaultConstants().taskStatuses[status];
  return {
    bg: statusConfig.color.bg,
    text: statusConfig.color.text,
    label: statusConfig.label
  };
};


export const getStatusCount = (tasks, status) => {
  if (status === 'all') return tasks.length;
  return tasks.filter(t => t.status === status).length;
};


export const getEmptyStateMessage = (filterStatus, constants = null) => {
  const messages = constants?.emptyMessages || getDefaultConstants().emptyMessages;
  return messages[filterStatus] || messages.all;
};


export const getStatusOptions = (constants = null) => {
  const statuses = constants?.taskStatuses || getDefaultConstants().taskStatuses;
  return Object.entries(statuses).map(([key, value]) => ({
    value: key,
    label: value.label
  }));
};
