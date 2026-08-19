import { Routes, Route } from 'react-router-dom'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import PacePage from './pages/PacePage'
import SignUpPage from './pages/SignUpPage'
import BeginPage from './pages/BeginPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<OnboardingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/pace" element={<PacePage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/begin" element={<BeginPage />} />
    </Routes>
  )
}
