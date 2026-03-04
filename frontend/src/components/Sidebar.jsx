import { Link } from "react-router-dom"

function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col p-5">
      <h1 className="text-2xl font-bold mb-8">Finance Tracker</h1>

      <nav className="flex flex-col gap-4">
        <Link to="/dashboard" className="hover:bg-gray-700 p-2 rounded">
          Dashboard
        </Link>

        <Link to="/add" className="hover:bg-gray-700 p-2 rounded">
          Add Transaction
        </Link>

        <Link to="/transactions" className="hover:bg-gray-700 p-2 rounded">
          Transactions
        </Link>

        <Link to="/budget" className="hover:bg-gray-700 p-2 rounded">
          Budget
        </Link>
      </nav>
    </div>
  )
}

export default Sidebar