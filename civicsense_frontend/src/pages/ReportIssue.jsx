import axiosInstance from "../api/axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  MapPin,
  Tag,
  Image,
  AlertTriangle,
  User,
  ArrowRight,
  ArrowLeft,
  Save,
  X,
  Bell,
  Mail,
  Phone,
} from "lucide-react";

export default function ReportIssue() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const totalSteps = 6;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
    photos: [],
    severity: "",
    fullName: "",
    email: "",
    phone: "",
    notifications: { email: false, sms: false, push: false },
    updateFrequency: "Major updates only",
  });

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  // ✅ Handle file upload
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, photos: files });
    setErrors({ ...errors, photos: "" });
  };

  // ✅ Validate current step
  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "Please enter issue title.";
      if (!formData.description.trim())
        newErrors.description = "Please enter description.";
    } else if (step === 2) {
      if (!formData.location.trim())
        newErrors.location = "Please enter location.";
    } else if (step === 3) {
      if (!formData.category.trim())
        newErrors.category = "Please select category.";
    } else if (step === 4) {
      if (formData.photos.length === 0)
        newErrors.photos = "Please upload at least one photo.";
    } else if (step === 5) {
      if (!formData.severity.trim())
        newErrors.severity = "Please select severity level.";
    } else if (step === 6) {
      if (!formData.fullName.trim())
        newErrors.fullName = "Please enter your full name.";
      if (!formData.email.trim())
        newErrors.email = "Please enter your email.";
      if (!formData.phone.trim())
        newErrors.phone = "Please enter your phone number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Navigation between steps
  const nextStep = () => {
    if (validateStep()) setStep(step + 1);
  };
  const prevStep = () => step > 1 && setStep(step - 1);

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("severity", formData.severity);
      formDataToSend.append("contact", formData.fullName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);

      formData.photos.forEach((file) => {
        formDataToSend.append("photos", file);
      });

      const response = await axiosInstance.post("issues/", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Issue successfully submitted!");
      navigate("/home");
    } catch (error) {
      console.error("❌ Error submitting issue:", error.response?.data || error);
      alert("Error: Could not submit issue.");
    }
  };

  const handleCancel = () => {
    if (window.confirm("Cancel reporting and go back?")) navigate("/home");
  };

  const steps = [
    { id: 1, label: "Basic Info", icon: <FileText /> },
    { id: 2, label: "Location", icon: <MapPin /> },
    { id: 3, label: "Category", icon: <Tag /> },
    { id: 4, label: "Photos", icon: <Image /> },
    { id: 5, label: "Severity", icon: <AlertTriangle /> },
    { id: 6, label: "Contact", icon: <User /> },
  ];

  const severityOptions = [
    "Minor",
    "Medium",
    "High",
    "Critical",
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-10 py-6 border-b bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-blue-700">CivicSense</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/home")}
            className="text-blue-600 font-semibold hover:underline"
          >
            Issue Map Dashboard
          </button>
          <button
            onClick={() => navigate("/report")}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Report Issue
          </button>
          <button className="text-slate-600 hover:text-blue-600">🔔</button>
          <button className="text-slate-600 hover:text-blue-600">👤</button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <div className="flex justify-between items-center mb-10">
          <div>
  <h2 className="text-2xl font-semibold text-slate-800">
    Report New Issue
  </h2>
  <p className="text-gray-500 mt-1">
    Step {step} of {totalSteps}
  </p>
</div>

          <button
            onClick={handleCancel}
            className="flex items-center text-red-500 hover:text-red-600 font-medium"
          >
            <X className="w-5 h-5 mr-1" /> Cancel
          </button>
        </div>

        {/* Step Tracker */}
        {/* Step Tracker */}
