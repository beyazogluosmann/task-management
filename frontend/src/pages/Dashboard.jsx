import { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { taskAPI, statsAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useTaskOperations } from '../hooks/useTaskOperations';

export default function Dashboard() {

    const { user, logout } = useContext(AuthContext)

    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');


    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        status: 'pending'
    });

    const filteredTasks = useMemo(() => {
        let filtered = filterStatus === 'all'
            ? tasks
            : tasks.filter(task => task.status === filterStatus);


        if (searchTerm.trim()) {
            filtered = filtered.filter(task =>
                task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [tasks, filterStatus, searchTerm]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const requests = [
                taskAPI.getTasks(),
                statsAPI.getStats()
            ];

            if (user?.role === 'admin') {
                requests.push(userAPI.getUsers());
            }

            const responses = await Promise.all(requests);

            setTasks(responses[0].data.tasks);
            setStats(responses[1].data);

            if (user?.role === 'admin' && responses[2]) {
                setUsers(responses[2].data.users);
            }

            setLoading(false);
        } catch (error) {
            toast.error('Veriler yüklenemedi');
            setLoading(false);
        }
    };

    const { handleDeleteTask } = useTaskOperations(fetchData);

    const handleLogout = () => {
        logout();
        toast.success('Çıkış yapıldı');
    };

    const handleAddTask = async (e) => {
        e.preventDefault();

        if (!newTask.title) {
            toast.error('Başlık gerekli');
            return;
        }

        if (!newTask.description) {
            toast.error('Açıklama gerekli');
            return;
        }

        if (user?.role === 'admin' && !newTask.assignedTo) {
            toast.error('Kullanıcı seçmelisiniz');
            return;
        }

        try {
            await taskAPI.createTask(newTask);
            toast.success('Task eklendi');
            setShowAddModal(false);
            setNewTask({
                title: '',
                description: '',
                status: 'pending'
            });
            fetchData();
        } catch (error) {
            toast.error('Task eklenemedi');
        }
    };

    const handleEditClick = (task) => {
        setEditingTask(task);
        setShowEditModal(true);
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();

        if (!editingTask.title) {
            toast.error('Başlık gerekli');
            return;
        }

        if (!editingTask.description) {
            toast.error('Açıklama gerekli');
            return;
        }

        try {
            await taskAPI.updateTask(editingTask._id, editingTask);
            toast.success('Task güncellendi');
            setShowEditModal(false);
            setEditingTask(null);
            fetchData();
        } catch (error) {
            toast.error('Task güncellenemedi');
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
                {/* İstatistikler */}
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

                {/* Task Listesi */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Görevler</h2>
                            {user?.role === 'admin' && (
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    + Yeni Task Ekle
                                </button>
                            )}
                        </div>

                        <div className="mb-4 flex items-center gap-2">
                            <span className="text-2xl">🔍</span>
                            <input
                                type="text"
                                placeholder="Task ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                            />
                        </div>

                        {/* Filter Dropdown */}
                        <div className="flex items-center gap-2">
                            <span className="text-2xl"></span>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Tümü ({tasks.length})</option>
                                <option value="pending">Bekleyen ({tasks.filter(t => t.status === 'pending').length})</option>
                                <option value="in_progress">Devam Eden ({tasks.filter(t => t.status === 'in_progress').length})</option>
                                <option value="completed">Tamamlanan ({tasks.filter(t => t.status === 'completed').length})</option>
                            </select>
                        </div>
                    </div>
                    <div className="divide-y">
                        {filteredTasks.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                {filterStatus === 'all' ? 'Henüz görev yok' : 'Bu durumda görev yok'}
                            </div>
                        ) : (
                            filteredTasks.map((task) => (
                                <div key={task._id} className="p-4 hover:bg-gray-50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold">{task.title}</h3>
                                            <p className="text-gray-600 text-sm">{task.description}</p>
                                            <p className="text-gray-400 text-xs mt-2">
                                                Oluşturulma: {new Date(task.createdAt).toLocaleDateString('tr-TR')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {task.status === 'completed' ? 'Tamamlandı' :
                                                    task.status === 'in_progress' ? 'Devam Ediyor' :
                                                        'Beklemede'}
                                            </span>

                                            {user?.role === 'admin' && (
                                                <>
                                                    <button
                                                        onClick={() => handleEditClick(task)}
                                                        className="text-blue-500 hover:text-blue-700"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTask(task._id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        🗑️
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Yeni Task Modal */}
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

            {/* Edit Task Modal */}
            {showEditModal && editingTask && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Task Düzenle</h3>

                        <form onSubmit={handleUpdateTask}>
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