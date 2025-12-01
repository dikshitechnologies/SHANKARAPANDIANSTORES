import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import Navbar from './components/Navbar/Navbar'
import UserCreation from './pages/UserCreation/UserCreation'
import LedgerCreation from './pages/Ledgercreation/Ledgercreation'
import LedgerGroupCreation from './pages/LedgerGroupCreation/Ledgergroupcreation'
import ItemCreation from './pages/ItemCreation/ItemCreation'
import ItemGroupCreation from './pages/ItemGroupCreation/ItemGroupCreation'
function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/masters/ledger-creation" element={<LedgerCreation />} />
          <Route path="/masters/ledger-group-creation" element={<LedgerGroupCreation />} />
          <Route path="/masters/item-creation" element={<ItemCreation />} />
          <Route path="/masters/item-group-creation" element={<ItemGroupCreation />} />
          <Route path="/masters/User-creation" element={<UserCreation />} />
        </Routes>
      </main>
    </div>
  )
}

export default App