<div className="flex justify-center mb-10">
  {steps.map((s) => {
    const isCompleted = step > s.id;
    const isCurrent = step === s.id;

    return (
      <div
        key={s.id}
        className="flex flex-col items-center mx-3 transition-all duration-200"
      >
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full border-2 mb-2 text-sm font-medium transition-all duration-300
            ${
              isCompleted
                ? "bg-blue-600 border-blue-600 text-white shadow-md"
                : isCurrent
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-gray-300 text-gray-400 bg-white"
            }`}
        >
          {s.icon}
        </div>
        <span
          className={`text-sm font-medium ${
            isCompleted || isCurrent ? "text-blue-600" : "text-gray-400"
          }`}
        >
          {s.label}
        </span>
      </div>
    );
  })}
</div>


        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-md">
          {step === 1 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Describe the Issue</h3>
              <label className="block mb-1 font-medium">
                Issue Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full border rounded-md p-3 mb-2 ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Brief descriptive title (e.g. Pothole on Main Street)"
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title}</p>
              )}

              <label className="block mb-1 font-medium mt-4">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`w-full border rounded-md p-3 ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                rows={5}
                placeholder="Describe what’s happening..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm">{errors.description}</p>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Issue Location</h3>
              <label className="block mb-1 font-medium">
                Location Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full border rounded-md p-3 ${
                  errors.location ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter street address or landmark"
              />
              {errors.location && (
                <p className="text-red-500 text-sm">{errors.location}</p>
              )}
            </div>
          )}

          {step === 3 && (
  <div>
    <h3 className="text-xl font-semibold mb-4">
      Issue Category <span className="text-red-500">*</span>
    </h3>
    <p className="text-gray-600 mb-6">
      Select the category that best describes your issue.
    </p>

    <div className="border rounded-lg p-4 shadow-sm bg-white">
      <label className="block mb-2 font-medium text-slate-800">
        Issue Category <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`w-full border-2 rounded-md p-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 ${
            formData.category === "" ? "border-red-400" : "border-gray-300"
          }`}
          required
        >
          <option value="">Select an option</option>
          <option value="Infrastructure">
            Infrastructure — Roads, bridges, sidewalks, public buildings
          </option>
          <option value="Sanitation">
            Sanitation — Garbage collection, waste management, cleanliness
          </option>
          <option value="Public Safety">
            Public Safety — Street lighting, traffic signals, security concerns
          </option>
          <option value="Utilities">
            Utilities — Water supply, electricity, gas, telecommunications
          </option>
          <option value="Transportation">
            Transportation — Public transit, parking, traffic management
          </option>
          <option value="Environment">
            Environment — Parks, trees, pollution, noise complaints
          </option>
        </select>
      </div>
      {formData.category === "" && (
        <p className="text-red-500 text-sm mt-2">
          Please select an issue category.
        </p>
      )}
    </div>

    <div className="mt-6 text-sm text-gray-600 leading-relaxed">
      <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-1">
        <span>📋</span> Category Guidelines:
      </h4>
      <ul className="list-disc list-inside space-y-1">
        <li>
          Choose the category that most accurately represents your concern.
        </li>
        <li>
          Detailed categorization helps the right department respond faster.
        </li>
        <li>
          If unsure, pick the closest match — our AI will assist in final
          classification.
        </li>
      </ul>
    </div>
  </div>
)}

          


          {step === 4 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Upload Photos</h3>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className={`w-full border border-dashed rounded-md p-6 text-center ${
                  errors.photos ? "border-red-500 bg-red-50" : "border-blue-400"
                }`}
              />
              {errors.photos && (
                <p className="text-red-500 text-sm mt-2">{errors.photos}</p>
              )}
            </div>
          )}

          {step === 5 && (
  <div>
    <h3 className="text-xl font-semibold mb-4">Issue Severity <span className="text-red-500">*</span></h3>
    <p className="text-gray-600 mb-6">
      Help us prioritize by selecting the appropriate severity level.
    </p>

    <div className="grid md:grid-cols-2 gap-6">
      {[
        {
          level: "Minor",
          icon: "ℹ️",
          description: "Cosmetic issues, minor inconveniences",
          examples: "Faded paint · Minor litter · Small cracks",
          color: "border-gray-300 hover:border-blue-400 hover:bg-blue-50",
        },
        {
          level: "Medium",
          icon: "⚠️",
          description: "Moderate issues affecting daily use",
          examples: "Potholes · Broken benches · Overgrown vegetation",
          color: "border-yellow-400 bg-yellow-50",
        },
        {
          level: "High",
          icon: "❗",
          description: "Significant problems requiring prompt attention",
          examples: "Damaged sidewalks · Malfunctioning traffic lights · Large debris",
          color: "border-orange-400 bg-orange-50",
        },
        {
          level: "Critical",
          icon: "🚨",
          description: "Urgent safety hazards needing immediate action",
          examples: "Exposed wires · Structural damage · Hazardous spills",
          color: "border-red-400 bg-red-50",
        },
      ].map((option) => (
        <div
          key={option.level}
          onClick={() => setFormData({ ...formData, severity: option.level })}
          className={`cursor-pointer border-2 rounded-xl p-6 transition-all shadow-sm ${
            formData.severity === option.level
              ? `${option.color} border-4`
              : "border-gray-200 hover:shadow-md"
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{option.icon}</span>
            <h4 className="font-semibold text-lg">
              {option.level}
              {formData.severity === option.level && (
                <span className="ml-2 text-green-600">✔️</span>
              )}
            </h4>
          </div>
          <p className="text-gray-700">{option.description}</p>
          <p className="text-sm text-gray-500 mt-2">
            <strong>Examples:</strong> {option.examples}
          </p>
        </div>
      ))}
    </div>

    {errors.severity && (
      <p className="text-red-500 text-sm mt-3">{errors.severity}</p>
    )}

    <div className="mt-6 border-t pt-4 text-sm text-gray-600 leading-relaxed">
      <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-1">
        <span>🧭</span> Severity Assessment:
      </h4>
      <ul className="list-disc list-inside space-y-1">
        <li>Consider immediate safety risks and public impact.</li>
        <li>Critical issues receive priority response within 24 hours.</li>
        <li>Accurate severity helps departments allocate resources efficiently.</li>
      </ul>
    </div>
  </div>
)}


          {step === 6 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact & Privacy</h3>
              <label className="block mb-1 font-medium">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full border rounded-md p-3 ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm">{errors.fullName}</p>
              )}

              <label className="block mb-1 font-medium mt-4">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full border rounded-md p-3 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}

              <label className="block mb-1 font-medium mt-4">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full border rounded-md p-3 ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone}</p>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-10 flex justify-between items-center">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                Submit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
