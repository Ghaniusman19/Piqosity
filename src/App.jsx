import React from 'react'
import { Route, Routes } from 'react-router-dom'
import TestDnd from './pages/TestDnd'
import MockTester from './pages/MockTester'
import DragnDrop2Items from './pages/DragnDrop2Items'
function App() {
  return (
    <div>
      <Routes >
        <Route path='/' element={<TestDnd />} />
        <Route path='mock' element={<MockTester />} />
        <Route path='dragndrop2' element={<DragnDrop2Items />} />
      </Routes>
    </div>
  )
}

export default App
