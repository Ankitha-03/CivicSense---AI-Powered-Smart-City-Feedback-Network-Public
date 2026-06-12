import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, MapPin, Tag, Image as ImageIcon, AlertTriangle,
  User, ArrowRight, ArrowLeft, CheckCircle2, Upload, X,
  Info, AlertCircle, Flame, LocateFixed, Loader2,
} from "lucide-react";

const SEVERITY_ICONS = {
  minor:    Info,
  medium:   AlertTriangle,
  high:     AlertCircle,
  critical: Flame,
};
import { submitIssue } from "../api/issuesApi";
import { useToast } from "../hooks/useToast";
import PageWrapper from "../components/layout/PageWrapper";
import { validateStep } from "../utils/validators";
import { CATEGORIES, SEVERITIES } from "../utils/constants";

const STEPS = [
  { id: 1, label: "Basic Info", icon: FileText },
  { id: 2, label: "Location",   icon: MapPin },
  { id: 3, label: "Category",   icon: Tag },
  { id: 4, label: "Photos",     icon: ImageIcon },
  { id: 5, label: "Severity",   icon: AlertTriangle },
  { id: 6, label: "Contact",    icon: User },
];

function ProgressBar({ step, total }) {
  const pct = ((step - 1) / (total - 1)) * 100;
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-3 overflow-x-auto pb-1 gap-1">
        {STEPS.map((s) => {
          const done    = step > s.id;
          const current = step === s.id;
          const Icon    = s.icon;
          return (
            <div key={s.id} className="flex flex-col items-center gap-1 min-w-[56px]">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${done    ? "bg-blue-600 border-blue-600 text-white"
                  : current ? "bg-white border-blue-600 text-blue-600 shadow-md shadow-blue-100"
                  :           "bg-white border-gray-200 text-gray-400"}`}
              >
                {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`text-[10px] font-semibold text-center leading-tight ${done || current ? "text-blue-600" : "text-gray-400"}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#1a56db] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="text-red-500 text-xs mt-1.5 font-medium">{msg}</p>;
}

function Field({ label, required, error, children }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      <FieldError msg={error} />
    </div>
  );
}

const inputClass = (err) =>
  `w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition-colors
  ${err ? "border-red-400 bg-red-50" : "border-gray-200"}`;

function DropZone({ photos, onChange, error }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const addFiles = (files) => {
    const newFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    onChange([...photos, ...newFiles].slice(0, 5));
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, [photos]);

  const removePhoto = (i) => onChange(photos.filter((_, idx) => idx !== i));

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-150
          ${dragging ? "border-[#1a56db] bg-blue-50" : error ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-[#1a56db] hover:bg-blue-50/40"}`}
      >
        <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
        <p className="text-sm font-semibold text-gray-700">
          {dragging ? "Drop photos here" : "Drag & drop photos here"}
        </p>
        <p className="text-xs text-gray-400 mt-1">or click to browse — up to 5 images</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-3">
          {photos.map((file, i) => (
            <div key={i} className="relative group aspect-square">
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${i + 1}`}
                className="w-full h-full object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <FieldError msg={error} />
    </div>
  );
}

function SuccessScreen({ issueId, category, onViewReports }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <CheckCircle2 className="w-14 h-14 text-[#0e9f6e] mb-5" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h2>
      <p className="text-gray-500 text-sm mb-6 max-w-sm">
        Your civic issue has been recorded and will be reviewed shortly. Thank you for making a difference!
      </p>
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-8 w-full max-w-xs space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Report ID</span>
          <span className="font-bold text-gray-900">#{issueId}</span>
        </div>
        {category && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Category</span>
            <span className="font-medium text-[#1a56db] capitalize">{category}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Status</span>
          <span className="font-semibold text-[#d97706]">Pending Review</span>
        </div>
      </div>
      <button
        onClick={onViewReports}
        className="px-8 py-3 bg-[#1a56db] text-white rounded-lg font-semibold hover:bg-[#1e429f] transition-colors duration-150 shadow-sm"
      >
        View My Reports
      </button>
    </div>
  );
}

export default function ReportIssue() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const [formData, setFormData] = useState({
    title: "", description: "", location: "", category: "",
    photos: [], severity: "", fullName: "", email: "", phone: "",
    lat: null, lng: null,
  });

  const [geoState, setGeoState] = useState("idle"); // idle | detecting | detected | error
  const [geoMessage, setGeoMessage] = useState("");

  const set = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handle = (e) => set(e.target.name, e.target.value);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setGeoState("error");
      setGeoMessage("Geolocation is not supported by your browser. Please type the address manually.");
      return;
    }
    setGeoState("detecting");
    setGeoMessage("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        set("lat", latitude.toFixed(6));
        set("lng", longitude.toFixed(6));
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const parts = [
            addr.road || addr.pedestrian || addr.footway,
            addr.suburb || addr.neighbourhood || addr.village || addr.quarter,
            addr.city || addr.town || addr.county,
            addr.postcode,
          ].filter(Boolean);
          const addressStr =
            parts.length > 0
              ? parts.join(", ")
              : data.display_name || `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
          set("location", addressStr);
        } catch {
          set("location", `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
        }
        setGeoState("detected");
        setGeoMessage("Location detected — you can edit the address if needed");
      },
      (err) => {
        setGeoState("error");
        setGeoMessage(
          err.code === err.PERMISSION_DENIED
            ? "Location access denied. Please type the address manually."
            : "Couldn't detect location. Please type the address manually."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const goNext = () => {
    const errs = validateStep(step, formData);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setStep((s) => s + 1);
  };

  const goPrev = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep(step, formData);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title",       formData.title);
      fd.append("description", formData.description);
      fd.append("location",    formData.location);
      fd.append("category",    formData.category);
      fd.append("severity",    formData.severity);
      fd.append("contact",     formData.fullName);
      fd.append("email",       formData.email);
      fd.append("phone",       formData.phone);
      if (formData.lat)  fd.append("latitude",  formData.lat);
      if (formData.lng)  fd.append("longitude", formData.lng);
      formData.photos.forEach((f) => fd.append("photos", f));

      const data = await submitIssue(fd);
      setSubmitted({ id: data.issue_id, category: data.category });
    } catch (err) {
      const msg = err.response?.data?.error ?? err.response?.data?.message ?? "Failed to submit report. Please try again.";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Discard this report and go back?")) navigate("/");
  };

  if (submitted) {
    return (
      <PageWrapper>
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <SuccessScreen
            issueId={submitted.id}
            category={submitted.category}
            onViewReports={() => navigate("/my-reports")}
          />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Report New Issue</h1>
            <p className="text-gray-500 text-sm mt-0.5">Step {step} of {STEPS.length}</p>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
        </div>

        {/* Progress */}
        <ProgressBar step={step} total={STEPS.length} />

        {/* Form card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1 – Basic Info */}
            {step === 1 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-5">Describe the Issue</h2>
                <Field label="Issue Title" required error={errors.title}>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handle}
                    className={inputClass(errors.title)}
                    placeholder="e.g. Pothole on Main Street near Signal"
                    aria-describedby={errors.title ? "title-error" : undefined}
                  />
                </Field>
                <Field label="Detailed Description" required error={errors.description}>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handle}
                    rows={5}
                    className={inputClass(errors.description)}
                    placeholder="Describe what's happening, when it started, and who is affected…"
                  />
                </Field>
              </div>
            )}

            {/* Step 2 – Location */}
            {step === 2 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-5">Issue Location</h2>

                {/* Auto-detect button */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={geoState === "detecting"}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-colors duration-150
                      ${geoState === "detecting"
                        ? "border-blue-300 text-blue-400 bg-white cursor-not-allowed"
                        : "border-[#1a56db] text-[#1a56db] bg-white hover:bg-[#1a56db] hover:text-white"
                      }`}
                  >
                    {geoState === "detecting" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Detecting your location...
                      </>
                    ) : (
                      <>
                        <LocateFixed className="w-4 h-4" />
                        Use My Current Location
                      </>
                    )}
                  </button>
                  {geoState === "error" && (
                    <p className="text-xs text-red-500 mt-1.5">{geoMessage}</p>
                  )}
                </div>

                <Field label="Address or Landmark" required error={errors.location}>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handle}
                    className={inputClass(errors.location)}
                    placeholder="e.g. 12th Cross, Indiranagar, Bengaluru"
                  />
                </Field>

                {geoState === "detected" && (
                  <p className="text-xs text-gray-500 -mt-3 mb-4">{geoMessage}</p>
                )}

                <p className="text-xs text-gray-400 mt-2">
                  Be as specific as possible — street name, landmark, or area helps authorities locate the issue faster.
                </p>
              </div>
            )}

            {/* Step 3 – Category */}
            {step === 3 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Issue Category</h2>
                <p className="text-gray-500 text-sm mb-5">Choose the category that best fits your report.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CATEGORIES.map((cat) => {
                    const selected = formData.category === cat.value;
                    return (
                      <button
                        type="button"
                        key={cat.value}
                        onClick={() => set("category", cat.value)}
                        className={`text-left p-4 rounded-lg border-2 transition-colors duration-150
                          ${selected ? "border-[#1a56db] bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"}`}
                      >
                        <p className={`font-semibold text-sm ${selected ? "text-blue-700" : "text-gray-800"}`}>{cat.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{cat.description}</p>
                      </button>
                    );
                  })}
                </div>
                <FieldError msg={errors.category} />
              </div>
            )}

            {/* Step 4 – Photos */}
            {step === 4 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Upload Photos</h2>
                <p className="text-gray-500 text-sm mb-5">Photos help authorities understand and address the issue faster.</p>
                <DropZone
                  photos={formData.photos}
                  onChange={(files) => set("photos", files)}
                  error={errors.photos}
                />
              </div>
            )}

            {/* Step 5 – Severity */}
            {step === 5 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Severity Level</h2>
                <p className="text-gray-500 text-sm mb-5">Help prioritize by selecting how serious this issue is.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SEVERITIES.map((opt) => {
                    const selected = formData.severity === opt.value;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => set("severity", opt.value)}
                        className={`text-left p-5 rounded-lg border-2 transition-colors duration-150
                          ${selected ? `${opt.color} border-current` : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {(() => { const SIcon = SEVERITY_ICONS[opt.value]; return <SIcon className="w-4 h-4 shrink-0" />; })()}
                          <span className={`font-bold text-sm ${selected ? "" : "text-gray-800"}`}>{opt.label}</span>
                          {selected && <CheckCircle2 className="w-4 h-4 ml-auto text-current" />}
                        </div>
                        <p className={`text-xs leading-relaxed ${selected ? "opacity-80" : "text-gray-500"}`}>{opt.description}</p>
                        <p className={`text-xs mt-1 ${selected ? "opacity-60" : "text-gray-400"}`}>{opt.examples}</p>
                      </button>
                    );
                  })}
                </div>
                <FieldError msg={errors.severity} />
              </div>
            )}

            {/* Step 6 – Contact */}
            {step === 6 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-5">Contact Information</h2>
                <Field label="Full Name" required error={errors.fullName}>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handle}
                    className={inputClass(errors.fullName)}
                    placeholder="Your full name"
                  />
                </Field>
                <Field label="Email Address" required error={errors.email}>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handle}
                    className={inputClass(errors.email)}
                    placeholder="you@example.com"
                  />
                </Field>
                <Field label="Phone Number" required error={errors.phone}>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handle}
                    className={inputClass(errors.phone)}
                    placeholder="+91 9876543210"
                  />
                </Field>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={goPrev}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                >
                  <ArrowLeft className="w-4 h-4" /> Previous
                </button>
              ) : <div />}

              {step < STEPS.length ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-[#1a56db] text-white rounded-lg hover:bg-[#1e429f] transition-colors duration-150 shadow-sm"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-[#0e9f6e] text-white rounded-lg hover:bg-green-800 transition-colors duration-150 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting…" : "Submit Report"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}
