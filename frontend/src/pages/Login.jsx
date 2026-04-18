import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // if already authenticated, send to dashboard
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Both fields are required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await login({ email, password });
      if (res.success) {
        const token = res.data?.token;
        const user = res.data?.user;
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("name", user?.name || "");
        }
        navigate("/dashboard");
      } else {
        setError(res.message || "Login failed");
      }
    } catch (err) {
      console.error("login error", err);
      setError(err.message || "Login error");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-700 to-indigo-600 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-8 rounded-xl shadow-2xl max-w-md w-full">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-indigo-700 dark:text-blue-400">
          Welcome Back
        </h2>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 p-3 w-full rounded-lg dark:bg-gray-700 dark:text-white" 
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 p-3 w-full rounded-lg dark:bg-gray-700 dark:text-white" 
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white w-full py-3 rounded-lg font-semibold disabled:opacity-50 transition-colors"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-center text-sm mt-4 text-gray-700 dark:text-gray-300">
          Don't have an account?{' '}
          <a
            href="/register"
            className="text-indigo-600 dark:text-blue-400 hover:underline"
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login