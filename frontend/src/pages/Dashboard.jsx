import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"

function Dashboard() {
  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-gray-100 min-h-screen">

        <Navbar />

        <div className="p-6 grid grid-cols-3 gap-6">

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500">Total Income</h3>
            <p className="text-2xl font-bold text-green-500">₹25,000</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500">Total Expenses</h3>
            <p className="text-2xl font-bold text-red-500">₹12,000</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500">Balance</h3>
            <p className="text-2xl font-bold text-blue-500">₹13,000</p>
          </div>

        </div>

      </div>
    </div>
  )
}

export default Dashboard