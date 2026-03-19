import React from "react";

export default function ICUDashboard() {
  return (
    <div className="flex h-screen bg-gray-200 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-[#0b1a33] text-white flex flex-col items-center py-6">
        <h1 className="text-xl font-semibold mb-8 tracking-wide">CHRONOS</h1>
        <nav className="flex flex-col gap-4 w-full px-4">
          {[
            "Dashboard",
            "Patients",
            "Alerts",
            "Vitals",
            "Reports",
            "Settings",
          ].map((item) => (
            <button
              key={item}
              className="bg-gray-200 text-gray-800 rounded-lg py-2 text-sm hover:bg-gray-300 transition"
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="p-4">
          <input
            type="text"
            placeholder="Search"
            className="w-64 px-4 py-2 rounded-full bg-gray-300 outline-none"
          />
        </div>

        {/* Content Area */}
        <div className="px-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            ICU DASHBOARD
          </h2>
        </div>
      </div>
    </div>
  );
}
