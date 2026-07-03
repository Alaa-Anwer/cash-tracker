import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Layout } from "@/components/Layout"
import { Home } from "@/pages/Home"
import { IncomePage } from "@/pages/Income"
import { Expenses } from "@/pages/Expenses"
import { History } from "@/pages/History"
import { Settings } from "@/pages/Settings"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="income" element={<IncomePage />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
