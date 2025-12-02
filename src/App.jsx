import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import Navbar from './components/Navbar/Navbar'
import { Test } from './pages/test'
import  Company  from './pages/company/Company'
function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="test" element={<Test />} />
          <Route path="Company" element={<Company />} />
          
          

        </Routes>
      </main>
    </div>
  )
}

export default App