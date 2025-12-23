import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { taskAPI, statsAPI, userAPI } from '../services/api';
import { showToast, toastMessages } from '../services/toastService';
import { useTaskOperations } from '../hooks/useTaskOperations';
import { useDebounce } from '../hooks/useDebounce';
import { TaskList } from '../components/TaskList';
import { TaskFilters } from '../components/TaskFilters';
import { TaskPagination } from '../components/TaskPagination';
import { buildTaskQueryParams } from '../utils/taskFilters';

export default function Dashboard() {

    const { user, logout } = useContext(AuthContext)

    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalTasks: 0,
        hasNextPage: false,
        hasPrevPage: false
    });

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        status: 'pending'
    });

    useEffect(() => {
        fetchData();
    }, [filterStatus, debouncedSearchTerm, currentPage]);

    const fetchData = async () => {
        try {
            const params = buildTaskQueryParams(filterStatus, debouncedSearchTerm, 10, currentPage);

            const requests = [
                taskAPI.getTasks(params),
                statsAPI.getStats()
            ];

            if (user?.role === 'admin') {
                requests.push(userAPI.getUsers());
            }

            const [tasksRes, statsRes, usersRes] = await Promise.all(requests);

            setTasks(tasksRes.data.tasks);
            setStats(statsRes.data);
            
            
            if (tasksRes.data.pagination) {
                setPagination(tasksRes.data.pagination);
            }

            if (user?.role === 'admin' && usersRes) {
                setUsers(usersRes.data.users);
            }

            setLoading(false);
        } catch (error) {
            showToast.error(toastMessages.SERVER_ERROR);
            setLoading(false);
        }
    };

    const { handleDeleteTask } = useTaskOperations(fetchData);

    
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLogout = () => {
        logout();
        showToast.success(toastMessages.LOGOUT_SUCCESS);
    };

    const handleAddTask = async (e) => {
        e.preventDefault();

        if (!newTask.title) {
            showToast.error(toastMessages.TITLE_REQUIRED);
            return;
        }

        if (!newTask.description) {
            showToast.error(toastMessages.DESCRIPTION_REQUIRED);
            return;
        }

        if (user?.role === 'admin' && !newTask.assignedTo) {
            showToast.error(toastMessages.USER_REQUIRED);
            return;
        }


        try {
            await taskAPI.createTask(newTask);
            showToast.success(toastMessages.TASK_ADDED);
            setShowAddModal(false);
            setNewTask({
                title: '',
                description: '',
                status: 'pending'
            });
            fetchData();
        } catch (error) {
            console.error('Create task error:', error);
            showToast.error(toastMessages.TASK_ADD_ERROR);
        }
    };

    const handleEditClick = (task) => {
        setEditingTask(task);
        setShowEditModal(true);
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();

        if (user?.role === 'admin') {
            if (!editingTask.title) {
                showToast.error(toastMessages.TITLE_REQUIRED);
                return;
            }

            if (!editingTask.description) {
                showToast.error(toastMessages.DESCRIPTION_REQUIRED);
                return;
            }
        }

        try {
            
            const updateData = user?.role === 'admin'
                ? editingTask
                : { status: editingTask.status };

            console.log('Sending to backend:', updateData);

            await taskAPI.updateTask(editingTask._id, updateData);
            showToast.success(toastMessages.TASK_UPDATED);
            setShowEditModal(false);
            setEditingTask(null);
            fetchData();
        } catch (error) {
            console.error('Update task error:', error);
            showToast.error(toastMessages.TASK_UPDATE_ERROR);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Task Management</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">Merhaba, {user?.name}</span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-gray-500 text-sm">Toplam Task</h3>
                        <p className="text-3xl font-bold">{stats?.tasks?.total || 0}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-gray-500 text-sm">Tamamlanan</h3>
                        <p className="text-3xl font-bold text-green-600">{stats?.tasks?.completed || 0}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-gray-500 text-sm">Devam Eden</h3>
                        <p className="text-3xl font-bold text-blue-600">{stats?.tasks?.in_progress || 0}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-gray-500 text-sm">Bekleyen</h3>
                        <p className="text-3xl font-bold text-yellow-600">{stats?.tasks?.pending || 0}</p>
                    </div>
                </div>

                
                <div className="bg-white rounded-lg shadow">
                    <TaskFilters
                        filterStatus={filterStatus}
                        searchTerm={searchTerm}
                        tasks={tasks}
                        onFilterChange={setFilterStatus}
                        onSearchChange={setSearchTerm}
                        userRole={user?.role}
                        onAddTaskClick={() => setShowAddModal(true)}
                    />
                    <TaskList
                        tasks={tasks}
                        filterStatus={filterStatus}
                        user={user}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteTask}
                    />
                    <TaskPagination
                        pagination={pagination}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>

            
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Yeni Task Ekle</h3>

                        <form onSubmit={handleAddTask}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Başlık</label>
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Task başlığını girin"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Açıklama</label>
                                <textarea
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Task açıklamasını girin"
                                    rows="4"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2">Durum</label>
                                <select
                                    value={newTask.status}
                                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="pending">Beklemede</option>
                                    <option value="in_progress">Devam Ediyor</option>
                                    <option value="completed">Tamamlandı</option>
                                </select>
                            </div>

                            {user?.role === 'admin' && (
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">Atanacak Kişi</label>
                                    <select
                                        value={newTask.assignedTo || ''}
                                        onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Kullanıcı Seçin</option>
                                        {users.map((u) => (
                                            <option key={u._id || u.id} value={u._id || u.id}>
                                                {u.name} ({u.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Kaydet
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                                >
                                    İptal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            
            {showEditModal && editingTask && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Task Düzenle</h3>

                        <form onSubmit={handleUpdateTask}>
                            {user?.role === 'admin' && (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 mb-2">Başlık</label>
                                        <input
                                            type="text"
                                            value={editingTask.title}
                                            onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700 mb-2">Açıklama</label>
                                        <textarea
                                            value={editingTask.description}
                                            onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows="4"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2">Durum</label>
                                <select
                                    value={editingTask.status}
                                    onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="pending">Beklemede</option>
                                    <option value="in_progress">Devam Ediyor</option>
                                    <option value="completed">Tamamlandı</option>
                                </select>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Güncelle
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingTask(null);
                                    }}
                                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                                >
                                    İptal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}