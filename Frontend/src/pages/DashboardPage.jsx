import { useState, useEffect, useMemo, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Award } from 'lucide-react';
import api from '../utils/api.js';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes] = await Promise.all([
          api.get('/ai/history?limit=30&sort=-createdAt'),
        ]);
        setReviews(historyRes.data.reviews || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = useMemo(() => {
    return reviews.map((review) => ({
      date: new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: review.severityScore || 0,
      critical: review.issueCount?.critical || 0,
      warning: review.issueCount?.warning || 0,
      info: review.issueCount?.info || 0,
    })).reverse();
  }, [reviews]);

  const issueBreakdown = useMemo(() => {
    const totalCritical = reviews.reduce((sum, r) => sum + (r.issueCount?.critical || 0), 0);
    const totalWarning = reviews.reduce((sum, r) => sum + (r.issueCount?.warning || 0), 0);
    const totalInfo = reviews.reduce((sum, r) => sum + (r.issueCount?.info || 0), 0);
    return [
      { name: 'Critical', value: totalCritical, fill: '#ef4444' },
      { name: 'Warning', value: totalWarning, fill: '#eab308' },
      { name: 'Info', value: totalInfo, fill: '#3b82f6' },
    ];
  }, [reviews]);

  const avgScore = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + (r.severityScore || 0), 0);
    return Math.round(sum / reviews.length);
  }, [reviews]);

  const totalIssues = useMemo(() => {
    return reviews.reduce((sum, r) => {
      return sum + (r.issueCount?.critical || 0) + (r.issueCount?.warning || 0) + (r.issueCount?.info || 0);
    }, 0);
  }, [reviews]);

  const streak = useMemo(() => {
    if (reviews.length === 0) return 0;
    const dates = [...new Set(reviews.map((r) => new Date(r.createdAt).toDateString()))];
    return dates.length;
  }, [reviews]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">Dashboard</h1>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-indigo-500/10">
                <TrendingUp className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Total Reviews</p>
                <p className="text-2xl font-bold text-white">{reviews.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Award className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Avg Score</p>
                <p className="text-2xl font-bold text-white">{avgScore}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Issues Found</p>
                <p className="text-2xl font-bold text-white">{totalIssues}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <CheckCircle className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Streak</p>
                <p className="text-2xl font-bold text-white">{streak} days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Score Trend */}
          <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Score Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} />
                <YAxis stroke="#a1a1aa" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#242424', border: '1px solid #3f3f46', borderRadius: '8px' }}
                  labelStyle={{ color: 'white' }}
                />
                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Issue Breakdown */}
          <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Issue Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={issueBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} />
                <YAxis stroke="#a1a1aa" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#242424', border: '1px solid #3f3f46', borderRadius: '8px' }}
                  labelStyle={{ color: 'white' }}
                />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] overflow-hidden">
          <div className="border-b border-zinc-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Recent Reviews</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#242424]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Language</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Profile</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {reviews.slice(0, 10).map((review) => (
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
                      <button
                        onClick={() => navigate(`/review/${review._id}`)}
                        className="text-indigo-400 hover:text-indigo-300 text-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {reviews.length === 0 && (
            <div className="p-8 text-center text-zinc-400">
              No reviews yet. Start by reviewing some code!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
