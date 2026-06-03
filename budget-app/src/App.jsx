import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BudgetProvider } from '@/context/BudgetContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import Dashboard from '@/pages/Dashboard'
import Transactions from '@/pages/Transactions'
import Budgets from '@/pages/Budgets'
import Charts from '@/pages/Charts'
import Goals from '@/pages/Goals'

function Layout({ children }) {
  return (
    <div className="flex min-h-screen" style={{ background: '#050912' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-5 pb-24 md:p-7 md:pb-7 lg:p-8 lg:pb-8 max-w-screen-xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BudgetProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/graphiques" element={<Charts />} />
            <Route path="/objectifs" element={<Goals />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </BudgetProvider>
  )
}
