import './App.css'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home/Home'
import Navbar from './components/Navbar/Navbar'
import Login from './pages/Login/Login'
import { useAuth } from './context/AuthContext'
import TestPage from './pages/TestPage/TestPage'
import TestPage4 from './pages/TestPage/TestPage4'
import TestPage3 from './pages/TestPage/TestPage3'
import  Company  from './pages/company/Company'
import LedgerCreation from './pages/Ledgercreation/Ledgercreation'
import LedgerGroupCreation from './pages/Ledgergroupcreation/Ledgergroupcreation'
import ItemGroupCreation from './pages/ItemGroupCreation/ItemGroupCreation'
import Administration from './pages/Administration/Admistration'
import SalesReturn from './pages/SalesReturn/Salesreturn'
import UserCreation from './pages/UserCreation/UserCreation'
import ScrapRateFix from './pages/ScrapRateFix/scrapratefix'
import TagPrint from './pages/TagPrint/TagPrint'
// import Scrap from './pages/Scrap/scrap'
import ExampleUsage from './pages/test'
import SalesInvoice from './pages/SalesInvoice/SaleInvoice'
import UnitCreation from './pages/UnitCreation/UnitCreation'
import ColorCreation from './pages/ColorCreation/ColorCreation'
import SizeCreation from './pages/SizeCreation/SizeCreation'
import ModelCreation from './pages/ModelCreation/ModelCreation'
import Billcollector  from './pages/billcollector/billcollectior'
import Design from './pages/DesignCreation/DesignCreation'
import Tender from './pages/Tender/Tender'
import ScrapPage from './pages/scrappage/scrappage'
import BrandPage from './pages/Brand/Brand'
import Category from './pages/category/category'
import Product from './pages/Product/Product'
import ItemCreation from './pages/ItemCreation/ItemCreation'
import ScrapProcurement from './pages/ScrapProcurement/Scrapprocurement'
import PurchaseInvoice from './pages/PurchaseInvoice/PurchaseInvoice'
import Statecreation from './pages/statecreation/statecreation'
import Purchasereturn from './pages/Purchasereturn/Purchasereturn'
import SalesmanCreation from './pages/SalesmanCreation/SalesmanCreation'
import CashManagement from './pages/CashManagement/CashManagement'
import AmountIssue from './pages/AmountIssue/AmountIssue'
import Receiptvoucher from './pages/Receiptvoucher/Receiptvoucher'
import PaymentVoucher from './pages/PaymentVoucher/PaymentVoucher'
import RouteCreationPage from './pages/Route/Routecreation';
import SalesRegister from './pages/SalesRegister/SalesRegister';
import TaxCreation from './pages/TaxCreation/TaxCreation';
import TransportCreation from './pages/Transportcreation/TransportCreation';
import DayClose from './pages/Dayclose/DayClose';
import DayBook from './pages/Report/DayBokk/Daybook';
import PrefixHistory from './pages/Report/PrefixHistory/PrefixHistory';
import DailyReport from './pages/Report/DailyReport/DailyReport';
import Ledger from './pages/Report/Ledger/Ledger';
import SalesReturnregister from './pages/Report/SalesReturnregister/SalesReturnregister';
import PurchaseReturnregister from './pages/Report/PurchaseReturnregister/PurchaseReturnregister';
import PurchaseRegister from './pages/Report/PurchaseRegister/PurchaseRegister';
import ScrapPurchase from './pages/Report/ScrapPurchase/ScrapPurchase';
import Groupwisestock from './pages/Report/Groupwisestock/Groupwisestock';
import TenderReport from './pages/Report/TenderReport/TenderReport';

import AccountReceivables from './pages/Report/AccountReceivables/AccountReceivables';
import AccountPayables from './pages/Report/AccountPayables/AccountPayables';
import DaySales from './pages/Report/DaySales/DaySales'
import Itemwisestock from './pages/Report/Itemwisestock/Itemwisestock';
// import TestPage from './pages/TestPage/TestPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { userData } = useAuth();
  
  if (!userData) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Layout with Navbar
