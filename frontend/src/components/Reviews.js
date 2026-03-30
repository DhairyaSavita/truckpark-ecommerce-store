import React, { useState, useEffect } from 'react';
import { productReviews } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Reviews = ({ productId }) => {
  const { user } = useAuth();
  const [reviewList, setReviewList] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await productReviews.getByProduct(productId);
      setReviewList(response.data.reviews || []);
      setAverageRating(response.data.averageRating || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await productReviews.add({
        product_id: productId,
        ...newReview
      });
      toast.success('Review submitted successfully');
      setShowForm(false);
      setNewReview({ rating: 5, title: '', comment: '' });
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit review');
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      i < rating ? 
        <StarIcon key={i} className="h-5 w-5 text-yellow-400 inline" /> :
        <StarOutline key={i} className="h-5 w-5 text-gray-300 inline" />
    ));
  };

  if (loading) return <div className="text-center py-4">Loading reviews...</div>;

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        {user && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Average Rating */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex items-center">
          <div className="text-4xl font-bold mr-4">{averageRating.toFixed(1)}</div>
          <div>
            <div className="flex">{renderStars(Math.round(averageRating))}</div>
            <div className="text-sm text-gray-600">Based on {reviewList.length} reviews</div>
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="bg-white border rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">Write Your Review</h3>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-3">
              <label className="block text-gray-700 mb-1">Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className="focus:outline-none"
                  >
                    {star <= newReview.rating ? 
                      <StarIcon className="h-8 w-8 text-yellow-400" /> :
                      <StarOutline className="h-8 w-8 text-gray-300" />
                    }
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Review Title"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div className="mb-3">
              <textarea
                placeholder="Your review"
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                rows="4"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Submit Review</button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviewList.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to review!</p>
        ) : (
          reviewList.map((review) => (
            <div key={review.id} className="border-b pb-4">
              <div className="flex items-center mb-2">
                <div className="flex mr-3">{renderStars(review.rating)}</div>
                <span className="font-semibold">{review.title}</span>
              </div>
              <p className="text-gray-700 mb-2">{review.comment}</p>
              <div className="text-sm text-gray-500">
                By {review.User?.name} • {new Date(review.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reviews;
