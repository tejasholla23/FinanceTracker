import React from "react";

function InsightsWidget({ insights, loading, error }) {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 text-red-600 shadow-sm transition-all duration-300 animate-fadeIn">
        <div className="flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p className="font-semibold">Failed to load insights.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-100 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
      <h3 className="text-xl font-bold text-gray-800 px-1 opacity-90 fadeIn">
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
                  ? "bg-red-50/80 border-red-100 text-red-800"
                  : "bg-green-50/80 border-green-100 text-green-800"
                }`}
              style={{ animationDelay: `${idx * 0.15}s` }}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl ${isWarning ? "bg-red-100" : "bg-green-100"
                    }`}
                >
                  <span className="text-2xl">
                    {isWarning ? "📉" : "🎉"}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold mb-1">
                    {isWarning ? "Spending Alert" : "Great Job!"}
                  </h4>

                  <p className="text-sm opacity-90 leading-relaxed font-medium">
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