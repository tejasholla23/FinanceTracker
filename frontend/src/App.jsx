import { BrowserRouter, Routes, Route } from "react-router-dom"

import Dashboard from "./pages/Dashboard"
import AddTransaction from "./pages/AddTransaction"
import Transactions from "./pages/Transactions"
import Budget from "./pages/Budget"
import Login from "./pages/Login"
import Register from "./pages/Register"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/add" element={<AddTransaction />} />

        <Route path="/transactions" element={<Transactions />} />

        <Route path="/budget" element={<Budget />} />

        <Route path="/register" element={<Register />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App