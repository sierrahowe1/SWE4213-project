import { useState, useEffect } from 'react';
import { Search, Bell } from 'lucide-react';
import BookCard from './BookCard';
import AddBookModal from './AddBookModal';

const Dashboard = ({ onBookSelect, onUpdateStatus }) => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);

    const filteredBooks = books.filter(book => {
        const match = search.toLowerCase();
        return (
            book.title.toLowerCase().includes(match) ||
            book.author.toLowerCase().includes(match) ||
            (book.genre && book.genre.toLowerCase().includes(match))
        );
    });

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await fetch('http://localhost:3002/books');
                if (res.ok) {
                    const data = await res.json();
                    setBooks(data);
                }
            } catch (err) {
                console.error("Error fetching books:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, []);

    const handleBookAdded = (newBook) => {
        setBooks([newBook, ...books]);
        // Optional: Show a success toast here
    };

    if (loading) return (
        <div className="min-h-screen bg-[#E5C4B0] flex items-center justify-center">
            <div className="text-gray-600 text-lg">Loading dashboard...</div>
        </div>
    );

    return (
        <>
            <div className="min-h-screen bg-[#E5C4B0] p-6">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        {/* Search Bar */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by title, author, or genre..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-full bg-white/80 border-none focus:outline-none focus:ring-2 focus:ring-teal-600/40 text-gray-800 placeholder-gray-400"
                            />
                        </div>

                        {/* Filter Button */}
                        <button
                            onClick={() => setFilterOpen(!filterOpen)}
                            className="px-6 py-4 rounded-full bg-white/80 hover:bg-white transition-colors text-gray-700"
                        >
                            Filter/Sort by...
                        </button>

                        {/* Notification Bell */}
                        <button className="relative p-4 rounded-full bg-white/80 hover:bg-white transition-colors">
                            <Bell className="w-5 h-5 text-gray-700" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    </div>

                    {/* Books List */}
                    <div className="mb-24">
                        {filteredBooks.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600 text-lg">No books found</p>
                                <p className="text-gray-500 text-sm mt-1">
                                    {search ? 'Try a different search term' : 'Click "Add Book" to get started'}
                                </p>
                            </div>
                        ) : (
                            filteredBooks.map((book) => (
                                <BookCard
                                    key={book.book_id}
                                    book={book}
                                    onUpdateStatus={onUpdateStatus}
                                />
                            ))
                        )}
                    </div>

                    {/* Add Book Button - Fixed at bottom right */}
                    <button
                        onClick={() => setIsAddBookModalOpen(true)}
                        className="fixed bottom-8 right-8 bg-teal-700 hover:bg-teal-800 text-white font-semibold px-10 py-4 rounded-full transition-colors shadow-lg text-lg"
                    >
                        Add Book
                    </button>
                </div>
            </div>

            {/* Add Book Modal */}
            <AddBookModal
                isOpen={isAddBookModalOpen}
                onClose={() => setIsAddBookModalOpen(false)}
                onBookAdded={handleBookAdded}
            />
        </>
    );
}

export default Dashboard;