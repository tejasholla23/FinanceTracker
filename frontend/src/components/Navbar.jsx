function Navbar() {
  return (
    <div className="w-full bg-white shadow p-4 flex justify-between">
      <h2 className="text-xl font-semibold">Dashboard</h2>

      <button className="bg-red-500 text-white px-4 py-1 rounded">
        Logout
      </button>
    </div>
  )
}

export default Navbar