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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const navigate = useNavigate();

  const load = async () => {
    const params = { page, limit };
    if (filter !== "all") params.type = filter;
    const res = await fetchTransactions(params);
    if (res.success) {
      setTransactions(res.transactions || []);
      setTotalPages(res.totalPages || 1);
      setTotal(res.total || 0);
    } else if (res.message && res.message.toLowerCase().includes("unauthorized")) {
      localStorage.removeItem("token");
      localStorage.removeItem("name");
      navigate("/");
    }
  };

  useEffect(() => {
    load()
  }, [filter, page])

  // Reset to page 1 when filter changes
  const handleFilterChange = (type) => {
    setPage(1);
    setFilter(type);
  };

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
              onClick={() => handleFilterChange(type)}
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
          {transactions.map((txn, idx) => (
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 animate-fadeIn">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className={`px-5 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  page <= 1
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600 shadow hover:shadow-lg"
                }`}
              >
                ← Previous
              </button>
              <span className="text-gray-700 dark:text-gray-300 font-semibold">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className={`px-5 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  page >= totalPages
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600 shadow hover:shadow-lg"
                }`}
              >
                Next →
              </button>
            </div>
          </div>
        )}
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