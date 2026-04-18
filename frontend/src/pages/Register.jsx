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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await register({ name, email, password });
      if (res.success) {
        const token = res.data?.token;
        const user = res.data?.user;
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("name", user?.name || "");
        }
        navigate("/dashboard");
      } else {
        setError(res.message || "Registration failed");
      }
    } catch (err) {
      console.error("register error", err);
      setError(err.message || "Registration error");
    }
    setLoading(false);
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