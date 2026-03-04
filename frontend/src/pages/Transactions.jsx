import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"

function Transactions() {
  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-gray-100 min-h-screen">

        <Navbar />

        <div className="p-6">

          <h2 className="text-xl font-semibold mb-4">Transactions</h2>

          <table className="w-full bg-white rounded shadow">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Category</th>
                <th className="p-3">Amount</th>
              </tr>
            </thead>

            <tbody>
              <tr className="text-center border-t">
                <td className="p-3">12 Mar</td>
                <td className="p-3">Food</td>
                <td className="p-3 text-red-500">₹500</td>
              </tr>
            </tbody>
          </table>

        </div>

      </div>
    </div>
  )
}

export default Transactions