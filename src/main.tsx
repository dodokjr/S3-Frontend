import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout'
import App from'./App'
import './index.css'
import './App.css'
import AdminLogin from './components/dashbord/AdminLogin'
import NotFound from './components/utilities/NotFound'
import Dashboard from './components/dashbord/Dashboard'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <App />,
      },
    ],
  },
  {
    path: '/s3/signup',
    element: <AdminLogin />,
  },
  {
    path: '/s3/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/*',
    element: <NotFound />,
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)