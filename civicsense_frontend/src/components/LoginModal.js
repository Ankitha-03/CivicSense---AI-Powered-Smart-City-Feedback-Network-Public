// src/components/LoginModal.js
import React, { useState } from "react";

const LoginModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-xl w-96 shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded mb-3"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded mb-3"
        />
        <button className="bg-blue-600 text-white w-full py-2 rounded">
          Login
        </button>
        <button
          onClick={onClose}
          className="mt-3 text-gray-600 hover:text-black w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
