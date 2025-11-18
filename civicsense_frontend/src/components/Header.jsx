// src/components/Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReportIssueModal from './ReportIssueModal';

export default function Header() {
  const { isAuthenticated, logoutUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo / App Name */}
          <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition">
            CivicSense
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link to="/home" className="text-gray-700 hover:text-blue-600 font-medium">
                  Home
                </Link>

                {/* Report Issue Button - Opens Modal */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition"
                >
                  Report Issue
                </button>

                {/* City Health Report (Publicly Accessible) */}
                <Link to="/city-report" className="text-gray-700 hover:text-blue-600 font-medium">
                  📊 City Report
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Public Links (when not logged in) */}
                <Link to="/city-report" className="text-gray-700 hover:text-blue-600 font-medium">
                  📊 City Report
                </Link>

                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Login
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Report Issue Modal (kept from your version ❤️) */}
      <ReportIssueModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
