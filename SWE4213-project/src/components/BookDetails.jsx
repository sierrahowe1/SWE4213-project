import React, { useState, useEffect } from 'react';
import ReviewCard from './ReviewCard';
import { StarRating } from './BookCard';
import { ArrowLeft, Plus } from 'lucide-react';

const BookDetails = ({ book, user, onBack }) => {
    const [reviews, setReviews] = useState([]);
    const [userNames, setUserNames] = useState({});
    const [loading, setLoading] = useState(true);
    const [newRating, setNewRating] = useState(5);
    const [newReviewText, setNewReviewText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [userBookStatus, setUserBookStatus] = useState({ want_to_read: false, have_read: false });
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);

    const fetchBookData = async () => {
        try {
            const res = await fetch(`/api/reviews/book/${book.book_id}`);
            const data = await res.json();
            setReviews(data);

            // Fetch user names for each review
            const uniqueUserIds = [...new Set(data.map((r) => r.user_id))];
            const names = {};
            await Promise.all(
                uniqueUserIds.map(async (userId) => {
                    try {
                        const userRes = await fetch(`/api/users/${userId}`);
                        if (userRes.ok) {
                            const userData = await userRes.json();
                            names[userId] = `${userData.first_name} ${userData.last_name}`;
                        }
                    } catch (e) {
                        names[userId] = `User ${userId}`;
                    }
                })
            );
            setUserNames(names);

            // Fetch user book status and progress
            if (user) {
                const token = localStorage.getItem('token');

                // User books
                const userBooksRes = await fetch(`/api/userBooks/${user.user_id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (userBooksRes.ok) {
                    const userBooksData = await userBooksRes.json();
                    const currentStatus = userBooksData.books?.find((ub) => ub.book_id === book.book_id);
                    if (currentStatus) {
                        setUserBookStatus({
                            want_to_read: currentStatus.want_to_read,
                            have_read: currentStatus.have_read,
                        });
                    }
                }


            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookData();
    }, [book.book_id, user?.user_id]);

    const addBookToUserList = async (token, statusObj) => {
        // Try to add the book to user's list
        const addRes = await fetch(`/api/userBooks/${user.user_id}/books`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                book_id: book.book_id,
                want_to_read: statusObj.want_to_read,
                have_read: statusObj.have_read
            })
        });

        if (addRes.status === 409) {
            // Already in list — update
            await fetch(`/api/userBooks/${user.user_id}/books/${book.book_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    want_to_read: statusObj.want_to_read,
                    have_read: statusObj.have_read
                })
            });
        }
    };


    const handleToggleStatus = async (type) => {
        setUpdatingStatus(true);
        const token = localStorage.getItem('token');
        const newStatus = { ...userBookStatus };

        if (type === 'want') {
            newStatus.want_to_read = !newStatus.want_to_read;
            if (newStatus.want_to_read) newStatus.have_read = false;
        } else if (type === 'read') {
            newStatus.have_read = !newStatus.have_read;
            if (newStatus.have_read) newStatus.want_to_read = false;
        }

        try {
            await addBookToUserList(token, newStatus);
            setUserBookStatus(newStatus);

        } catch (err) {
            console.error('Failed to update status', err);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    book_id: book.book_id,
                    rating: newRating,
                    review_text: newReviewText || undefined,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setNewRating(5);
                setNewReviewText('');
                setShowReviewForm(false);
                fetchBookData();
            } else {
                setSubmitError(data.error || 'Failed to submit review');
            }
        } catch (err) {
            setSubmitError('Could not connect to the server');
        } finally {
            setSubmitting(false);
        }
    };


    const hasReviewed = reviews.some((r) => r.user_id === user?.user_id);
    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;



    return (
        <div className="min-h-screen bg-cream">
            <div className="max-w-3xl mx-auto px-4 py-6">
                {/* Back button */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium text-sm">Back to Dashboard</span>
                </button>

                {/* Book Hero Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-6 border border-gray-100">
                    <div className="flex flex-col sm:flex-row gap-6">
                        {/* Cover */}
                        <div className="w-40 h-56 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-md mx-auto sm:mx-0">
                            {book.cover_url ? (
                                <img
                                    src={book.cover_url}
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div
                                className={`w-full h-full ${book.cover_url ? 'hidden' : 'flex'} items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40`}
                            >
                                <span className="text-5xl">📖</span>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            {book.genre && (
                                <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                                    {book.genre}
                                </span>
                            )}
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{book.title}</h1>
                            <p className="text-gray-500 mb-3 text-lg">by {book.author}</p>

                            {avgRating > 0 && (
                                <div className="flex items-center gap-2 mb-3">
                                    <StarRating rating={avgRating} size="md" />
                                    <span className="text-sm text-gray-500">({avgRating.toFixed(1)} / 5)</span>
                                </div>
                            )}

                            {book.summary && (
                                <p className="text-gray-600 text-sm leading-relaxed mb-4">{book.summary}</p>
                            )}

                            {/* Status Toggles */}
                            {user && (
                                <div className="flex gap-3 flex-wrap mb-4">
                                    <button
                                        onClick={() => handleToggleStatus('want')}
                                        disabled={updatingStatus}
                                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${userBookStatus.want_to_read
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {userBookStatus.want_to_read ? '✓ Want to Read' : '+ Want to Read'}
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus('read')}
                                        disabled={updatingStatus}
                                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${userBookStatus.have_read
                                            ? 'bg-green-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {userBookStatus.have_read ? '✓ Finished Reading' : 'Mark as Read'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">
                            Reviews {reviews.length > 0 && <span className="text-gray-400 font-normal">({reviews.length})</span>}
                        </h2>

                        {user && !hasReviewed && !showReviewForm && (
                            <button
                                onClick={() => setShowReviewForm(true)}
                                className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add a Review
                            </button>
                        )}
                    </div>

                    {/* Add Review Form */}
                    {showReviewForm && (
                        <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
                            <h3 className="text-base font-semibold text-gray-800 mb-4">Write a Review</h3>

                            <form onSubmit={handleSubmitReview} className="space-y-4">
                                {submitError && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
                                        {submitError}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                                    <StarRating
                                        rating={newRating}
                                        size="lg"
                                        interactive={true}
                                        onRate={setNewRating}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Review (optional)</label>
                                    <textarea
                                        placeholder="Share your thoughts about this book..."
                                        value={newReviewText}
                                        onChange={(e) => setNewReviewText(e.target.value)}
                                        rows={3}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none bg-white"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowReviewForm(false)}
                                        className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-6 rounded-full transition-colors disabled:opacity-50 text-sm"
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Reviews List */}
                    {loading ? (
                        <div className="text-gray-400 text-center py-10">
                            <div className="w-6 h-6 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
                            Loading reviews...
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <span className="text-4xl block mb-3">💬</span>
                            <p className="font-medium">No reviews yet</p>
                            <p className="text-sm mt-1">Be the first to share your thoughts!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <ReviewCard
                                    key={review.review_id}
                                    review={review}
                                    userName={userNames[review.user_id]}
                                    currentUser={user}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>


        </div>
    );
};

export default BookDetails;
