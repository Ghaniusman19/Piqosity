import React from 'react'
import TestBuilder from './pages/TestBuilder'
import NewPage from './pages/NewPage'
import { Route, Routes } from 'react-router-dom'
import DynamicTabs from './pages/DynamicTabs'
import Test from './pages/Test'
function App() {
  return (
    <div>
      <Routes >
        <Route path='/' element={<TestBuilder />} />
        <Route path="newpage" element={<NewPage />} />
        <Route path="dtab" element={<DynamicTabs />} />
        <Route path='test' element={<Test />} />
      </Routes>

    </div>
  )
}

export default App
