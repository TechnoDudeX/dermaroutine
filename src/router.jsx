import { createBrowserRouter } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Generating from './pages/Generating'
import Review from './pages/Review'
import Tracker from './pages/Tracker'
import Settings from './pages/Settings'

export const router = createBrowserRouter([
  { path: '/',           element: <Landing /> },
  { path: '/login',      element: <Login /> },
  { path: '/onboarding', element: <Onboarding /> },
  { path: '/generating', element: <Generating /> },
  { path: '/review',     element: <Review /> },
  { path: '/tracker',    element: <Tracker /> },
  { path: '/settings',   element: <Settings /> },
])
