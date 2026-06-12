import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import { loginApi, registerApi } from "../api/authApi";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import loginPhoto from "../assets/login_photo.jpg";

function InputField({ label, type = "text", name, placeholder, required, value, onChange, rightEl }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>}
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition-colors duration-150"
        />
        {rightEl && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightEl}</div>
        )}
      </div>
    </div>
  );
}

export default function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState({ fullName: "", email: "", password: "" });

  const navigate = useNavigate();
  const { loginUser, setAuthFromTokens } = useAuth();
  const showToast = useToast();

  const set = (name, value) => setFields((prev) => ({ ...prev, [name]: value }));
  const handle = (e) => set(e.target.name, e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullName, email, password } = fields;

    if (!email || !password) {
      showToast("Please fill in all required fields.", "warning");
      return;
    }
    if (!isLogin && !fullName.trim()) {
      showToast("Full name is required for sign up.", "warning");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { ok, data } = await loginApi(email, password);
        if (!ok) {
          const msg = data.non_field_errors?.[0] ?? data.email?.[0] ?? data.detail ?? data.error ?? "Invalid credentials.";
          showToast(msg, "error");
          return;
        }
        const access  = data.tokens?.access  ?? data.access  ?? data.key;
        const refresh = data.tokens?.refresh ?? data.refresh ?? data.key;
        if (!access) { showToast("Login failed — no token received.", "error"); return; }
        setAuthFromTokens(access, refresh, data.user ?? null);
        showToast("Welcome back!", "success");
        navigate("/");
      } else {
        const username = (fullName || email.split("@")[0]).replace(/\s+/g, "").toLowerCase();
        const { ok, data } = await registerApi(email, username, password);
        if (!ok) {
          const msg =
            data.email?.[0] ?? data.username?.[0] ?? data.password1?.[0] ??
            data.non_field_errors?.[0] ?? data.error ?? "Sign up failed. Please try again.";
          showToast(msg, "error");
          return;
        }
        const access  = data.tokens?.access  ?? data.access  ?? data.key;
        const refresh = data.tokens?.refresh ?? data.refresh ?? data.key;
        if (!access) { showToast("Account created! Please sign in.", "success"); setIsLogin(true); return; }
        setAuthFromTokens(access, refresh, data.user ?? null);
        showToast("Account created! Welcome to CivicSense.", "success");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] px-4 py-12">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex">
        {/* Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-[#1a56db] flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">CS</span>
            </div>
            <span className="text-xl font-bold text-[#1a56db]">CivicSense</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {isLogin ? "Sign in to your account" : "Create an account"}
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            {isLogin ? "Report civic issues and track their progress." : "Join thousands improving their cities."}
          </p>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <InputField
                label="Full Name"
                name="fullName"
                value={fields.fullName}
                onChange={handle}
                placeholder="Ankitha Pradhan"
                required
              />
            )}
            <InputField
              label="Email Address"
              type="email"
              name="email"
              value={fields.email}
              onChange={handle}
              placeholder="you@example.com"
              required
            />
            <InputField
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={fields.password}
              onChange={handle}
              placeholder="••••••••"
              required
              rightEl={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-[#1a56db] text-white rounded-lg font-semibold text-sm hover:bg-[#1e429f] transition-colors duration-150 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Please wait…" : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Department officer?{" "}
              <Link
                to="/department/login"
                className="text-[#1a56db] font-semibold hover:underline"
              >
                Sign in to the department portal
              </Link>
            </p>
          </div>
        </div>

        {/* Image panel */}
        <div
          className="hidden md:flex w-1/2 relative flex-col justify-end p-10 text-white"
          style={{
            backgroundImage: `url(${loginPhoto})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-blue-900/70" />
          <div className="relative z-10">
            <h3 className="text-3xl font-extrabold mb-2 drop-shadow">See it. Report it. Fix it.</h3>
            <p className="text-blue-200 text-sm leading-relaxed">
              CivicSense connects citizens with local government to resolve infrastructure, sanitation, and safety issues faster.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
