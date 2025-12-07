import React, { useState, useEffect } from "react";
import {
  Star,
  MessageCircle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Send,
  Trash2,
  Eye,
  Clock,
  User,
  Mail,
  Package,
  Calendar,
  TrendingUp,
  AlertCircle,
  X
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

const ProductReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    averageRating: 0
  });

  useEffect(() => {
    fetchReviews();
  }, [statusFilter, ratingFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("product_reviews")
        .select(`*, products(id, name, image_url)`)
        .order("created_at", { ascending: false });

      if (statusFilter === "pending") {
        query = query.eq("is_approved", false);
      } else if (statusFilter === "approved") {
        query = query.eq("is_approved", true);
      }

      if (ratingFilter !== "all") {
        query = query.eq("rating", parseInt(ratingFilter));
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setReviews(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const pending = data?.filter(r => !r.is_approved).length || 0;
      const approved = data?.filter(r => r.is_approved).length || 0;
      const avgRating = total > 0 ? (data.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) : 0;
      
      setStats({ total, pending, approved, averageRating: avgRating });
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId) => {
    try {
      const { error } = await supabase
        .from("product_reviews")
        .update({ is_approved: true })
        .eq("id", reviewId);
      
      if (error) throw error;
      fetchReviews();
    } catch (error) {
      console.error("Error approving review:", error);
    }
  };

  const handleReject = async (reviewId) => {
    try {
      const { error } = await supabase
        .from("product_reviews")
        .update({ is_approved: false })
        .eq("id", reviewId);
      
      if (error) throw error;
      fetchReviews();
    } catch (error) {
      console.error("Error rejecting review:", error);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    
    try {
      const { error } = await supabase
        .from("product_reviews")
        .delete()
        .eq("id", reviewId);
      
      if (error) throw error;
      fetchReviews();
      setSelectedReview(null);
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const handleReply = async () => {
    if (!selectedReview || !replyText.trim()) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("product_reviews")
        .update({
          admin_reply: replyText,
          admin_reply_at: new Date().toISOString(),
          admin_reply_by: user?.id
        })
        .eq("id", selectedReview.id);
      
      if (error) throw error;
      
      setReplyText("");
      fetchReviews();
      setSelectedReview(null);
    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.review_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.products?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Product Reviews
          </h1>
          <p className="text-gray-500 mt-1">Manage customer reviews and feedback</p>
        </div>
        <button
          onClick={fetchReviews}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating} ★</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by customer, product, or review text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
          
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <MessageCircle className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-xl font-medium">No reviews found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="p-6 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Product Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {review.products?.image_url ? (
                      <img
                        src={review.products.image_url}
                        alt={review.products.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {review.products?.name || "Unknown Product"}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          {renderStars(review.rating)}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            review.is_approved 
                              ? "bg-green-100 text-green-700" 
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {review.is_approved ? "Approved" : "Pending"}
                          </span>
                          {review.is_verified_purchase && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!review.is_approved && (
                          <button
                            onClick={() => handleApprove(review.id)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {review.is_approved && (
                          <button
                            onClick={() => handleReject(review.id)}
                            className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                            title="Unapprove"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedReview(review);
                            setReplyText(review.admin_reply || "");
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Reply"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Customer Info */}
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {review.customer_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {review.customer_email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {/* Review Title & Text */}
                    {review.title && (
                      <p className="font-medium text-gray-800 mt-3">{review.title}</p>
                    )}
                    <p className="text-gray-600 mt-2 leading-relaxed">{review.review_text}</p>
                    
                    {/* Admin Reply */}
                    {review.admin_reply && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 text-blue-700 text-sm font-medium mb-2">
                          <MessageCircle className="w-4 h-4" />
                          Store Response
                          {review.admin_reply_at && (
                            <span className="text-blue-500 font-normal">
                              • {new Date(review.admin_reply_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-blue-800 text-sm">{review.admin_reply}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Reply to Review</h3>
              <button
                onClick={() => setSelectedReview(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-900">{selectedReview.customer_name}</span>
                {renderStars(selectedReview.rating)}
              </div>
              <p className="text-gray-600 text-sm">{selectedReview.review_text}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Reply
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Write a helpful response to this review..."
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedReview(null)}
                className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                disabled={submitting || !replyText.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Reply
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
