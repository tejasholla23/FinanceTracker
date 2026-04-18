import { useState } from "react"
import { updateTransaction, deleteTransaction } from "../api/transactions"

function TransactionModal({ txn, onClose, onUpdated, onDeleted }) {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    category: txn.category,
    amount: String(txn.amount).replace(/[₹,+-]/g, ""),
    description: txn.description || "",
    type: txn.type,
    date: txn.date ? new Date(txn.date).toISOString().split("T")[0] : "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const save = async () => {
    setLoading(true)
    const payload = {
      category: form.category,
      amount: parseFloat(form.amount),
      description: form.description,
      type: form.type,
      date: form.date,
    }
    const res = await updateTransaction(txn.id, payload)
    setLoading(false)
    if (res.success) {
      onUpdated(res.data)
      setIsEditing(false)
    } else {
      alert(res.message || "Failed to update")
    }
  }

  const remove = async () => {
    if (!window.confirm("Delete this transaction?")) return
    setLoading(true)
    const res = await deleteTransaction(txn.id)
    setLoading(false)
    if (res.success) {
      onDeleted(txn.id)
    } else {
      alert(res.message || "Failed to delete")
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-11/12 max-w-md p-6 relative animate-slideDown shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>

        <h3 className="text-2xl font-bold mb-4 dark:text-gray-100">
          {isEditing ? "Edit Transaction" : "Transaction Details"}
        </h3>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
              <input
                name="amount"
                value={form.amount}
                onChange={handleChange}
                type="number"
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
              <input
                name="date"
                value={form.date}
                onChange={handleChange}
                type="date"
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white px-3 py-2"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white px-3 py-2"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                disabled={loading}
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={save}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 dark:text-gray-300">
            <p><strong className="dark:text-gray-100">Category:</strong> {txn.category}</p>
            <p><strong className="dark:text-gray-100">Amount:</strong> {txn.amount}</p>
            <p><strong className="dark:text-gray-100">Type:</strong> {txn.type}</p>
            <p><strong className="dark:text-gray-100">Date:</strong> {txn.date}</p>
            <p><strong className="dark:text-gray-100">Description:</strong> {txn.description || "-"}</p>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                Edit
              </button>
              <button
                onClick={remove}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionModal
