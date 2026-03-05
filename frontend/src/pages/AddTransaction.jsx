import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import FloatingButtons from "../components/FloatingButtons"
import { addTransaction } from "../api/transactions"

function AddTransaction() {
  const [formData, setFormData] = useState({ category: "", amount: "", type: "expense", description: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const categories = [
    { name: "Food" },
    { name: "Transport" },
    { name: "Utilities" },
    { name: "Entertainment" },
    { name: "Shopping" },
    { name: "Health" },
  ]

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    
    if (!formData.category) {
      setError("Please select a category")
      return
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setLoading(true)
    const payload = {
      category: formData.category,
      amount: parseFloat(formData.amount),
      type: formData.type,
      description: formData.description,
      date: new Date().toISOString().split("T")[0],
    }
    const res = await addTransaction(payload)
    setLoading(false)
    
    if (res.success) {
      // navigate back to transactions list
      navigate("/transactions")
    } else {
      setError(res.message || "Failed to add transaction")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <FloatingButtons />

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Add Transaction</h2>
          <p className="text-gray-600">Record a new income or expense</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6 animate-slideUp">
          {error && (
            <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Transaction Type</label>
            <div className="flex gap-4">
              {["expense", "income"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${formData.type === type
                    ? type === "income"
                      ? "bg-green-500 text-white shadow-lg"
                      : "bg-red-500 text-white shadow-lg"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {type === "income" ? "Income" : "Expense"}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.name })}
                  className={`p-4 rounded-lg transition-all duration-300 font-semibold flex flex-col items-center gap-2 ${
                    formData.category === cat.name
                      ? "bg-blue-500 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="text-sm">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter transaction details..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-300"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-300 text-lg"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Adding..." : "Add Transaction"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddTransaction