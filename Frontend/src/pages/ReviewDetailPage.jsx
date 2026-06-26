import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import api from '../utils/api.js';
import { Share2, Download, Trash2, ArrowLeft } from 'lucide-react';

export default function ReviewDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const response = await api.get(`/ai/history/${id}`);
        setReview(response.data.review);
      } catch (err) {
        setError('Failed to load review');
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [id]);

  const handleShare = useCallback(async () => {
    if (!review) return;
    try {
      const response = await api.post(`/ai/share/${review._id}`);
      const shareUrl = `${window.location.origin}/shared/${response.data.shareToken}`;
      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    } catch (err) {
      alert('Failed to share review');
    }
  }, [review]);

  const handleExport = useCallback(async () => {
    if (!review) return;
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
  }, [review]);

  const handleDelete = useCallback(async () => {
    if (!review) return;
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/ai/history/${review._id}`);
      navigate('/history');
    } catch (err) {
      alert('Failed to delete review');
    }
  }, [review, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Review not found'}</p>
          <button
            onClick={() => navigate('/history')}
            className="text-indigo-400 hover:text-indigo-300"
          >
            Back to History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/history')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a1a] border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a1a] border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Meta Info */}
        <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] p-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <span className="text-zinc-400 text-sm">Language:</span>
              <span className="ml-2 text-white capitalize">{review.language}</span>
            </div>
            <div>
              <span className="text-zinc-400 text-sm">Profile:</span>
              <span className="ml-2 text-white capitalize">{review.reviewProfile}</span>
            </div>
            <div>
              <span className="text-zinc-400 text-sm">Date:</span>
              <span className="ml-2 text-white">{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              review.severityScore >= 70 ? 'text-green-400 bg-green-400/10' :
              review.severityScore >= 40 ? 'text-yellow-400 bg-yellow-400/10' :
              'text-red-400 bg-red-400/10'
            }`}>
              Score: {review.severityScore}/100
            </div>
          </div>
          {review.issueCount && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-zinc-800">
              <span className="text-sm text-red-400">🔴 Critical: {review.issueCount.critical || 0}</span>
              <span className="text-sm text-yellow-400">🟡 Warning: {review.issueCount.warning || 0}</span>
              <span className="text-sm text-blue-400">🔵 Info: {review.issueCount.info || 0}</span>
            </div>
          )}
        </div>

        {/* Code */}
        <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] overflow-hidden mb-6">
          <div className="border-b border-zinc-800 px-6 py-4">
            <h2 className="font-semibold text-white">Code</h2>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm text-zinc-300 font-mono whitespace-pre-wrap">{review.code}</pre>
          </div>
        </div>

        {/* Review */}
        <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] overflow-hidden">
          <div className="border-b border-zinc-800 px-6 py-4">
            <h2 className="font-semibold text-white">AI Review</h2>
          </div>
          <div className="p-6">
            <div className="markdown-body prose prose-invert max-w-none">
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{review.result}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
