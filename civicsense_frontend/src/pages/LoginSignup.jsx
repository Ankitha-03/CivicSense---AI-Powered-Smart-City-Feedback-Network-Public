// src/pages/LoginSignup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import loginPhoto from "../assets/login_photo.jpg";
import "@fontsource/poppins";

export default function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleSubmit = async (e) => {
  e.preventDefault();

  const email = e.target.email.value.trim();
  const password = e.target.password.value.trim();
  const fullName = e.target.fullName?.value.trim();

  const endpoint = isLogin
    ? "http://127.0.0.1:8000/api/auth/login/"
    : "http://127.0.0.1:8000/api/auth/registration/";

  const payload = isLogin
    ? { email, password }
    : {
        email,
        username: (fullName || email.split("@")[0]).replace(/\s+/g, "").toLowerCase(),
        password1: password,
        password2: password,
      };

  console.log("=== SENDING REQUEST ===");
  console.log("Endpoint:", endpoint);
  console.log("Payload:", payload);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("🟩 FULL Server response:", data);
    console.log("Response status:", response.status);

    if (response.ok) {
      alert(`${isLogin ? "Login" : "Signup"} successful 🎉`);

      // ✅ Handle all token formats
      if (data.tokens?.access && data.tokens?.refresh) {
        localStorage.setItem("access_token", data.tokens.access);
        localStorage.setItem("refresh_token", data.tokens.refresh);
      } else if (data.access && data.refresh) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
      } else if (data.key) {
        // Handle dj-rest-auth TokenAuthentication
        localStorage.setItem("access_token", data.key);
        localStorage.setItem("refresh_token", data.key);
      } else {
        console.warn("⚠️ No tokens found in response:", data);
      }

      localStorage.setItem("user", JSON.stringify(data.user || data));

      console.log("✅ Tokens saved, navigating to /home");
      navigate("/home");
    } else {
      // ❌ Backend returned error
      console.error("❌ Backend Error:", data);
      const errorMsg =
        data.non_field_errors?.[0] ||
        data.email?.[0] ||
        data.password?.[0] ||
        data.detail ||
        JSON.stringify(data);
      alert("Error: " + errorMsg);
    }
  } catch (error) {
    console.error("❌ Network Error:", error);
    alert("Something went wrong. Check console for details.");
  }
};

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-blue-300 font-[Poppins]">
      <div className="flex bg-white rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full h-[550px]">
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <p className="text-center text-gray-600 text-sm mb-2">
            Sign in or create an account to report civic issues
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center tracking-wide">
            {isLogin ? "Sign in" : "Sign Up"}
          </h2>

          <form className="flex flex-col" onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                className="mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            )}

            <input
              type="email"
              name="email"
              placeholder="Email"
              className="mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              className="mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

            <button
              type="submit"
              className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md"
            >
              {isLogin ? "Login" : "Sign Up"}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 font-semibold cursor-pointer ml-1 hover:underline"
            >
              {isLogin ? "Sign Up" : "Login"}
            </span>
          </p>
        </div>

        {/* Right Side - Image */}
        <div
          className="hidden md:flex w-1/2 relative flex-col justify-center items-center text-white"
          style={{
            backgroundImage: `url(${loginPhoto})`,
            backgroundSize: "cover",
            backgroundPosition: "center left -40px",
          }}
        >
          <div className="absolute inset-0 bg-blue-700/50"></div>

          <div className="relative z-10 text-center px-6 -mt-10">
            <h1 className="text-3xl font-bold mb-3 drop-shadow-md">
              WELCOME TO CIVICSENSE
            </h1>
            <p className="text-lg tracking-wide font-medium drop-shadow-sm">
              SEE IT. REPORT IT. FIX IT.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}