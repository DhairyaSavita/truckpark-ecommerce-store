import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { forumAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { HeartIcon, ChatBubbleLeftIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const ForumPost = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await forumAPI.getPost(id);
      setPost(response.data.post);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Failed to load post');
      navigate('/forum');
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }
    try {
      await forumAPI.likePost(id);
      setPost({ ...post, likes: (post.likes || 0) + 1 });
      toast.success('Liked!');
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to comment');
      return;
    }
    
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Adding comment to post:', id);
      console.log('Comment content:', newComment);
      console.log('User:', user);
      
      const response = await forumAPI.addComment(id, newComment);
      console.log('Comment response:', response.data);
      
      setComments([response.data, ...comments]);
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(error.response?.data?.error || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await forumAPI.likeComment(commentId);
      setComments(comments.map(c => 
        c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c
      ));
    } catch (error) {
      console.error('Error liking comment:', error);
      toast.error('Failed to like comment');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="text-center py-10">Loading post...</div>;
  }

  if (!post) {
    return <div className="text-center py-10">Post not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/forum" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Forum
      </Link>

      {/* Post Content */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {post.is_pinned && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">📌 Pinned</span>
              )}
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {post.category}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
          </div>
          <button
            onClick={handleLikePost}
            className="flex items-center space-x-1 text-gray-500 hover:text-red-500"
          >
            <HeartIcon className="h-6 w-6" />
            <span>{post.likes || 0}</span>
          </button>
        </div>

        <div className="prose max-w-none mb-4">
          <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
          <div>
            Posted by <span className="font-semibold">{post.User?.store_name || post.User?.name}</span>
          </div>
          <div>{formatDate(post.created_at)}</div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">
          Comments ({comments.length})
        </h2>

        {/* Add Comment Form */}
        {user && (user.role === 'seller' || user.role === 'admin') && (
          <form onSubmit={handleAddComment} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment..."
              rows="3"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{comment.User?.store_name || comment.User?.name}</span>
                      <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-red-500 ml-4"
                  >
                    <HeartIcon className="h-4 w-4" />
                    <span className="text-sm">{comment.likes || 0}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumPost;
