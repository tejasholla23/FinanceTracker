import { useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import FloatingButtons from "../components/FloatingButtons"
import { fetchTransactions } from "../api/transactions"

function Budget() {
  const [budgets, setBudgets] = useState([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchTransactions();
        if (res.success && res.data && res.data.length > 0) {
          let income = 0;
          let expense = 0;
          const catMap = {};

          res.data.forEach(txn => {
            const amt = parseFloat(txn.amount) || 0;
            if (txn.type === 'income') {
              income += amt;
            } else if (txn.type === 'expense') {
              expense += amt;
              if (!catMap[txn.category]) catMap[txn.category] = 0;
              catMap[txn.category] += amt;
            }
          });

          const sortedCategories = Object.keys(catMap).sort((a, b) => catMap[b] - catMap[a]);

          const totalCatCount = sortedCategories.length || 1;
          const baseLimit = Math.floor(income / totalCatCount);

          const derivedBudgets = sortedCategories.map(cat => ({
            category: cat,
            spent: catMap[cat],
            limit: baseLimit > 0 ? baseLimit : (catMap[cat] + 1000)
          }));

          setTotalIncome(income);
          setTotalExpenses(expense);
          setBudgets(derivedBudgets);
        }
      } catch (err) {
        console.error("Error fetching transactions for budget:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading your budgets...</p>
        </div>
      </div>
    );
  }

  if (!loading && totalIncome === 0 && totalExpenses === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 border border-gray-100 dark:border-gray-700 animate-slideUp">
            <span className="text-6xl mb-6 block">📊</span>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">No transactions yet.</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 max-w-md mx-auto">
              Start adding your income and expenses to see your dynamic budget insights and spending progress.
            </p>
          </div>
        </div>
        <FloatingButtons />
      </div>
    );
  }

  const totalLimit = totalIncome > 0 ? totalIncome : 1;
  const totalSpent = totalExpenses;
  const percentage = Math.round((totalSpent / totalLimit) * 100) || 0;
  const remaining = totalIncome - totalSpent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <FloatingButtons />

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">Budget Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Track and manage your monthly spending limits based on your income.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 animate-slideUp">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Monthly Overview</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/40 rounded-xl p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-2">Total Budget (Income)</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">₹{totalIncome.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/40 rounded-xl p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-2">Total Spent</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">₹{totalSpent.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/40 rounded-xl p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-2">Remaining</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">₹{remaining.toLocaleString()}</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-800 dark:text-gray-200">Overall Progress</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${percentage > 80
                    ? "bg-gradient-to-r from-red-400 to-red-600"
                    : percentage > 50
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                      : "bg-gradient-to-r from-green-400 to-green-600"
                  }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {budgets.length > 0 && (
          <div className="space-y-4 animate-slideUp" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 px-1">
              Category Spending vs Average Allocation
            </h3>

            {budgets.map((budget, idx) => {
              const categoryPercentage = Math.round((budget.spent / budget.limit) * 100) || 0;
              const isOver = budget.spent > budget.limit;

              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow hover:shadow-lg transition-all duration-300 animate-fadeIn"
                  style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-100 text-lg">{budget.category}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ₹{budget.spent.toLocaleString()} / ₹{budget.limit.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`font-bold text-lg ${isOver ? "text-red-500" : categoryPercentage > 75 ? "text-yellow-500" : "text-green-500"
                          }`}
                      >
                        {categoryPercentage}%
                      </p>

                      {isOver && (
                        <p className="text-xs text-red-500 font-semibold">
                          Over Target Allocation!
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${isOver
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
        )}
      </div>
    </div>
  )
}

export default Budget