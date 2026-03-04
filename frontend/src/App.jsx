import React from 'react'
import { Route, Routes } from "react-router-dom"
import Home from './pages/Home'
import Auth from './pages/Auth'
import Upload from './pages/Upload'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
