/**
 * Navbar.jsx
 *
 * Persistent top navigation bar for all citizen-facing pages. Features:
 *   - 3 px primary-blue accent bar pinned to the very top of the viewport
 *   - CivicSense wordmark linking to the dashboard
 *   - Desktop nav links (Dashboard, My Reports) with active-link underline
 *   - "Report Issue" CTA button
 *   - Avatar button with initial derived from the authenticated username;
 *     opens a dropdown showing "Signed in as" and a "Sign out" action
 *   - Mobile hamburger menu that collapses nav links and actions
 *
 * Reads username from AuthContext; the avatar initial and dropdown label
 * both update immediately after login without a page reload.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, logoutUser, username } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen]       = useState(false);
  const [dropdownOpen, setDropdown]   = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdown(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleLogout = () => {
    setDropdown(false);
    setMenuOpen(false);
    logoutUser();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    isActive
      ? "text-sm font-semibold text-[#1a56db] border-b-2 border-[#1a56db] pb-[2px]"
      : "text-sm font-medium text-gray-600 hover:text-[#1a56db] transition-colors duration-150";

  return (
    <>
      {/* 3px primary accent bar at very top */}
      <div className="h-[3px] bg-[#1a56db] fixed top-0 left-0 right-0 z-50" />

      <header
        className={`bg-white sticky top-[3px] z-40 border-b border-gray-200 transition-shadow duration-150 ${
          scrolled ? "shadow-md" : "shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Wordmark */}
          <Link
            to="/"
            className="text-[17px] font-bold text-[#1a56db] tracking-tight shrink-0 select-none"
          >
            CivicSense
          </Link>

          {/* Desktop nav links */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
              <NavLink to="/" end className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/my-reports" className={linkClass}>
                My Reports
              </NavLink>
            </nav>
          )}

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate("/report")}
                  className="px-4 py-2 bg-[#1a56db] text-white rounded-lg text-sm font-semibold hover:bg-[#1e429f] transition-colors duration-150 btn-pulse"
                >
                  Report Issue
                </button>

                {/* Avatar + dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdown(!dropdownOpen)}
                    className="w-8 h-8 rounded-full bg-[#1a56db] text-white text-sm font-bold uppercase flex items-center justify-center hover:bg-[#1e429f] transition-colors duration-150"
                    aria-label="Open user menu"
                    aria-expanded={dropdownOpen}
                  >
                    {(username?.[0] ?? "U").toUpperCase()}
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-900 truncate mt-0.5">
                          {username ?? "User"}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50 transition-colors duration-150"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-[#1a56db] text-white rounded-lg text-sm font-semibold hover:bg-[#1e429f] transition-colors duration-150"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          {isAuthenticated && (
            <button
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* Mobile menu */}
        {menuOpen && isAuthenticated && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            <NavLink
              to="/"
              end
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 text-sm rounded-md font-medium ${
                  isActive ? "bg-blue-50 text-[#1a56db] font-semibold" : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/my-reports"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 text-sm rounded-md font-medium ${
                  isActive ? "bg-blue-50 text-[#1a56db] font-semibold" : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              My Reports
            </NavLink>
            <div className="pt-1 border-t border-gray-100 mt-1 space-y-1">
              <button
                onClick={() => { setMenuOpen(false); navigate("/report"); }}
                className="w-full text-left px-3 py-2.5 text-sm font-semibold text-white bg-[#1a56db] hover:bg-[#1e429f] rounded-md transition-colors duration-150"
              >
                Report Issue
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors duration-150"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
