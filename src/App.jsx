import React from 'react'
import { Route, Routes } from 'react-router-dom'
import TestBuilder from './pages/TestBuilder'
import Test from './pages/Test'
import TestDnd from './pages/TestDnd'
import MockTester from './pages/MockTester'
import DragnDrop3Items from './pages/DragnDrop3Items'
import DragnDrop2Items from './pages/DragnDrop2Items'
function App() {
  return (
    <div>
      <Routes >
        <Route path='/testbuilder' element={<TestBuilder />} />
        <Route path='test' element={<Test />} />
        <Route path='/' element={<TestDnd />} />
        <Route path='mock' element={<MockTester />} />
        <Route path='dragndrop3' element={<DragnDrop3Items />} />
        <Route path='dragndrop2' element={<DragnDrop2Items />} />
      </Routes>
    </div>
  )
}

export default App
