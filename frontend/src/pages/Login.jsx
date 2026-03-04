function Login() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow w-80">

        <h2 className="text-2xl font-bold mb-6 text-center">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-4 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-4 rounded"
        />

        <button className="bg-blue-500 text-white w-full py-2 rounded">
          Login
        </button>

      </div>

    </div>
  )
}

export default Login