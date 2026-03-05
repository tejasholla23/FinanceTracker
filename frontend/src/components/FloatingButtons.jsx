import { useState } from "react"
import { useNavigate } from "react-router-dom"

function FloatingButtons() {
  const navigate = useNavigate()

  return (
    <div className="fixed bottom-8 right-8 z-30">
      {/* Main Floating Button redirects to add page */}
      <button
        onClick={() => navigate("/add")}
        className="bg-gradient-to-r from-blue-600 to-blue-800 text-white w-16 h-16 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center text-3xl animate-pulse-subtle font-bold"
      >
        +
      </button>
    </div>
  )
}

export default FloatingButtons
