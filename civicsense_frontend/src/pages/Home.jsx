import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import { API_BASE_URL } from '../config';

const IssueCard = ({ issue }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{issue.title}</h3>
          <p className="text-gray-600 mt-1">{issue.description}</p>
        </div>
        {issue.image && (
          <img
            src={issue.image}
            alt="Issue"
            className="w-24 h-24 object-cover rounded-lg ml-4"
          />
        )}
      </div>

      {/* AI Analysis Badge */}
      {issue.ai_category && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="text-sm font-semibold text-purple-700 mb-1">
            🤖 AI Analysis
          </div>
          <div className="text-sm text-purple-600">
            Detected: {issue.ai_category.replace('_', ' ').toUpperCase()}
            {issue.ai_confidence &&
              ` (${(issue.ai_confidence * 100).toFixed(0)}% confidence)`}
          </div>
          {issue.image_quality_score > 0 && (
            <div className="text-xs text-purple-500 mt-1">
              Image Quality: {(issue.image_quality_score * 100).toFixed(0)}%
            </div>
          )}
        </div>
      )}

      {/* Category and Status */}
      <div className="flex items-center gap-3 mb-4">
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          {issue.category.replace('_', ' ')}
        </span>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            issue.status === 'resolved'
              ? 'bg-green-100 text-green-700'
              : issue.status === 'in_progress'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {issue.status.replace('_', ' ')}
        </span>
      </div>

      {/* Location and Upvotes */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div>
          📍{' '}
          {issue.address ||
            `${issue.latitude.toFixed(4)}, ${issue.longitude.toFixed(4)}`}
        </div>
        <div className="flex items-center gap-2">
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            👍 {issue.upvotes} Upvotes
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-400 mt-2">
        Reported {new Date(issue.created_at).toLocaleDateString()}
      </div>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}issues/`);
      setIssues(response.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Hero Section */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1.5 rounded-full mb-8 shadow-inner">
            <svg
              className="w-3 h-3 me-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            AI-Powered Smart City Platform
          </div>

          <h1 className="text-7xl font-extrabold tracking-tight text-gray-900 mb-6">
            CivicSense
          </h1>

          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Report civic issues, get AI-powered routing to departments, and
            help improve your city through community feedback.
          </p>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/report')}
              className="flex items-center bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Report an Issue
            </button>

            <button
              onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
              className="bg-white text-gray-800 font-semibold py-3 px-8 border border-gray-300 rounded-lg shadow-md hover:bg-gray-50 transition duration-300"
            >
              View All Issues
            </button>
          </div>
        </div>
      </div>

      {/* Issues Section */}
      <div id="issues" className="px-6 py-12 bg-gray-100">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          🧾 Reported Issues & AI Insights
        </h2>
        {issues.length === 0 ? (
          <p className="text-center text-gray-500">
            No issues reported yet. Be the first to report one!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
