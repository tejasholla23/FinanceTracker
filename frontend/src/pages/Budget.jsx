import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"

function Budget() {
  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-gray-100 min-h-screen">

        <Navbar />

        <div className="p-6">

          <h2 className="text-xl font-semibold mb-4">Budget</h2>

          <div className="bg-white p-6 rounded shadow w-96">

            <p className="mb-2">Monthly Budget</p>

            <div className="w-full bg-gray-200 rounded-full h-4">
              <div className="bg-green-500 h-4 rounded-full w-2/3"></div>
            </div>

            <p className="mt-2 text-sm">₹20000 / ₹30000 used</p>

          </div>

        </div>

      </div>
    </div>
  )
}

export default Budget