import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { FolderOpen, Plus, Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.projects || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = useCallback(async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setNewProject({ name: '', description: '' });
      setShowCreateForm(false);
      fetchProjects();
    } catch (err) {
      alert('Failed to create project');
    }
  }, [newProject, fetchProjects]);

  const handleDelete = useCallback(async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      alert('Failed to delete project');
    }
  }, [fetchProjects]);

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] p-6 mb-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                  maxLength={60}
                  className="w-full px-4 py-3 rounded-lg bg-[#242424] border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  placeholder="My Project"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  maxLength={200}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-[#242424] border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  placeholder="Brief description..."
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="col-span-full text-center py-12 text-zinc-400">
              <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No projects yet. Create your first project!</p>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project._id}
                className="rounded-xl border border-zinc-800 bg-[#1a1a1a] p-6 hover:border-zinc-700 transition-colors cursor-pointer"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-indigo-500/10">
                    <FolderOpen className="w-6 h-6 text-indigo-500" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project._id);
                    }}
                    className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{project.name}</h3>
                <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{project.description || 'No description'}</p>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span>{project.reviewCount || 0} reviews</span>
                  <span>•</span>
                  <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
