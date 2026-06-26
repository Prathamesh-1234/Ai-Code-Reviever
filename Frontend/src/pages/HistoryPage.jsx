import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../utils/api';
import { Calendar, Filter, Trash2, Eye, Share2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HistoryPage() {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [language, setLanguage] = useState('');
  const [reviewProfile, setReviewProfile] = useState('');
  const navigate = useNavigate();

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(language && { language }),
        ...(reviewProfile && { reviewProfile }),
        sort: '-createdAt',
      });
      const response = await api.get(`/ai/history?${params}`);
      setReviews(response.data.reviews || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, language, reviewProfile]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const totalPages = Math.ceil(total / limit);

  const handleDelete = useCallback(async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/ai/history/${id}`);
      fetchReviews();
    } catch (err) {
      alert('Failed to delete review');
    }
  }, [fetchReviews]);

  const handleShare = useCallback(async (review) => {
    try {
      const response = await api.post(`/ai/share/${review._id}`);
      const shareUrl = `${window.location.origin}/shared/${response.data.shareToken}`;
      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    } catch (err) {
      alert('Failed to share review');
    }
  }, []);

  const handleExport = useCallback(async (review) => {
    try {
      const response = await api.get(`/ai/export/${review._id}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `review-${review._id}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export review');
    }
  }, []);

  const languages = useMemo(() => {
    const langs = [...new Set(reviews.map((r) => r.language))];
    return langs.filter(Boolean);
  }, [reviews]);

  const profiles = useMemo(() => {
    const profs = [...new Set(reviews.map((r) => r.reviewProfile))];
    return profs.filter(Boolean);
  }, [reviews]);

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">Review History</h1>

        {/* Filters */}
        <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] p-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-zinc-400" />
              <span className="text-zinc-300 text-sm">Filters:</span>
            </div>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg bg-[#242424] border border-zinc-800 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Languages</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            <select
              value={reviewProfile}
              onChange={(e) => {
                setReviewProfile(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg bg-[#242424] border border-zinc-800 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Profiles</option>
              {profiles.map((profile) => (
                <option key={profile} value={profile}>
                  {profile}
                </option>
              ))}
            </select>
            {(language || reviewProfile) && (
              <button
                onClick={() => {
                  setLanguage('');
                  setReviewProfile('');
                  setPage(1);
                }}
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#242424]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Language</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Profile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-zinc-400">
                    No reviews found
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review._id} className="hover:bg-[#242424]/50">
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300 capitalize">{review.language}</td>
                    <td className="px-6 py-4 text-sm text-zinc-300 capitalize">{review.reviewProfile}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        review.severityScore >= 70 ? 'text-green-400 bg-green-400/10' :
                        review.severityScore >= 40 ? 'text-yellow-400 bg-yellow-400/10' :
                        'text-red-400 bg-red-400/10'
                      }`}>
                        {review.severityScore}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/review/${review._id}`)}
                          className="p-2 text-zinc-400 hover:text-white transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShare(review)}
                          className="p-2 text-zinc-400 hover:text-white transition-colors"
                          title="Share"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExport(review)}
                          className="p-2 text-zinc-400 hover:text-white transition-colors"
                          title="Export"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-[#1a1a1a] border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-zinc-400 text-sm">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-[#1a1a1a] border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
