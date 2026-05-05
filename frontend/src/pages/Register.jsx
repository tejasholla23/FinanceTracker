import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/auth";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const validateForm = () => {
    if (!name || !email || !password) {
      setError("All fields are required");
      return false;
    }

    if (name.length < 2 || name.length > 100) {
      setError("Name must be between 2 and 100 characters");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (password.length < 10) {
      setError("Password must be at least 10 characters long");
      return false;
    }

    return true;
  };

  const handleRegisterError = (err) => {
    console.error("Register error:", err);

    if (err.type === 'rate_limit') {
      setError("Too many registration attempts. Please wait 15 minutes before trying again.");
    } else if (err.type === 'timeout') {
      setError("Request timed out. Please check your connection and try again.");
    } else if (err.type === 'network') {
      setError("Network error. Please check your internet connection.");
    } else if (err.status === 400) {
      setError(err.message || "Registration failed. Please check your information.");
    } else {
      setError(err.message || "Registration error. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await register({ name, email, password });
      
      if (res?.success && res?.data?.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("name", res.data.user?.name || "User");
        navigate("/dashboard");
      } else {
        setError(res?.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      handleRegisterError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-green-600 to-teal-500 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-8 rounded-xl shadow-2xl max-w-md w-full">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-teal-700 dark:text-teal-400">
          Create Account
        </h2>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 p-3 w-full rounded-lg dark:bg-gray-700 dark:text-white"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 p-3 w-full rounded-lg dark:bg-gray-700 dark:text-white"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 p-3 w-full rounded-lg dark:bg-gray-700 dark:text-white"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700 text-white w-full py-3 rounded-lg font-semibold disabled:opacity-50 transition-colors"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="text-center text-sm mt-4 text-gray-700 dark:text-gray-300">
          Already have an account?{' '}
          <a href="/" className="text-teal-600 dark:text-teal-400 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;