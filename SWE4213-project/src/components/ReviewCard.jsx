import React, { useState, useEffect } from 'react';
import { StarRating } from './BookCard';
import { ThumbsUp, MessageCircle } from 'lucide-react';

const ReviewCard = ({ review, userName, currentUser }) => {
    const [likesCount, setLikesCount] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [newCommentText, setNewCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [commentUserNames, setCommentUserNames] = useState({});

    const timeAgo = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays < 1) return 'Today';
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
        return `${Math.floor(diffDays / 365)}y ago`;
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getAvatarColor = (name) => {
        const colors = [
            'bg-primary/80 text-white',
            'bg-blue-500 text-white',
            'bg-purple-500 text-white',
            'bg-amber-500 text-white',
            'bg-rose-500 text-white',
            'bg-emerald-500 text-white',
        ];
        const idx = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        return colors[idx % colors.length];
    };

    useEffect(() => {
        let isMounted = true;

        const fetchLikes = async () => {
            try {
                const url = `/api/reviews/${review.review_id}/likes${currentUser ? `?userId=${currentUser.user_id}` : ''}`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted) {
                        setLikesCount(data.count);
                        setHasLiked(data.hasLiked);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch likes');
            }
        };

        fetchLikes();

        return () => { isMounted = false; };
    }, [review.review_id, currentUser]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/reviews/${review.review_id}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);

                const uniqueUserIds = [...new Set(data.map((c) => c.user_id))];
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
                setCommentUserNames(names);
            }
        } catch (err) {
            console.error('Failed to fetch comments');
        }
    };

    const handleToggleLike = async () => {
        if (!currentUser) return;

        const previouslyLiked = hasLiked;
        setHasLiked(!previouslyLiked);
        setLikesCount(prev => previouslyLiked ? prev - 1 : prev + 1);

        try {
            const res = await fetch(`/api/reviews/${review.review_id}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: currentUser.user_id })
            });
            if (!res.ok) {
                setHasLiked(previouslyLiked);
                setLikesCount(prev => previouslyLiked ? prev + 1 : prev - 1);
            }
        } catch (err) {
            setHasLiked(previouslyLiked);
            setLikesCount(prev => previouslyLiked ? prev + 1 : prev - 1);
        }
    };

    const handleToggleComments = () => {
        const willShow = !showComments;
        setShowComments(willShow);
        if (willShow && comments.length === 0) {
            fetchComments();
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newCommentText.trim() || !currentUser) return;

        setSubmittingComment(true);
        try {
            const res = await fetch(`/api/reviews/${review.review_id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: currentUser.user_id,
                    comment_text: newCommentText
                })
            });
            if (res.ok) {
                setNewCommentText('');
                fetchComments();
            }
        } catch (err) {
            console.error('Failed to post comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    return (
        <div className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-3">
                {/* User Avatar */}
                <div className={`w-10 h-10 rounded-full ${getAvatarColor(userName)} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                    {getInitials(userName)}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800 text-sm">{userName || 'User'}</span>
                        <span className="text-xs text-gray-400">{timeAgo(review.created_at)}</span>
                    </div>

                    <div className="mb-2">
                        <StarRating rating={review.rating} size="sm" />
                    </div>

                    {review.review_text && (
                        <p className="text-gray-600 text-sm leading-relaxed">{review.review_text}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-5 mt-3 pt-3 border-t border-gray-50">
                        <button
                            onClick={handleToggleLike}
                            disabled={!currentUser}
                            className={`flex items-center gap-1.5 text-sm transition-colors group ${hasLiked ? 'text-primary font-medium' : 'text-gray-400 hover:text-primary'} ${!currentUser && 'opacity-50 cursor-not-allowed'}`}
                        >
                            <ThumbsUp className={`w-4 h-4 group-hover:scale-110 transition-transform ${hasLiked ? 'fill-current' : ''}`} />
                            {likesCount > 0 ? `${likesCount}` : 'Like'}
                        </button>
                        <button
                            onClick={handleToggleComments}
                            className={`flex items-center gap-1.5 text-sm transition-colors group ${showComments ? 'text-primary font-medium' : 'text-gray-400 hover:text-primary'}`}
                        >
                            <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            {comments.length > 0 ? `${comments.length}` : 'Comment'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-4 pt-4 border-t border-gray-50 ml-13 pl-3">
                    {comments.length === 0 ? (
                        <p className="text-sm text-gray-400 italic mb-3">No comments yet</p>
                    ) : (
                        <div className="space-y-3 mb-4">
                            {comments.map(comment => (
                                <div key={comment.comment_id} className="flex gap-2.5 items-start">
                                    <div className={`w-7 h-7 rounded-full ${getAvatarColor(commentUserNames[comment.user_id])} flex items-center justify-center font-bold text-[10px] flex-shrink-0`}>
                                        {getInitials(commentUserNames[comment.user_id])}
                                    </div>
                                    <div className="bg-gray-50 rounded-lg px-3 py-2 flex-1">
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-medium text-xs text-gray-800">{commentUserNames[comment.user_id] || 'User'}</span>
                                            <span className="text-[10px] text-gray-400">{timeAgo(comment.created_at)}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-0.5">{comment.comment_text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {currentUser ? (
                        <form onSubmit={handleSubmitComment} className="flex gap-2">
                            <input
                                type="text"
                                value={newCommentText}
                                onChange={(e) => setNewCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                disabled={submittingComment}
                            />
                            <button
                                type="submit"
                                disabled={submittingComment || !newCommentText.trim()}
                                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                Post
                            </button>
                        </form>
                    ) : (
                        <p className="text-xs text-gray-400 italic">Login to add a comment.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReviewCard;
