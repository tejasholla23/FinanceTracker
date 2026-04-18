import Navbar from "../components/Navbar"
import FloatingButtons from "../components/FloatingButtons"
import InsightsWidget from "../components/InsightsWidget"
import { useState, useEffect } from "react"
import { fetchStatistics, fetchInsights } from "../api/transactions"

function Dashboard() {
  const [data, setData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    monthlyTrend: [],
    expenseCategories: [],
    topTransactions: [],
  })
  
  const [insightsState, setInsightsState] = useState({
    insights: [],
    loading: true,
    error: false
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
          monthlyTrend: res.data.monthlyTrend || [],
          expenseCategories: res.data.expenseCategories || [],
          topTransactions: res.data.topTransactions || [],
        }));
      } else if (res.message && res.message.toLowerCase().includes("unauthorized")) {
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        window.location.href = "/";
      }
    };
    
    const loadInsights = async () => {
      const res = await fetchInsights();
      if (res.success) {
        setInsightsState({ insights: res.insights, loading: false, error: false });
      } else {
        setInsightsState({ insights: [], loading: false, error: true });
      }
    };

    loadStats();
    loadInsights();
  }, []);



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <FloatingButtons />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">Welcome Back!</h2>
          <p className="text-gray-600 dark:text-gray-400">Here's your financial overview for March 2026</p>
        </div>

        {/* Smart Assistant Insights */}
        <InsightsWidget 
          insights={insightsState.insights} 
          loading={insightsState.loading} 
          error={insightsState.error} 
        />

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
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slideUp" style={{ animationDelay: "0.4s" }}>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Income vs Expenses Trend</h3>
            <div className="space-y-6">
              {data.monthlyTrend.map((trend, idx) => (
                <div key={idx} className="space-y-2 animate-fadeIn" style={{ animationDelay: `${0.5 + idx * 0.1}s` }}>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{trend.month}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Income: ₹{trend.income} | Expense: ₹{trend.expense}</span>
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


        </div>

        {/* Expense Breakdown & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Expense Categories */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slideUp" style={{ animationDelay: "0.6s" }}>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Expense Breakdown</h3>
            <div className="space-y-4">
              {data.expenseCategories.map((cat, idx) => (
                <div key={idx} className="animate-fadeIn" style={{ animationDelay: `${0.7 + idx * 0.1}s` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{cat.category}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">₹{parseFloat(cat.amount).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{cat.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slideUp" style={{ animationDelay: "0.7s" }}>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Recent Transactions</h3>
            <div className="space-y-3">
              {data.topTransactions.map((txn, idx) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 transform hover:scale-102 animate-fadeIn"
                  style={{ animationDelay: `${0.8 + idx * 0.1}s` }}
                >
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{txn.description || txn.category}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}</p>
                  </div>
                  <span className={`font-bold text-lg ${txn.type === "income" ? "text-green-500" : "text-red-500"}`}>
                    {txn.type === "income" ? "+" : "-"}₹{parseFloat(txn.amount).toLocaleString()}
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