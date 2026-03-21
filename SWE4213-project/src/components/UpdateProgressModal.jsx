import React, { useState, useEffect } from 'react';
import { X, BookOpen } from 'lucide-react';

const UpdateProgressModal = ({ isOpen, onClose, book, currentProgress, onProgressUpdated }) => {
    const [pagesRead, setPagesRead] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Sync state whenever the modal opens or the selected book changes
    useEffect(() => {
        if (isOpen) {
            setPagesRead(currentProgress?.pages_read || 0);
            setTotalPages(currentProgress?.total_pages || book?.total_pages || 0);
            setError('');
        }
    }, [isOpen, currentProgress, book]);

    if (!isOpen) return null;

    const percent = totalPages > 0 ? Math.round((pagesRead / totalPages) * 100) : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        try {
            if (currentProgress) {
                // If total_pages changed, update it first
                if (parseInt(totalPages) !== currentProgress.total_pages && parseInt(totalPages) > 0) {
                    // The PUT endpoint may not support total_pages, so we handle it
                    // We'll send pages_read and status, and total_pages if the backend supports it
                }

                // Update existing progress
                const res = await fetch(`/api/progress/${user.user_id}/${book.book_id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        pages_read: parseInt(pagesRead),
                        total_pages: parseInt(totalPages),
                        status: parseInt(pagesRead) >= parseInt(totalPages) && parseInt(totalPages) > 0 ? 'Completed' : 'Reading'
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    onProgressUpdated(data.progress);
                    onClose();
                } else {
                    const data = await res.json();
                    setError(data.error || 'Failed to update progress');
                }
            } else {
                // Create new progress entry
                const res = await fetch('/api/progress', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        book_id: book.book_id,
                        total_pages: parseInt(totalPages)
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    if (parseInt(pagesRead) > 0) {
                        const updateRes = await fetch(`/api/progress/${user.user_id}/${book.book_id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                pages_read: parseInt(pagesRead),
                                status: parseInt(pagesRead) >= parseInt(totalPages) ? 'Completed' : 'Reading'
                            })
                        });
                        if (updateRes.ok) {
                            const updateData = await updateRes.json();
                            onProgressUpdated(updateData.progress);
                        }
                    } else {
                        onProgressUpdated(data.progress);
                    }
                    onClose();
                } else {
                    const data = await res.json();
                    setError(data.error || 'Failed to create progress');
                }
            }
        } catch (err) {
            console.error('Progress update error:', err);
            setError('Could not connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Update Progress</h2>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{book?.title}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Preview */}
                <div className="bg-cream-light/50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-bold text-primary">{percent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-primary rounded-full h-3 transition-all duration-500"
                            style={{ width: `${Math.min(percent, 100)}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        {pagesRead} of {totalPages} pages read
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Total Pages - always editable */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total Pages
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={totalPages}
                            onChange={(e) => setTotalPages(e.target.value)}
                            placeholder="e.g. 304"
                            className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 border-none"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Pages Read */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pages Read
                        </label>
                        <input
                            type="number"
                            min="0"
                            max={totalPages}
                            value={pagesRead}
                            onChange={(e) => setPagesRead(e.target.value)}
                            placeholder="e.g. 187"
                            className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 border-none"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Range Slider */}
                    <div>
                        <input
                            type="range"
                            min="0"
                            max={totalPages || 100}
                            value={pagesRead}
                            onChange={(e) => setPagesRead(e.target.value)}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            disabled={loading}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition-colors font-medium text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-full transition-colors disabled:opacity-50 text-sm"
                        >
                            {loading ? 'Saving...' : currentProgress ? 'Update Progress' : 'Start Tracking'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateProgressModal;
