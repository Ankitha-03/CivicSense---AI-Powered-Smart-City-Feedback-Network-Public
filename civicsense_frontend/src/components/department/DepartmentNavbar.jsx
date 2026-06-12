import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDeptAuth } from "../../context/DepartmentAuthContext";
import { Building2, LayoutDashboard, ClipboardList, LogOut } from "lucide-react";

const NAV = [
  { to: "/department/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/department/issues",    label: "Issues",    icon: ClipboardList },
];

export default function DepartmentNavbar() {
  const { deptUser, deptLogout } = useDeptAuth();
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    deptLogout();
    navigate("/department/login", { replace: true });
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1a56db] flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900 hidden sm:inline">
            {deptUser?.department_name ?? "Department Portal"}
          </span>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  active
                    ? "bg-blue-50 text-[#1a56db]"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </div>

        {/* User + logout */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 hidden md:inline truncate max-w-[160px]">
            {deptUser?.username}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
