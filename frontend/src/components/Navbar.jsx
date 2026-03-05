import { useState } from "react"
import { Link, useLocation } from "react-router-dom"

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/transactions", label: "Transactions" },
    { path: "/budget", label: "Budget" },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="w-full bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg sticky top-0 z-40 animate-slideDown">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo / Brand */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="text-2xl font-bold text-white bg-white bg-opacity-20 px-3 py-1 rounded-lg animate-bounce-slow">FT</div>
            <h1 className="text-white text-2xl font-bold group-hover:text-blue-100 transition-colors duration-300">
              FinanceTracker
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                  isActive(item.path)
                    ? "bg-white text-blue-600 shadow-md"
                    : "text-white hover:bg-blue-500 hover:shadow-md"
                }`}
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* User Profile */}
            <div className="hidden md:flex items-center gap-3 bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-400 transition-colors duration-300">
              <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-sm">
                U
              </div>
              <span className="text-white font-medium">User</span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white text-2xl hover:scale-110 transition-transform duration-300 font-bold"
            >
              ≡
            </button>

            {/* Logout Button */}
            <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg">
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-slideDown">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                    isActive(item.path)
                      ? "bg-white text-blue-600"
                      : "text-white hover:bg-blue-500"
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar