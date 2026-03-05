import { useState } from "react"
import Navbar from "../components/Navbar"
import FloatingButtons from "../components/FloatingButtons"

function Budget() {
  const [budgets] = useState([
    { category: "Food", limit: 10000, spent: 8500 },
    { category: "Transport", limit: 5000, spent: 4200 },
    { category: "Utilities", limit: 8000, spent: 6200 },
    { category: "Entertainment", limit: 5000, spent: 4700 },
    { category: "Shopping", limit: 8000, spent: 5100 },
  ])

  const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const percentage = Math.round((totalSpent / totalLimit) * 100)
  const remaining = totalLimit - totalSpent

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <FloatingButtons />

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Budget Management</h2>
          <p className="text-gray-600">Track and manage your monthly spending limits</p>
        </div>

        {/* Overall Budget Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 animate-slideUp">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Monthly Overview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
              <p className="text-gray-600 mb-2">Total Budget</p>
              <p className="text-3xl font-bold text-blue-600">₹{totalLimit.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6">
              <p className="text-gray-600 mb-2">Total Spent</p>
              <p className="text-3xl font-bold text-red-600">₹{totalSpent.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
              <p className="text-gray-600 mb-2">Remaining</p>
              <p className="text-3xl font-bold text-green-600">₹{remaining.toLocaleString()}</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-800">Overall Progress</span>
              <span className="font-bold text-blue-600">{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  percentage > 80
                    ? "bg-gradient-to-r from-red-400 to-red-600"
                    : percentage > 50
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                      : "bg-gradient-to-r from-green-400 to-green-600"
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Category Budgets */}
        <div className="space-y-4 animate-slideUp" style={{ animationDelay: "0.2s" }}>
          {budgets.map((budget, idx) => {
            const categoryPercentage = Math.round((budget.spent / budget.limit) * 100)
            const isOver = budget.spent > budget.limit

            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition-all duration-300 animate-fadeIn"
                style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{budget.category}</p>
                      <p className="text-sm text-gray-500">₹{budget.spent.toLocaleString()} / ₹{budget.limit.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${
                      isOver ? "text-red-500" : categoryPercentage > 75 ? "text-yellow-500" : "text-green-500"
                    }`}>
                      {categoryPercentage}%
                    </p>
                    {isOver && <p className="text-xs text-red-500 font-semibold">Over Budget!</p>}
                  </div>
                </div>

                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      isOver
                        ? "bg-red-500"
                        : categoryPercentage > 75
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(categoryPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Budget