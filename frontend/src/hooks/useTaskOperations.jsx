import { useCallback } from 'react';
import { taskAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useTaskOperations = (fetchData) => {
    const handleDeleteTask = useCallback((taskId) => {
        toast.custom((t) => (
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm border-l-4 border-red-500 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start gap-4">
                    <div className="text-red-500 text-2xl">⚠️</div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-2">Task Silinsin mi?</h3>
                        <p className="text-gray-600 text-sm mb-4">Bu işlem geri alınamaz. Devam etmek istediğinize emin misiniz?</p>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={async () => {
                                    try {
                                        await taskAPI.deleteTask(taskId);
                                        toast.dismiss(t.id);
                                        toast.success('Task silindi ✓', {
                                            icon: '🗑️',
                                            position: 'top-center'
                                        });
                                        fetchData();
                                    } catch (error) {
                                        toast.error('Task silinemedi ✗');
                                    }
                                }}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                            >
                                Sil
                            </button>
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        ), {
            duration: 10000,
            position: 'top-center'
        });
    }, [fetchData]);

    return { handleDeleteTask };
};