const LayoutWithNavbar = ({ children }) => {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

function App() {
  const { userData } = useAuth();
  const location = useLocation();

  return (
    <>
    <Routes>
      {/* Root Route - Redirect based on authentication */}
      <Route 
        path="/" 
        element={
          userData ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
        } 
      />

      {/* Public Route - Login */}
      <Route 
        path="/login" 
        element={
          userData ? <Navigate to="/home" replace /> : <Login />
        } 
      />

      {/* Protected Routes with Navbar */}
      <Route path="/home" element={<ProtectedRoute><LayoutWithNavbar><Home /></LayoutWithNavbar></ProtectedRoute>} />
      <Route path="/test" element={<ProtectedRoute><LayoutWithNavbar><TestPage /></LayoutWithNavbar></ProtectedRoute>} />
      <Route path="/test3" element={<ProtectedRoute><LayoutWithNavbar><TestPage3 /></LayoutWithNavbar></ProtectedRoute>} />
      <Route path="/test4" element={<ProtectedRoute><LayoutWithNavbar><TestPage4 /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/masters/company-creation" element={<ProtectedRoute><LayoutWithNavbar><Company /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/sales-invoice" element={<ProtectedRoute><LayoutWithNavbar><SalesInvoice /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/masters/ledger-creation" element={<ProtectedRoute><LayoutWithNavbar><LedgerCreation /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/masters/ledger-group-creation" element={<ProtectedRoute><LayoutWithNavbar><LedgerGroupCreation /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/masters/User-creation" element={<ProtectedRoute><LayoutWithNavbar><UserCreation /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/masters/item-group-creation" element={<ProtectedRoute><LayoutWithNavbar><ItemGroupCreation /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/Administration" element={<ProtectedRoute><LayoutWithNavbar><Administration /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/transactions/sales-return" element={<ProtectedRoute><LayoutWithNavbar><SalesReturn /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/mastersScrapRateFix" element={<ProtectedRoute><LayoutWithNavbar><ScrapRateFix /></LayoutWithNavbar></ProtectedRoute>} />
          {/* <Route path="/transactions/scrap" element={<ProtectedRoute><LayoutWithNavbar><Scrap /></LayoutWithNavbar></ProtectedRoute>} /> */}
          <Route path="/popup-list-selector-example" element={<ProtectedRoute><LayoutWithNavbar><ExampleUsage /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/masters/unit-creation" element={<ProtectedRoute><LayoutWithNavbar><UnitCreation /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/masters/color-creation" element={<ProtectedRoute><LayoutWithNavbar><ColorCreation /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/masters/size-creation" element={<ProtectedRoute><LayoutWithNavbar><SizeCreation /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/masters/model-creation" element={<ProtectedRoute><LayoutWithNavbar><ModelCreation /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/transactions/bill-collector" element={<ProtectedRoute><LayoutWithNavbar><Billcollector /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/Transaction/Tender" element={<ProtectedRoute><LayoutWithNavbar><Tender /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/transactions/purchase-invoice" element={<ProtectedRoute><LayoutWithNavbar><PurchaseInvoice key="purchase-invoice" /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/design-creation" element={<ProtectedRoute><LayoutWithNavbar><Design /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/masters/scrap-page" element={<ProtectedRoute><LayoutWithNavbar><ScrapPage /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/masters/brand-creation" element={<ProtectedRoute><LayoutWithNavbar><BrandPage /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/masters/category-creation" element={<ProtectedRoute><LayoutWithNavbar><Category /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/masters/product-creation" element={<ProtectedRoute><LayoutWithNavbar><Product /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/ScrapProcurement" element={<ProtectedRoute><LayoutWithNavbar><ScrapProcurement /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/masters/Statecreation" element={<ProtectedRoute><LayoutWithNavbar><Statecreation /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/transactions/Purchasereturn" element={<ProtectedRoute><LayoutWithNavbar><Purchasereturn key="purchase-return" /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/masters/ItemCreation" element={<ProtectedRoute><LayoutWithNavbar><ItemCreation /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/masters/SalesmanCreation" element={<ProtectedRoute><LayoutWithNavbar><SalesmanCreation /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/transactions/amount-issue" element={<ProtectedRoute><LayoutWithNavbar><AmountIssue /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/payment-voucher" element={<ProtectedRoute><LayoutWithNavbar><PaymentVoucher /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/transactions/receipt-voucher" element={<ProtectedRoute><LayoutWithNavbar><Receiptvoucher /></LayoutWithNavbar></ProtectedRoute>} />
            <Route path="/transactions/Tag-Print" element={<ProtectedRoute><LayoutWithNavbar><TagPrint /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/masters/route-creation" element={<ProtectedRoute><LayoutWithNavbar><RouteCreationPage /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/reports/sales-register" element={<ProtectedRoute><LayoutWithNavbar><SalesRegister /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/masters/Tax-Creation" element={<ProtectedRoute><LayoutWithNavbar><TaxCreation /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/masters/Tax-Creation" element={<ProtectedRoute><LayoutWithNavbar><TaxCreation /></LayoutWithNavbar></ProtectedRoute>} />
           <Route path="/masters/Transport-Creation" element={<ProtectedRoute><LayoutWithNavbar><TransportCreation /></LayoutWithNavbar></ProtectedRoute>} />
            <Route path="/masters/DayClose" element={<ProtectedRoute><LayoutWithNavbar><DayClose /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/reports/day-book" element={<ProtectedRoute><LayoutWithNavbar><DayBook /></LayoutWithNavbar></ProtectedRoute>} />
            <Route path="/reports/PrefixHistory" element={<ProtectedRoute><LayoutWithNavbar><PrefixHistory /></LayoutWithNavbar></ProtectedRoute>} />
             <Route path="/reports/DailyReport" element={<ProtectedRoute><LayoutWithNavbar><DailyReport /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/reports/ledger" element={<ProtectedRoute><LayoutWithNavbar><Ledger /></LayoutWithNavbar></ProtectedRoute>} />
          {/* <Route path="/reports/ledger" element={<ProtectedRoute><LayoutWithNavbar><Ledger /></LayoutWithNavbar></ProtectedRoute>} /> */}
          <Route path="/reports/SalesReturnregister" element={<ProtectedRoute><LayoutWithNavbar><SalesReturnregister /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/reports/PurchaseReturnregister" element={<ProtectedRoute><LayoutWithNavbar><PurchaseReturnregister /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/reports/Purchase-register" element={<ProtectedRoute><LayoutWithNavbar><PurchaseRegister /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/reports/Scrap-purchase" element={<ProtectedRoute><LayoutWithNavbar><ScrapPurchase /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/reports/Groupwisestock" element={<ProtectedRoute><LayoutWithNavbar><Groupwisestock /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/reports/account-receivable" element={<ProtectedRoute><LayoutWithNavbar><AccountReceivables /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/reports/account-payable" element={<ProtectedRoute><LayoutWithNavbar><AccountPayables /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/reports/day-sales" element={<ProtectedRoute><LayoutWithNavbar><DaySales /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/reports/Billcollectorreport" element={<ProtectedRoute><LayoutWithNavbar><TenderReport /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/reports/Itemwisestock" element={<ProtectedRoute><LayoutWithNavbar><Itemwisestock /></LayoutWithNavbar></ProtectedRoute>} />
          <Route path="/embed/design" element={<Design />} />
          <Route path="/embed/scrap" element={<ScrapPage />} />
          <Route path="/embed/brand" element={<BrandPage />} />
          <Route path="/embed/category" element={<Category />} />
          <Route path="/embed/product" element={<Product />} />
          <Route path="/embed/masters/model-creation" element={<ModelCreation />} />
          <Route path="/embed/masters/size-creation" element={<SizeCreation />} />
          <Route path="/embed/masters/unit-creation" element={<UnitCreation />} />



          


    </Routes>
     <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </>
  );
}

export default App