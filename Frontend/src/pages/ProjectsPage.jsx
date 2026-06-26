import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { FolderOpen, Plus, Trash2, Edit2, ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [projectsRes, reviewsRes] = await Promise.all([
        api.get('/projects'),
        api.get('/ai/history?limit=100') // Fetch enough reviews to cover all projects
      ]);

      setProjects(projectsRes.data.projects || []);
      setReviews(reviewsRes.data.reviews || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setNewProject({ name: '', description: '' });
      setShowCreateForm(false);
      fetchData();
    } catch (error) {
      alert('Failed to create project');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project? Associated reviews will remain but be unlinked.')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchData();
    } catch (error) {
      alert('Failed to delete project');
    }
  };

  // Helper to count reviews safely
  const getReviewCount = (projectId) => {
    if (!projectId) return 0;
    const projIdStr = projectId.toString();
    
    const count = reviews.filter(r => {
      // Ensure both are strings for comparison
      const reviewProjId = r.projectId ? r.projectId.toString() : null;
      return reviewProjId === projIdStr;
    }).length;

    return count;
  };

  // Get reviews for the selected project view
  const getProjectReviews = (projectId) => {
    if (!projectId) return [];
    const projIdStr = projectId.toString();
    return reviews.filter(r => {
      const reviewProjId = r.projectId ? r.projectId.toString() : null;
      return reviewProjId === projIdStr;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {selectedProject && (
              <button 
                onClick={() => setSelectedProject(null)}
                className="p-2 hover:bg-zinc-800 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-2xl font-bold">
              {selectedProject ? selectedProject.name : 'My Projects'}
            </h1>
          </div>
          
          {!selectedProject && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          )}
        </div>

        {/* Create Form */}
        {showCreateForm && !selectedProject && (
          <form onSubmit={handleCreateProject} className="mb-8 p-6 bg-[#1a1a1a] border border-zinc-800 rounded-xl">
            <div className="grid gap-4">
              <input
                type="text"
                placeholder="Project Name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className="bg-[#0f0f0f] border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="bg-[#0f0f0f] border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
                rows="3"
              />
              <div className="flex gap-2">
                <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg">
                  Create
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)}
                  className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Project Detail View */}
        {selectedProject ? (
          <div className="space-y-4">
            <div className="p-4 bg-[#1a1a1a] border border-zinc-800 rounded-xl mb-6">
              <p className="text-zinc-400">{selectedProject.description || 'No description'}</p>
              <p className="text-sm text-zinc-500 mt-2">
                Created: {new Date(selectedProject.createdAt).toLocaleDateString()}
              </p>
            </div>

            <h2 className="text-xl font-semibold mb-4">Reviews in this Project</h2>
            
            {getProjectReviews(selectedProject._id).length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No reviews saved to this project yet.</p>
                <p className="text-sm">Go to the Editor and save a review to this project.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {getProjectReviews(selectedProject._id).map((review) => (
                  <div key={review._id} className="p-4 bg-[#1a1a1a] border border-zinc-800 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {review.language || 'Code'}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-300 line-clamp-1">
                        {review.code.substring(0, 60)}...
                      </p>
                    </div>
                    <button
                      onClick={() => window.location.href = `/review/${review._id}`}
                      className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                    >
                      View Review
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Project List Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length === 0 ? (
              <div className="col-span-full text-center py-12 text-zinc-500">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No projects yet. Create your first project to organize reviews.</p>
              </div>
            ) : (
              projects.map((project) => {
                const count = getReviewCount(project._id);
                // Debug log to console (F12) to see if IDs match
                console.log(`Project: ${project.name}, ID: ${project._id}, Matched Reviews: ${count}`);
                
                return (
                  <div
                    key={project._id}
                    onClick={() => setSelectedProject(project)}
                    className="group p-6 bg-[#1a1a1a] border border-zinc-800 rounded-xl hover:border-indigo-500/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                        <FolderOpen className="w-6 h-6 text-indigo-400" />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project._id);
                        }}
                        className="text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                    <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                      {project.description || 'No description'}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500">
                        {count} {count === 1 ? 'Review' : 'Reviews'}
                      </span>
                      <span className="text-xs text-zinc-600">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}