"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { post } from "@/app/util"; // adjust import path if needed

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Use our 'post' helper with 'jsonBody'
      const response = await post("auth/login/", {
        jsonBody: {
          username,
          password,
        },
      });
      console.log(response);
      // On success, navigate away
      router.push("/marketplace");
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-80"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium mb-1">
            User Name
          </label>
          <input
            type="text"
            id="userName"
            className="w-full p-2 border rounded-lg"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full p-2 border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
          Login
        </button>
      </form>
    </div>
  );
}
