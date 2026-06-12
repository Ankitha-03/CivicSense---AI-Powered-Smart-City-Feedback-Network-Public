import React from "react";
import Navbar from "./Navbar";

export default function PageWrapper({ children, className = "" }) {
  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      <Navbar />
      <main className={`flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 animate-fade-in ${className}`}>
        {children}
      </main>
    </div>
  );
}
