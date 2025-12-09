import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import Navbar from './components/Navbar/Navbar'
import TestPage from './pages/TestPage/TestPage'
import  Company  from './pages/company/Company'
import LedgerCreation from './pages/Ledgercreation/Ledgercreation'
import ItemCreation from './pages/ItemCreation/ItemCreation'
import LedgerGroupCreation from './pages/Ledgergroupcreation/Ledgergroupcreation'
import ItemGroupCreation from './pages/ItemGroupCreation/ItemGroupCreation'
import Administration from './pages/Administration/Admistration'
import SalesReturn from './pages/SalesReturn/Salesreturn'
import UserCreation from './pages/UserCreation/UserCreation'
import ScrapRateFix from './pages/RateFix/scrapratefix'  
import Scrap from './pages/Scrap/scrap'
import ExampleUsage from './pages/test'
import SalesInvoice from './pages/SalesInvoice/SaleInvoice'
import UnitCreation from './pages/UnitCreation/UnitCreation'
import Billcollector  from './pages/billcollector/billcollectior'
import Design from './pages/DesignCreation/DesignCreation'
import Tender from './pages/Tender/Tender'
import PurchaseInvoice from './pages/PurchaseInvoice/PurchaseInvoice'
import ScrapPage from './pages/scrappage/scrappage'
import BrandPage from './pages/Brand/Brand'
import Category from './pages/category/category'
import Product from './pages/Product/Product'

import ScrapProcurement from './pages/ScrapProcurement/Scrapprocurement'
import Salecreation from './pages/statecreation/statecreation'
function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="test" element={<TestPage />} />
          {/* <Route path="test" element={<Test />} /> */}
          <Route path="/masters/company-creation" element={<Company />} />
          
          

          <Route path="sales-invoice" element={<SalesInvoice />} />
          <Route path="/masters/ledger-creation" element={<LedgerCreation />} />
          <Route path="/masters/item-creation" element={<ItemCreation />} />
          <Route path="/masters/ledger-group-creation" element={<LedgerGroupCreation />} />
          <Route path="/masters/User-creation" element={<UserCreation />} />
          <Route path="/masters/item-group-creation" element={<ItemGroupCreation />} />
          <Route path="/Administration" element={<Administration />} />
          <Route path="/transactions/sales-return" element={<SalesReturn />} />
          <Route path="/mastersScrapRateFix" element={<ScrapRateFix />} /> 
          <Route path="/transactions/scrap" element={<Scrap />} />
          <Route path="/popup-list-selector-example" element={<ExampleUsage />} />
          <Route path="/masters/unit-creation" element={<UnitCreation />} />
          <Route path="/transactions/bill-collector" element={<Billcollector />} />
          <Route path="/Transaction/Tender" element={<Tender />} />
          <Route path="/transactions/purchase-invoice" element={<PurchaseInvoice />} />
          <Route path="/design-creation" element={<Design />} />
          <Route path="/masters/scrap-page" element={<ScrapPage />} />
          <Route path="/masters/brand-creation" element={<BrandPage />} />
          <Route path="/masters/category-creation" element={<Category />} />
          <Route path="/masters/product-creation" element={<Product />} />
           <Route path="/ScrapProcurement" element={<ScrapProcurement />} />
           <Route path="/masters/Salecreation" element={<Salecreation />} /> 
        </Routes>
      </main>
    </div>
  )
}

export default App