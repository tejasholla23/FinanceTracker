import Navbar from "../components/Navbar"
import FloatingButtons from "../components/FloatingButtons"
import { useState, useEffect } from "react"
import { fetchStatistics } from "../api/transactions"

function Dashboard() {
  const [data, setData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    monthlyTrend: [],
  })

  useEffect(() => {
    const loadStats = async () => {
      const res = await fetchStatistics();
      if (res.success) {
        setData((d) => ({
          ...d,
          totalIncome: res.data.totalIncome,
          totalExpenses: res.data.totalExpenses,
          balance: res.data.balance,
          // we could derive monthly trend from stats if backend provided
        }));
      } else if (res.message && res.message.toLowerCase().includes("unauthorized")) {
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        window.location.href = "/"; // simple redirect
      }
    };
    loadStats();
  }, []);

  const expenseCategories = [
    { category: "Food", amount: 8500, percentage: 30, color: "#FF6B6B" },
    { category: "Transport", amount: 5100, percentage: 18, color: "#4ECDC4" },
    { category: "Utilities", amount: 6200, percentage: 22, color: "#95E1D3" },
    { category: "Entertainment", amount: 4700, percentage: 17, color: "#FFA07A" },
    { category: "Others", amount: 4000, percentage: 13, color: "#B4A7D6" }
  ]

  const topTransactions = [
    { id: 1, description: "Salary Deposit", amount: "+₹45,000", type: "income", date: "Mar 1" },
    { id: 2, description: "Freelance Project", amount: "+₹20,000", type: "income", date: "Mar 15" },
    { id: 3, description: "Rent Payment", amount: "-₹15,000", type: "expense", date: "Mar 5" },
    { id: 4, description: "Grocery Shopping", amount: "-₹3,500", type: "expense", date: "Mar 20" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <FloatingButtons />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
          <p className="text-gray-600">Here's your financial overview for March 2026</p>
        </div>

        {/* Key Metrics Cards - Enhanced with animations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Income Card */}
          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-slideUp" style={{ animationDelay: "0.1s" }}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold opacity-90">Total Income</h3>
            </div>
            <p className="text-4xl font-bold mb-2">₹{data.totalIncome.toLocaleString()}</p>
            <p className="text-green-100 text-sm">↑ 25% from last month</p>
          </div>

          {/* Expenses Card */}
          <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-slideUp" style={{ animationDelay: "0.2s" }}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold opacity-90">Total Expenses</h3>
            </div>
            <p className="text-4xl font-bold mb-2">₹{data.totalExpenses.toLocaleString()}</p>
            <p className="text-red-100 text-sm">↑ 5% from last month</p>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-slideUp" style={{ animationDelay: "0.3s" }}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold opacity-90">Current Balance</h3>
            </div>
            <p className="text-4xl font-bold mb-2">₹{data.balance.toLocaleString()}</p>
            <p className="text-blue-100 text-sm">Savings status: Excellent</p>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Monthly Trend */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slideUp" style={{ animationDelay: "0.4s" }}>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Income vs Expenses Trend</h3>
            <div className="space-y-6">
              {data.monthlyTrend.map((trend, idx) => (
                <div key={idx} className="space-y-2 animate-fadeIn" style={{ animationDelay: `${0.5 + idx * 0.1}s` }}>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-gray-700">{trend.month}</span>
                    <span className="text-sm text-gray-600">Income: ₹{trend.income} | Expense: ₹{trend.expense}</span>
                  </div>
                  <div className="flex gap-2 h-8">
                    {/* Income Bar */}
                    <div className="flex-1 bg-green-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-lg transition-all duration-300 ease-out"
                        style={{ width: `${(trend.income / 65000) * 100}%` }}
                      ></div>
                    </div>
                    {/* Expense Bar */}
                    <div className="flex-1 bg-red-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-lg transition-all duration-300 ease-out"
                        style={{ width: `${(trend.expense / 28500) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Savings Goal */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slideUp" style={{ animationDelay: "0.5s" }}>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Savings Goal</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 font-semibold">March Target</span>
                  <span className="text-sm font-bold text-blue-600">72%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: "72%" }}
                  ></div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-600 text-sm mb-2">Target: ₹50,000</p>
                <p className="text-3xl font-bold text-blue-600">₹36,000</p>
                <p className="text-sm text-gray-500 mt-2">₹14,000 remaining</p>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Breakdown & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Expense Categories */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slideUp" style={{ animationDelay: "0.6s" }}>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Expense Breakdown</h3>
            <div className="space-y-4">
              {expenseCategories.map((cat, idx) => (
                <div key={idx} className="animate-fadeIn" style={{ animationDelay: `${0.7 + idx * 0.1}s` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-semibold text-gray-800">{cat.category}</p>
                        <p className="text-sm text-gray-500">₹{cat.amount.toLocaleString()}</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-800">{cat.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slideUp" style={{ animationDelay: "0.7s" }}>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Recent Transactions</h3>
            <div className="space-y-3">
              {topTransactions.map((txn, idx) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-102 animate-fadeIn"
                  style={{ animationDelay: `${0.8 + idx * 0.1}s` }}
                >
                  <div>
                    <p className="font-semibold text-gray-800">{txn.description}</p>
                    <p className="text-xs text-gray-500">{txn.date}</p>
                  </div>
                  <span className={`font-bold text-lg ${txn.type === "income" ? "text-green-500" : "text-red-500"}`}>
                    {txn.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard