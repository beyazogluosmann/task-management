import express from 'express';

const router = express.Router();

const TASK_STATUSES = {
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
};

const EMPTY_MESSAGES = {
  all: 'Henüz görev yok',
  pending: 'Beklemede görev yok',
  in_progress: 'Devam eden görev yok',
  completed: 'Tamamlanan görev yok'
};

const PAGINATION = {
  defaultLimit: 50,
  defaultPage: 1
};


router.get('/app', (req, res) => {
  res.status(200).json({
    message: 'App constants retrieved successfully',
    data: {
      taskStatuses: TASK_STATUSES,
      emptyMessages: EMPTY_MESSAGES,
      pagination: PAGINATION
    }
  });
});


router.get('/task-statuses', (req, res) => {
  res.status(200).json({
    message: 'Task statuses retrieved successfully',
    data: TASK_STATUSES
  });
});

router.get('/empty-messages', (req, res) => {
  res.status(200).json({
    message: 'Empty messages retrieved successfully',
    data: EMPTY_MESSAGES
  });
});

router.get('/pagination', (req, res) => {
  res.status(200).json({
    message: 'Pagination config retrieved successfully',
    data: PAGINATION
  });
});

export default router;
