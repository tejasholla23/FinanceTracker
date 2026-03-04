import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"

function AddTransaction() {
  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-gray-100 min-h-screen">

        <Navbar />

        <div className="p-6">

          <h2 className="text-xl font-semibold mb-4">Add Transaction</h2>

          <form className="bg-white p-6 rounded shadow w-96">

            <input
              type="text"
              placeholder="Category"
              className="border p-2 w-full mb-3 rounded"
            />

            <input
              type="number"
              placeholder="Amount"
              className="border p-2 w-full mb-3 rounded"
            />

            <button className="bg-blue-500 text-white px-4 py-2 rounded w-full">
              Add
            </button>

          </form>

        </div>

      </div>
    </div>
  )
}

export default AddTransaction