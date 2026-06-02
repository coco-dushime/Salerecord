import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (mode === "register") {
      if (!form.username.trim() || !form.email.trim() || !form.password) {
        setError("Username, email and password are required.");
        return;
      }
    } else if (!form.username.trim() || !form.password) {
      setError("Username and password are required.");
      return;
    }
    try {
      if (mode === "register") {
        await api.post("/auth/register", {
          username: form.username,
          email: form.email,
          password: form.password,
        });
        setMessage("Account created. Please login.");
        setMode("login");
        setForm({ username: form.username, email: "", password: "" });
        return;
      }
      const { data } = await api.post("/auth/login", {
        username: form.username,
        password: form.password,
      });
      login(data.user, data.token);
    } catch (err) {
      setError(err.response?.data?.message || "Request failed.");
    }
  };

return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-100 px-4">
    <form
      onSubmit={submit}
      className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-bold">S</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-800">
          Sales Record Management
        </h1>
        <p className="text-gray-500 mt-2">SRMS Login System</p>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        <input
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Username"
          value={form.username}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
        />

        {mode === "register" && (
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />
        )}

        <input
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />
      </div>

      {/* Messages */}
      {message && (
        <div className="mt-4 bg-green-100 text-green-700 p-3 rounded-lg text-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition duration-300"
      >
        {mode === "login" ? "Sign In" : "Register"}
      </button>

      {/* Forgot Password */}
      {mode === "login" && (
        <Link
          to="/forgot-password"
          className="block text-center text-blue-600 mt-4 text-sm hover:underline"
        >
          Forgot Password?
        </Link>
      )}

      {/* Toggle Mode */}
      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setError("");
          setForm({
            username: form.username,
            email: "",
            password: "",
          });
        }}
        className="w-full mt-4 text-gray-600 text-sm hover:text-blue-600 transition"
      >
        {mode === "login"
          ? "Don't have an account? Register"
          : "Already have an account? Login"}
      </button>
    </form>
  </div>
);
}
