import { useState, useCallback, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/themes/prism-tomorrow.css';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { useAuth } from '../hooks/useAuth.js';
import api from '../utils/api.js';
import { 
  Code2, 
  Shield, 
  Zap, 
  Palette, 
  BookOpen, 
  Save, 
  Share2, 
  Download,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

const LANGUAGES = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
];

const PROFILES = [
  { value: 'general', label: 'General', icon: Code2 },
  { value: 'security', label: 'Security', icon: Shield },
  { value: 'performance', label: 'Performance', icon: Zap },
  { value: 'style', label: 'Style', icon: Palette },
  { value: 'beginner', label: 'Beginner', icon: BookOpen },
];

export default function EditorPage() {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('auto');
  const [reviewProfile, setReviewProfile] = useState('general');
  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState([]);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remainingReviews, setRemainingReviews] = useState(null);

  // Fetch projects and remaining reviews on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, userRes] = await Promise.all([
          api.get('/projects'),
          api.get('/auth/me'),
        ]);
        setProjects(projectsRes.data.projects || []);
        if (userRes.data.user) {
          const limit = userRes.data.user.role === 'free' ? 10 : Infinity;
          const used = userRes.data.user.reviewsToday || 0;
          setRemainingReviews(userRes.data.user.role === 'free' ? limit - used : null);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  const detectLanguage = useCallback((codeStr) => {
    if (codeStr.includes('function ') || codeStr.includes('const ') || codeStr.includes('=>')) {
      return 'javascript';
    }
    if (codeStr.includes('def ') || codeStr.includes('import ') || codeStr.includes(':')) {
      return 'python';
    }
    if (codeStr.includes('interface ') || codeStr.includes('type ') || codeStr.includes(': string')) {
      return 'typescript';
    }
    if (codeStr.includes('public class') || codeStr.includes('public static void')) {
      return 'java';
    }
    if (codeStr.includes('func ') || codeStr.includes('package ')) {
      return 'go';
    }
    if (codeStr.includes('fn ') || codeStr.includes('let mut') || codeStr.includes('impl ')) {
      return 'rust';
    }
    return 'javascript';
  }, []);

  const handleReview = useCallback(async () => {
    if (!code.trim()) {
      setError('Please enter some code to review');
      return;
    }

    if (remainingReviews !== null && remainingReviews <= 0) {
      setError('Daily review limit reached. Upgrade to Pro for unlimited reviews.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const lang = language === 'auto' ? detectLanguage(code) : language;
      const response = await api.post('/ai/get-review', {
        code,
        reviewProfile,
        language: lang,
        projectId: selectedProject || undefined,
      });

      setReview(response.data.review);
      if (remainingReviews !== null) {
        setRemainingReviews(remainingReviews - 1);
      }
    } catch (err) {
      let errorMessage = 'Failed to get review. Please try again.';
      
      if (err.response?.data?.error) {
        // Handle case where backend sends an object as error
        errorMessage = typeof err.response.data.error === 'string' 
          ? err.response.data.error 
          : JSON.stringify(err.response.data.error);
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [code, language, reviewProfile, selectedProject, remainingReviews, detectLanguage]);

  const handleSaveToProject = useCallback(async () => {
  if (!review || !selectedProject) {
    alert('Please select a project from the dropdown first.');
    return;
  }

  try {
    // Update the existing review with the projectId
    await api.patch(`/ai/history/${review._id}`, {
      projectId: selectedProject,
    });
    
    alert('Review saved to project successfully!');
    
    // Optionally refresh projects list to update counts
    const projectsRes = await api.get('/projects');
    setProjects(projectsRes.data.projects || []);
  } catch (err) {
    console.error('Failed to save to project:', err);
    alert('Failed to save review to project.');
  }
}, [review, selectedProject]);

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

  const getSeverityColor = useCallback((score) => {
    if (score >= 70) return 'text-green-400 bg-green-400/10';
    if (score >= 40) return 'text-yellow-400 bg-yellow-400/10';
    return 'text-red-400 bg-red-400/10';
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-xl font-bold text-white">Code Review</h1>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#242424] border border-zinc-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>

              {/* Profile Tabs */}
              <div className="flex items-center gap-2">
                {PROFILES.map((profile) => {
                  const Icon = profile.icon;
                  return (
                    <button
                      key={profile.value}
                      onClick={() => setReviewProfile(profile.value)}
                      className={`p-2 rounded-lg transition-colors ${
                        reviewProfile === profile.value
                          ? 'bg-indigo-500 text-white'
                          : 'text-zinc-400 hover:text-white hover:bg-[#242424]'
                      }`}
                      title={profile.label}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>

              {/* Project Selector */}
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#242424] border border-zinc-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">No Project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>

              {/* Remaining Reviews */}
              {remainingReviews !== null && (
                <div className="text-sm text-zinc-400">
                  {remainingReviews} reviews left today
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] overflow-hidden">
            <div className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
              <h2 className="font-medium text-white">Code Input</h2>
              <button
                onClick={handleReview}
                disabled={loading || !code.trim()}
                className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {loading ? 'Analyzing...' : 'Review Code'}
              </button>
            </div>
            <div className="p-4">
              <Editor
                value={code}
                onValueChange={setCode}
                highlight={(codeStr) => highlight(codeStr, languages.javascript || languages.clike, 'javascript')}
                padding={16}
                className="editor-container rounded-lg bg-[#242424] min-h-[400px] max-h-[600px] overflow-auto text-zinc-100 font-mono text-sm"
                style={{
                  fontFamily: '"Fira Code", "Consolas", monospace',
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              />
            </div>
            {error && typeof error === 'string' &&(
              <div className="px-4 pb-4">
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              </div>
            )}
          </div>

          {/* Review Panel */}
          <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] overflow-hidden">
            <div className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
              <h2 className="font-medium text-white">AI Review</h2>
              {review && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveToProject} // Changed from handleSave
                    disabled={!selectedProject} // Disable if no project selected
                    className={`p-2 transition-colors ${
                      selectedProject 
                      ? 'text-zinc-400 hover:text-white' 
                      : 'text-zinc-600 cursor-not-allowed'
                      }`}
                    title="Save to Selected Project"
                  >
                  <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 text-zinc-400 hover:text-white transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleExport}
                    className="p-2 text-zinc-400 hover:text-white transition-colors"
                    title="Export"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="p-4">
              {review ? (
                <div className="space-y-4">
                  {/* Score and Issues */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(review.severityScore)}`}>
                      Score: {review.severityScore}/100
                    </div>
                    {review.issueCount && (
                      <>
                        <div className="flex items-center gap-1 text-sm text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          Critical: {review.issueCount.critical || 0}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-yellow-400">
                          <AlertCircle className="w-4 h-4" />
                          Warning: {review.issueCount.warning || 0}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-blue-400">
                          <Info className="w-4 h-4" />
                          Info: {review.issueCount.info || 0}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Markdown Output */}
                  <div className="markdown-body prose prose-invert max-w-none">
                    <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{review.result}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-zinc-500">
                  <div className="text-center">
                    <Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Enter your code and click "Review Code" to get AI feedback</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
