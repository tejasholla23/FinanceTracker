import React from "react";

function InsightsWidget({ insights, loading, error }) {
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-8 text-red-600 dark:text-red-300 shadow-sm transition-all duration-300 animate-fadeIn">
        <div className="flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p className="font-semibold text-red-700 dark:text-red-300">Failed to load insights.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-8 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 space-y-4">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 px-1 opacity-90 fadeIn">
        Smart Assistant
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((msg, idx) => {
          const isWarning =
            msg.includes("⚠️") || msg.toLowerCase().includes("higher");

          return (
            <div
              key={idx}
              className={`rounded-2xl p-5 shadow-sm border backdrop-blur-md transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md animate-slideUp ${isWarning
                  ? "bg-red-50/80 dark:bg-red-900/30 border-red-100 dark:border-red-800 text-red-800 dark:text-red-200"
                  : "bg-green-50/80 dark:bg-green-900/30 border-green-100 dark:border-green-800 text-green-800 dark:text-green-200"
                }`}
              style={{ animationDelay: `${idx * 0.15}s` }}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl ${isWarning ? "bg-red-100 dark:bg-red-800" : "bg-green-100 dark:bg-green-800"
                    }`}
                >
                  <span className="text-2xl">
                    {isWarning ? "📉" : "🎉"}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold mb-1 dark:text-white">
                    {isWarning ? "Spending Alert" : "Great Job!"}
                  </h4>

                  <p className="text-sm opacity-90 leading-relaxed font-medium dark:text-gray-200">
                    {msg.replace(/[⚠️🎉]/g, "")}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InsightsWidget;