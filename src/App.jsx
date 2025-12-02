import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import Navbar from './components/Navbar/Navbar'
import  Company  from './pages/company/Company'
import LedgerCreation from './pages/Ledgercreation/Ledgercreation'
import ItemCreation from './pages/ItemCreation/ItemCreation'
import LedgerGroupCreation from './pages/Ledgergroupcreation/Ledgergroupcreation'
import ItemGroupCreation from './pages/ItemGroupCreation/ItemGroupCreation'
import Scrap from './pages/Scrap/Scrap'
import ExampleUsage from './pages/test'
import SalesInvoice from './pages/SalesInvoice/SaleInvoice'
import UnitCreation from './pages/UnitCreation/UnitCreation'
import Tender from './pages/Tender/Tender'
import PurchaseInvoice from './pages/PurchaseInvoice/PurchaseInvoice'

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="test" element={<Test />} /> */}
          <Route path="/masters/company-creation" element={<Company />} />
          
          

          <Route path="sales-invoice" element={<SalesInvoice />} />
          <Route path="/masters/ledger-creation" element={<LedgerCreation />} />
          <Route path="/masters/item-creation" element={<ItemCreation />} />
          <Route path="/masters/ledger-group-creation" element={<LedgerGroupCreation />} />
          <Route path="/masters/item-group-creation" element={<ItemGroupCreation />} />
          <Route path="/transactions/scrap" element={<Scrap />} />
          <Route path="/popup-list-selector-example" element={<ExampleUsage />} />
          <Route path="/masters/unit-creation" element={<UnitCreation />} />
          <Route path="/Transaction/Tender" element={<Tender />} />
          <Route path="/transactions/purchase-invoice" element={<PurchaseInvoice />} />
        </Routes>
      </main>
    </div>
  )
}

export default App