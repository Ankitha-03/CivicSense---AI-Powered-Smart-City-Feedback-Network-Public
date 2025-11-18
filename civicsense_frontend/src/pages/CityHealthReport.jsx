import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCcw } from "lucide-react";

export default function CityHealthReport() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center mb-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-gray-700 hover:text-blue-700 transition"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <h1 className="text-3xl font-bold text-blue-900">
          CivicSense — Weekly City Health Report
        </h1>

        <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow hover:shadow-md border transition">
          <RefreshCcw size={18} />
          Refresh
        </button>
      </div>

      {/* ===== CATEGORY BREAKDOWN ===== */}
      <h2 className="text-2xl font-bold text-blue-900 mb-4">Category Breakdown</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Roads & Infrastructure */}
        <div className="bg-white rounded-xl shadow p-6 border">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-bold text-gray-800">
              Roads & Infrastructure
            </h3>
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
              13 Critical
            </span>
          </div>

          <p className="text-gray-600 mb-3">156 total reports</p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div className="bg-blue-600 h-3 rounded-full" style={{ width: "63%" }}></div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 text-center">
            <div>
              <p className="text-green-600 text-2xl font-bold">98</p>
              <p className="text-gray-500 text-sm">Resolved</p>
            </div>
            <div>
              <p className="text-yellow-500 text-2xl font-bold">45</p>
              <p className="text-gray-500 text-sm">Pending</p>
            </div>
            <div>
              <p className="text-red-500 text-2xl font-bold">13</p>
              <p className="text-gray-500 text-sm">Critical</p>
            </div>
          </div>

          <p className="mt-4 text-red-500 text-sm">↑ 12% increase from last week</p>
        </div>

        {/* Garbage & Sanitation */}
        <div className="bg-white rounded-xl shadow p-6 border">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-bold text-gray-800">
              Garbage & Sanitation
            </h3>
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
              12 Critical
            </span>
          </div>

          <p className="text-gray-600 mb-3">243 total reports</p>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div className="bg-blue-600 h-3 rounded-full" style={{ width: "78%" }}></div>
          </div>

          <div className="grid grid-cols-3 text-center">
            <div>
              <p className="text-green-600 text-2xl font-bold">189</p>
              <p className="text-gray-500 text-sm">Resolved</p>
            </div>
            <div>
              <p className="text-yellow-500 text-2xl font-bold">42</p>
              <p className="text-gray-500 text-sm">Pending</p>
            </div>
            <div>
              <p className="text-red-500 text-2xl font-bold">12</p>
              <p className="text-gray-500 text-sm">Critical</p>
            </div>
          </div>

          <p className="mt-4 text-green-600 text-sm">↓ 8% decrease from last week</p>
        </div>

        {/* Electricity & Power */}
        <div className="bg-white rounded-xl shadow p-6 border">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-bold text-gray-800">
              Electricity & Power
            </h3>
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
              4 Critical
            </span>
          </div>

          <p className="text-gray-600 mb-3">87 total reports</p>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div className="bg-blue-600 h-3 rounded-full" style={{ width: "82%" }}></div>
          </div>

          <div className="grid grid-cols-3 text-center">
            <div>
              <p className="text-green-600 text-2xl font-bold">71</p>
              <p className="text-gray-500 text-sm">Resolved</p>
            </div>
            <div>
              <p className="text-yellow-500 text-2xl font-bold">12</p>
              <p className="text-gray-500 text-sm">Pending</p>
            </div>
            <div>
              <p className="text-red-500 text-2xl font-bold">4</p>
              <p className="text-gray-500 text-sm">Critical</p>
            </div>
          </div>

          <p className="mt-4 text-gray-500 text-sm">Stable from last week</p>
        </div>

        {/* Water Supply */}
        <div className="bg-white rounded-xl shadow p-6 border">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-bold text-gray-800">Water Supply</h3>
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
              2 Critical
            </span>
          </div>

          <p className="text-gray-600 mb-3">64 total reports</p>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div className="bg-blue-600 h-3 rounded-full" style={{ width: "81%" }}></div>
          </div>

          <div className="grid grid-cols-3 text-center">
            <div>
              <p className="text-green-600 text-2xl font-bold">52</p>
              <p className="text-gray-500 text-sm">Resolved</p>
            </div>
            <div>
              <p className="text-yellow-500 text-2xl font-bold">10</p>
              <p className="text-gray-500 text-sm">Pending</p>
            </div>
            <div>
              <p className="text-red-500 text-2xl font-bold">2</p>
              <p className="text-gray-500 text-sm">Critical</p>
            </div>
          </div>

          <p className="mt-4 text-green-600 text-sm">↓ 15% decrease from last week</p>
        </div>
      </div>

      {/* ===== AI GENERATED INSIGHTS ===== */}
      <div className="bg-white rounded-xl shadow p-6 mt-10 border">
        <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
          💡 AI-Generated Insights
        </h2>

        <ul className="space-y-3">
          <li className="bg-blue-50 p-4 rounded-lg">
            Garbage collection response time improved by 23% this week.
          </li>
          <li className="bg-blue-50 p-4 rounded-lg">
            Road repair requests increased by 12% — possible seasonal trend.
          </li>
          <li className="bg-blue-50 p-4 rounded-lg">
            Electricity complaints decreased significantly in the North district.
          </li>
          <li className="bg-blue-50 p-4 rounded-lg">
            Water supply issues concentrated in 3 specific neighborhoods.
          </li>
        </ul>
      </div>

    </div>
  );
}