import { Link } from 'react-router-dom';
import { Code2, Shield, Zap, BarChart3, CheckCircle, ArrowRight, Github, Twitter, Linkedin } from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: <Zap className="w-6 h-6 text-indigo-400" />,
      title: "Instant AI Analysis",
      description: "Get detailed code reviews in seconds using Google's Gemini 2.5 Flash model. Support for JS, TS, Python, Go, Rust, and more."
    },
    {
      icon: <Shield className="w-6 h-6 text-indigo-400" />,
      title: "Security Focused",
      description: "Specialized security review mode to catch vulnerabilities, injection flaws, and authentication issues before deployment."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-indigo-400" />,
      title: "Progress Tracking",
      description: "Visualize your code quality improvements over time with detailed dashboards and severity score trends."
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-indigo-400" />,
      title: "Custom Profiles",
      description: "Choose review styles: General, Security, Performance, Style Guide, or Beginner-friendly explanations."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 bg-[#0f0f0f]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Code2 className="w-8 h-8 text-indigo-500" />
              <span className="text-xl font-bold">CodeReview AI</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-zinc-400 hover:text-white transition-colors">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Powered by Google Gemini 2.5 Flash
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Elevate Your Code Quality <br /> with AI-Powered Reviews
          </h1>
          
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Get instant, actionable feedback on security, performance, and style. 
            Join thousands of developers writing cleaner, safer code every day.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Start Reviewing for Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="#features"
              className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all border border-zinc-700"
            >
              Learn More
            </Link>
          </div>

          <p className="mt-6 text-sm text-zinc-500">
            No credit card required • 10 free reviews daily • Instant setup
          </p>
        </div>

        {/* Background Gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to write better code</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Our AI understands context, best practices, and common pitfalls across multiple languages and frameworks.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-2xl bg-[#0f0f0f] border border-zinc-800 hover:border-indigo-500/50 transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / Social Proof */}
      <section className="py-24 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-8">
              <div className="text-4xl font-bold text-white mb-2">10k+</div>
              <div className="text-zinc-400">Code Reviews Generated</div>
            </div>
            <div className="p-8">
              <div className="text-4xl font-bold text-white mb-2">50ms</div>
              <div className="text-zinc-400">Average Response Time</div>
            </div>
            <div className="p-8">
              <div className="text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-zinc-400">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to improve your code?</h2>
            <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
              Join today and get 10 free code reviews every day. No credit card required.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-800 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Code2 className="w-6 h-6 text-indigo-500" />
              <span className="font-semibold">CodeReview AI</span>
            </div>
            <p className="text-zinc-500 text-sm">
              © {new Date().getFullYear()} CodeReview AI. Built for developers.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-zinc-400 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}