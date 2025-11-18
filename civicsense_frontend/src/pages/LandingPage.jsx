import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock, Upload, Cpu, TrendingUp, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();
  const { logoutUser } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getOpacity = (start, end) => {
    if (scrollY < start) return 0;
    if (scrollY > end) return 1;
    return (scrollY - start) / (end - start);
  };

  const getTranslateY = (start, end) => {
    if (scrollY < start) return 50;
    if (scrollY > end) return 0;
    return 50 - ((scrollY - start) / (end - start)) * 50;
  };

  const handleReportIssue = () => navigate('/report');

  const handleViewAllIssues = () => {
    alert('View All Issues - Coming Soon!');
  };

  // 🟢 Added: Smooth scroll to Contact section
  const handleScrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-sky-50 to-indigo-100">
      {/* 🔴 Logout + Contact Buttons (🟢 Added Contact button) */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-4">
        <button
          onClick={handleScrollToContact}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          Contact
        </button>
        <button
          onClick={logoutUser}
          className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg font-semibold shadow-lg hover:bg-red-50 hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-2 border-red-500"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      {/* 🌆 Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-fade-in drop-shadow-md">
            CivicSense
          </h1>
          <p className="text-2xl md:text-3xl text-gray-800 mb-12 font-medium drop-shadow-sm">
            AI-Powered Smart City Platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
  <button
    onClick={handleReportIssue}
    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
  >
    🚀 Report an Issue
  </button>

  <button
    onClick={handleViewAllIssues}
    className="px-8 py-4 bg-white text-indigo-700 rounded-lg font-semibold text-lg shadow-lg hover:bg-indigo-50 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-indigo-600"
  >
    📋 View All Issues
  </button>

  {/* ⭐ Weekly Report Button */}
  <button 
    onClick={() => navigate('/city-health-report')}
    className="px-8 py-4 bg-white text-blue-700 rounded-lg font-semibold text-lg shadow-lg hover:bg-blue-50 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-blue-600"
  >
    📊 Weekly Report
  </button>
</div>

        </div>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* 📊 Stats Section */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20">
        <div
          className="max-w-6xl mx-auto w-full"
          style={{
            opacity: getOpacity(300, 600),
            transform: `translateY(${getTranslateY(300, 600)}px)`
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Total Reports */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl border-t-4 border-blue-500 transition-all duration-300 transform hover:scale-105">
              <div className="p-3 bg-blue-100 rounded-lg w-fit mb-4">
                <AlertCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-4xl font-bold text-blue-700 mb-2">0</h3>
              <p className="text-xl font-semibold text-blue-600 mb-1">Total Reports</p>
              <p className="text-gray-600">Community submissions</p>
            </div>

            {/* Resolved Issues */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl border-t-4 border-green-500 transition-all duration-300 transform hover:scale-105">
              <div className="p-3 bg-green-100 rounded-lg w-fit mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-4xl font-bold text-green-700 mb-2">0</h3>
              <p className="text-xl font-semibold text-green-600 mb-1">Resolved Issues</p>
              <p className="text-gray-600">Successfully completed</p>
            </div>

            {/* Active Reports */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl border-t-4 border-orange-500 transition-all duration-300 transform hover:scale-105">
              <div className="p-3 bg-orange-100 rounded-lg w-fit mb-4">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-4xl font-bold text-orange-700 mb-2">0</h3>
              <p className="text-xl font-semibold text-orange-600 mb-1">Active Reports</p>
              <p className="text-gray-600">Currently being addressed</p>
            </div>
          </div>
        </div>
      </section>

      {/* ⚙️ How It Works Section */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-b from-white to-blue-50">
        <div
          className="max-w-6xl mx-auto w-full"
          style={{
            opacity: getOpacity(1000, 1300),
            transform: `translateY(${getTranslateY(1000, 1300)}px)`
          }}
        >
          <h2 className="text-5xl font-extrabold text-center mb-16 text-indigo-800">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Report Issue */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-blue-200">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
              </div>
              <h3 className="text-2xl font-bold text-blue-700 mb-4">Report Issue</h3>
              <p className="text-gray-700 leading-relaxed">
                Upload a photo and location of the civic issue you've encountered
              </p>
            </div>

            {/* AI Categorization */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-purple-200">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
                  <Cpu className="w-8 h-8 text-white" />
                </div>
                <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              </div>
              <h3 className="text-2xl font-bold text-purple-700 mb-4">AI Categorization</h3>
              <p className="text-gray-700 leading-relaxed">
                Our AI automatically identifies the issue type and routes it to the right department
              </p>
            </div>

            {/* Track Progress */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-green-200">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="w-12 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
              </div>
              <h3 className="text-2xl font-bold text-green-700 mb-4">Track Progress</h3>
              <p className="text-gray-700 leading-relaxed">
                Follow the status of your report and upvote issues that matter to you
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🟢 Contact Section */}
      <footer id="contact" className="bg-white border-t mt-20 py-12 px-6 md:px-20 text-slate-700">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center md:text-left">
          <div>
            <h2 className="text-2xl font-bold text-blue-700 mb-2">CivicSense</h2>
            <p className="text-gray-600">
              AI-powered smart city feedback platform connecting communities with
              local government for faster issue resolution and stronger civic engagement.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Platform</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Features</li>
              <li>Issue Map</li>
              <li>Report Issue</li>
              <li>Sign In</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Contact</h3>
            <ul className="space-y-2 text-gray-600">
              <li>📧 info@civicsense.com</li>
              <li>📞 +91 8088959535</li>
              <li>📍 Bengaluru</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 text-center text-gray-500 text-sm border-t pt-6">
          © 2025 CivicSense. All rights reserved. Built with ❤️ for better communities.
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
}

