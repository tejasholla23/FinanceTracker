import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import FloatingButtons from "../components/FloatingButtons"
import TransactionModal from "../components/TransactionModal"
import {
  fetchTransactions,
} from "../api/transactions"

function Transactions() {
  const [filter, setFilter] = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    const params = {};
    if (filter !== "all") params.type = filter;
    const res = await fetchTransactions(params);
    if (res.success) {
      setTransactions(res.data);
    } else if (res.message && res.message.toLowerCase().includes("unauthorized")) {
      // token expired or missing
      localStorage.removeItem("token");
      localStorage.removeItem("name");
      navigate("/");
    }
  };

  useEffect(() => {
    load()
  }, [filter])

  const filtered =
    filter === "all" ? transactions : transactions.filter((txn) => txn.type === filter)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <FloatingButtons />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">All Transactions</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage and review your transaction history</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-6 animate-slideUp">
          {["all", "income", "expense"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                filter === type
                  ? type === "all"
                    ? "bg-blue-500 text-white shadow-lg"
                    : type === "income"
                      ? "bg-green-500 text-white shadow-lg"
                      : "bg-red-500 text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow"
              }`}
            >
              {type === "all" ? "All" : type === "income" ? "Income" : "Expenses"}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        <div className="space-y-3 animate-slideUp">
          {filtered.map((txn, idx) => (
            <div
              key={txn._id || txn.id}
              onClick={() => setSelected(txn)}
              className="cursor-pointer bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition-all duration-300 flex items-center justify-between group hover:scale-102"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100 text-lg">{txn.category}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{txn.description}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold mb-1 ${
                  txn.type === "income" ? "text-green-500" : "text-red-500"
                }`}>
                  {txn.type === "income" ? "+" : "-"}{txn.amount}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(txn.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
        {selected && (
          <TransactionModal
            txn={selected}
            onClose={() => setSelected(null)}
            onUpdated={() => {
              setSelected(null)
              load()
            }}
            onDeleted={(id) => {
              setTransactions((t) => t.filter((x) => (x.id || x._id) !== id))
              setSelected(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default Transactions