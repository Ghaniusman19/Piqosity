import React from 'react'
import { Route, Routes } from 'react-router-dom'
import TestBuilder from './pages/TestBuilder'
import NewPage from './pages/NewPage'
import DynamicTabs from './pages/DynamicTabs'
import Test from './pages/Test'
import DND from './pages/DND'
import TestDnd from './pages/TestDnd'
import One from './pages/one'
import MockTester from './pages/MockTester'
import DragnDrop3Items from './pages/DragnDrop3Items'
import DragnDrop2Items from './pages/DragnDrop2Items'
function App() {
  return (
    <div>
      <Routes >
        <Route path='/' element={<TestBuilder />} />
        <Route path="newpage" element={<NewPage />} />
        <Route path="dtab" element={<DynamicTabs />} />
        <Route path='test' element={<Test />} />
        <Route path='dnd' element={< DND />} />
        <Route path='testdnd' element={<TestDnd />} />
        <Route path='one' element={<One />} />
        <Route path='mock' element={<MockTester />} />
        <Route path='dragndrop3' element={<DragnDrop3Items />} />
        <Route path='dragndrop2' element={<DragnDrop2Items />} />
      </Routes>
    </div>
  )
}

export default App
