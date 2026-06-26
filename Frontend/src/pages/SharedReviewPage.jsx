import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import api from '../../utils/api';
import { Code2, LogIn } from 'lucide-react';

export default function SharedReviewPage() {
  const { shareToken } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const response = await api.get(`/ai/shared/${shareToken}`);
        setReview(response.data.review);
      } catch (err) {
        setError('Review not found or is no longer shared');
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [shareToken]);

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
          <Link to="/" className="text-indigo-400 hover:text-indigo-300">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* CTA Banner */}
      <div className="bg-indigo-500/10 border-b border-indigo-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Code2 className="w-6 h-6 text-indigo-500" />
              <p className="text-indigo-200 text-sm">
                This is a shared code review. Sign up to review your own code!
              </p>
            </div>
            <Link
              to="/register"
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Get Started Free
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
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
