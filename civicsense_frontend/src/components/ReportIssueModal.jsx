// src/components/ReportIssueModal.jsx

import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';

export default function ReportIssueModal({ 
  isOpen, 
  onClose, 
  formData, 
  setFormData, 
  onSubmit, 
  loading, 
  error,
  locationStatus 
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const categories = [
    'Road Damage',
    'Garbage Collection',
    'Electrical Issue',
    'Water Supply',
    'Other'
  ];

  // Handle text inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🧠 AI-enhanced photo upload
  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });
      setAnalyzing(true);
      setAiResult(null);

      const formDataAI = new FormData();
      formDataAI.append("photo", file);

      try {
        const res = await fetch("http://127.0.0.1:8000/api/ai/analyze/", {
          method: "POST",
          body: formDataAI,
        });

        const data = await res.json();

        if (res.ok) {
          setAiResult(data);

          // 🪄 Auto-fill the category dropdown if AI is confident
          if (data.ai_category && data.ai_confidence >= 0.6) {
            setFormData(prev => ({ ...prev, category: data.ai_category }));
          }
        } else {
          setAiResult({ error: "AI analysis failed." });
        }
      } catch (err) {
        setAiResult({ error: "Error contacting AI service." });
      } finally {
        setAnalyzing(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[10000]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto relative z-[10001]">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Report Civic Issue</h2>
            <p className="text-base text-gray-500 mt-1">
              Location: {formData.latitude && formData.longitude
                ? `${formData.latitude.toFixed(4)}, ${formData.longitude.toFixed(4)}`
                : "Click map to select location"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            type="button"
          >
            <X size={28} strokeWidth={2} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={onSubmit} className="px-8 py-6 space-y-6">
          {/* Title Field */}
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-3">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief description of the issue"
              className="w-full px-5 py-4 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
              required
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-3">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of the issue"
              rows={6}
              className="w-full px-5 py-4 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder:text-gray-400"
              required
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <label className="block text-base font-semibold text-gray-900 mb-3">
              Category <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full px-5 py-4 text-base border-2 border-blue-500 rounded-xl text-left bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
            >
              <span className={formData.category ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                {formData.category || 'Select category'}
              </span>
              <svg
                className={`w-6 h-6 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute z-[10002] w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {categories.map((cat, index) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, category: cat });
                      setShowDropdown(false);
                    }}
                    className={`w-full px-5 py-4 text-left text-base font-medium hover:bg-gray-50 transition-colors ${
                      index === 0 ? 'bg-blue-50 text-gray-900' : 'text-gray-700'
                    } ${index !== categories.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Address Field */}
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-3">
              Address (optional)
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address or landmark"
              className="w-full px-5 py-4 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-3">
              Photo (optional - AI will analyze)
            </label>
            <label className="w-full px-5 py-4 border border-gray-300 rounded-xl flex items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors bg-white">
              <Upload size={22} className="text-gray-600" strokeWidth={2} />
              <span className="text-base font-medium text-gray-700">
                {formData.image ? formData.image.name : 'Upload Photo'}
              </span>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* 🧠 AI Feedback Section */}
            {analyzing && (
              <p className="text-blue-600 text-sm mt-2 animate-pulse">
                🔍 Analyzing photo...
              </p>
            )}

            {aiResult && !aiResult.error && (
              <div className="bg-green-50 border border-green-200 rounded-md p-2 mt-3 text-sm text-green-800">
                🧠 <strong>AI Suggests:</strong> {aiResult.ai_category} ({Math.round(aiResult.ai_confidence * 100)}% confident)
              </div>
            )}

            {aiResult?.error && (
              <p className="text-red-600 text-sm mt-2">{aiResult.error}</p>
            )}
          </div>

          {/* Location Status Messages */}
          {locationStatus === "loading" && (
            <div className="p-4 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium border border-blue-200">
              📍 Requesting location access... Please allow permission in your browser.
            </div>
          )}
          {locationStatus === "denied" && (
            <div className="p-4 bg-yellow-50 text-yellow-700 rounded-xl text-sm font-medium border border-yellow-200">
              ⚠️ Location access denied. Click the map to set location manually.
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-200">
              ❌ {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl text-gray-900 font-semibold text-base hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-6 py-4 rounded-xl font-semibold text-base transition-colors ${
                loading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Creating...' : 'Create Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// Add to your existing ReportIssue.jsx after successful submission

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  // ... existing validation ...

  try {
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('latitude', formData.latitude.toString());
    data.append('longitude', formData.longitude.toString());
    
    if (formData.address) {
      data.append('address', formData.address);
    }
    
    if (formData.image instanceof File) {
      data.append('image', formData.image);
    }

    const response = await axios.post(`${API_BASE_URL}issues/`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${authToken.access}`,
      },
    });

    console.log("✅ Success:", response.data);
    
    // Show AI results if available
    if (response.data.ai_analysis) {
      const aiResult = response.data.ai_analysis;
      alert(
        `Issue reported successfully!\n\n` +
        `🤖 AI Analysis:\n` +
        `Detected: ${aiResult.detected_label}\n` +
        `Category: ${response.data.ai_category}\n` +
        `Confidence: ${(response.data.ai_confidence * 100).toFixed(1)}%\n` +
        `Image Quality: ${(aiResult.image_quality.score * 100).toFixed(1)}%`
      );
    } else {
      alert("Issue reported successfully!");
    }
    
    setIsModalOpen(false);
    navigate("/home");
  } catch (err) {
    // ... existing error handling ...
  } finally {
    setLoading(false);
  }
};