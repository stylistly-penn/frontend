import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-4 px-4">
      <h1 className="text-2xl font-bold mb-4">Home</h1>
      <h2 className="text-xl font-semibold mb-6">Welcome, You</h2>

      <div className="flex space-x-2 mb-6">
        <div className="w-8 h-8 bg-red-500 rounded-full"></div>
        <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
        <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
        <div className="w-8 h-8 bg-green-500 rounded-full"></div>
      </div>

      <h3 className="text-lg font-semibold mb-2">My Stylists</h3>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {["Fall", "Prom", "Work", "Date night", "Casual", "Gym"].map(
          (label, index) => (
            <Link
              to={`/stylist/${label.toLowerCase()}`}
              key={index}
              className="bg-gray-300 text-center py-2 rounded-lg shadow-md hover:bg-gray-400"
            >
              {label}
            </Link>
          )
        )}
        <button className="bg-gray-300 text-center py-2 rounded-lg shadow-md hover:bg-gray-400">
          +
        </button>
      </div>

      <h3 className="text-lg font-semibold mb-2">My Style</h3>
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-8 h-8 bg-red-500 rounded-full"></div>
        <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
        <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
        <div className="w-8 h-8 bg-green-500 rounded-full"></div>
      </div>
      <p className="text-sm">You're an Autumn</p>

      <div className="mt-auto flex justify-between w-full px-4">
        <Link
          to="/marketplace"
          className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md"
        >
          Marketplace
        </Link>
        <Link
          to="/profile"
          className="bg-green-500 text-white py-2 px-4 rounded-lg shadow-md"
        >
          Profile
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
