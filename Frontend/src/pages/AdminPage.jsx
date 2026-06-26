import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import { Users, FileText, TrendingUp, Crown } from 'lucide-react';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRoleChange = useCallback(async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      fetchData();
    } catch (err) {
      alert('Failed to update user role');
    }
  }, [fetchData]);

  const handleDeleteUser = useCallback(async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete user');
    }
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const topLanguages = stats?.topLanguages || [];
  const chartData = topLanguages.map((lang) => ({
    name: lang._id || lang.language,
    count: lang.count,
  }));

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <FileText className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Total Reviews</p>
                <p className="text-2xl font-bold text-white">{stats?.totalReviews || 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <TrendingUp className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Reviews Today</p>
                <p className="text-2xl font-bold text-white">{stats?.reviewsToday || 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Crown className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Pro Users</p>
                <p className="text-2xl font-bold text-white">{stats?.proUsers || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Languages Chart */}
        {chartData.length > 0 && (
          <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Top Languages</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} />
                <YAxis stroke="#a1a1aa" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#242424', border: '1px solid #3f3f46', borderRadius: '8px' }}
                  labelStyle={{ color: 'white' }}
                />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Users Table */}
        <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] overflow-hidden">
          <div className="border-b border-zinc-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#242424]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Reviews</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-[#242424]/50">
                    <td className="px-6 py-4 text-sm text-zinc-300">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-zinc-300">{user.email}</td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="px-2 py-1 rounded bg-[#242424] border border-zinc-800 text-white text-sm focus:outline-none focus:border-indigo-500 capitalize"
                      >
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300">{user.totalReviews || 0}</td>
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <div className="p-8 text-center text-zinc-400">No users found</div>
          )}
        </div>
      </div>
    </div>
  );
}
