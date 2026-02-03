import AccountReceivables from "../pages/Report/AccountReceivables/AccountReceivables";

export const API_ENDPOINTS = {
  // Login Endpoint
  LOGIN: {
    getUserInfo: (username, password) => 
      `Login/GetCompanyUserInfo?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
  },

  ROUTE_CREATION: {
    GET_NEXT_ROUTE_CODE: 'RouteCreation/getNextRouteFcode',
    GET_ROUTES_PAGED: (pageNumber = 1, pageSize = 10, search = '') =>
      `RouteCreation/GetRoutesPaged?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`,
    CREATE_ROUTE: 'RouteCreation/RoteCreation',
    UPDATE_ROUTE: 'RouteCreation/RouteUpdate',
    DELETE_ROUTE: (code) => `RouteCreation/DeleteRoute/${code}`,
  },

  LEDGER_CREATION_ENDPOINTS: {
    getTree: "LedgerGroupCreation/LedgerGroupCreationGet",
    getDropdownPaged: (page = 1, pageSize = 20, searchText = '') =>
      `LedgerCreation/GetledgerCreationdropdowslist/${page}/${pageSize}?searchText=${encodeURIComponent(searchText)}`,
    postCreate: "LedgerCreation/LedgerCreationPost",
    putEdit: "LedgerCreation/ledgerCreationPut",
    delete: (fCode) => `LedgerCreation/LedgerCreationDelete/${fCode}`,
  },

 ITEM_CREATION_ENDPOINTS: {
  getTree: "ItemGroupCreation/ItemGroupCreationGet",
  getDropdown: "ItemCreation/GetItemCreationdropdowslist",
  getMaxPrefix: "ItemCreation/GetMaxPrefix",
  postCreate: "ItemCreation/ItemCreationPost",
  putEdit: "ItemCreation/ItemCreationUpdate",
  delete: (fCode) => `ItemCreation/ItemCreationDelete/${fCode}`,

  // ✅ NEW: Tax List (Paged) - Returns GST tax numbers (0%, 3%, 5%, 12%, 18%, 28%, 40%)
  getTaxListGST: (page = 1, pageSize = 10) =>
    `TaxCreation/gettaxlist?page=${page}&pageSize=${pageSize}`,
},


  GET_COUNTER_LIST: "CounterCreation/getCounterList",

  LEDGER_GROUP_CREATION_ENDPOINTS: {
    getTree: "LedgerGroupCreation/LedgerGroupCreationGet",
    getDropdown: "LedgerGroupCreation/ledgergroupCreationDropdownlist",
    postCreate: "LedgerGroupCreation/LedgerGroupCreationPost",
    putEdit: "LedgerGroupCreation/ledgerGroupCreationPut",
    delete: (fCode) => `LedgerGroupCreation/ledgerGroupCreationDelete/${fCode}`,
  },

  ITEM_GROUP: {
    getTree: "ItemGroupCreation/ItemGroupCreationGet",
    getDropdown: "ItemGroupCreation/ItemgroupCreationDropdownlist",
    postCreate: "ItemGroupCreation/ItemGroupCreationPost",
    putEdit: "ItemGroupCreation/ItemGroupCreationPut",
    delete: (fCode) => `ItemGroupCreation/ItemGroupCreationDelete/${fCode}`,
  },
  user_creation: {
    getuserdetails: "UserCreation/getUserItem",
    getDropdown: "UserCreation/GetUserCreationdropdowslist",
    postCreate: "UserCreation/CreateUser",
    putEdit: "UserCreation/UpdateUser",
    delete: (fCode) => `UserCreation/deleteUser/${fCode}`,
  },

  COMPANY_ENDPOINTS: {
    NEXT_COMPANY_CODE: "CompanyCreation/NextCompanyCode",
    CREATE_COMPANY: "CompanyCreation/CreateCompany?selecttype=true",
    UPDATE_COMPANY: "CompanyCreation/CreateCompany?selecttype=false",
    GET_COMPANY_LIST: "CompanyCreation/GetCompanyList",
    GET_COMPANY_DETAILS: (compCode) => `CompanyCreation/GetCompany/${compCode}`,
    DELETE_COMPANY: (fcompcode) => `CompanyCreation/DeleteCompany/${fcompcode}`,
  },
  UNITCREATION: {
    NEXT_SIZE_CODE: "UnitCreation/NextBillNo",
    GET_SIZE_ITEMS: "UnitCreation/GetUnits",
    GETUNITCODE: (code) => `UnitCreation/GetUnit/${code}`,
    CREATE_SIZE: "UnitCreation/CreateUnit",
    UPDATE_SIZE: (code) => `UnitCreation/UpdateUnit/${code}`,
    DELETE_SIZE: (code) => `UnitCreation/DeleteUnit/${code}`,
  },

  COLORCREATION: {
    NEXT_COLOR_CODE: "Colour_Creation/getNextColurFcode",
    GET_COLOR_ITEMS: "Colour_Creation/getColourItem",
    // GETCOLORCODE : (code) => `ColorCreation/GetColor/${code}`, 
    CREATE_COLOR: "Colour_Creation/createColour",
    UPDATE_COLOR: "Colour_Creation/updateColour",
    DELETE_COLOR: (code) => `Colour_Creation/deleteColour/${code}`,
  },
  SIZECREATION: {
    NEXT_SIZE_CODE: "SizeCreation/SizeNextFcode",
    GET_SIZE_ITEMS: "SizeCreation/getSizeItem",
    // GETUNITCODE : (code) => `SizeCreation/GetSize/${code}`, 
    CREATE_SIZE: "SizeCreation/createSize",
    UPDATE_SIZE: "SizeCreation/UpdateSize",
    DELETE_SIZE: (code) => `SizeCreation/DeleteSize/${code}`,
  },
  MODELCREATION: {
    NEXT_MODEL_CODE: "ModelCreation/getNextModelFcode",
    GET_MODEL_ITEMS: "ModelCreation/getModelItem",
    // GETUNITCODE : (code) => `SizeCreation/GetSize/${code}`, 
    CREATE_MODEL: "ModelCreation/createModel",
    UPDATE_MODEL: "ModelCreation/updateModel",
    DELETE_MODEL: (code) => `ModelCreation/deleteColour/${code}`,
  },

  ADMINISTRATION: {
    USER_LIST: "Administartor/UserNameList",
    ADMIN_BATCH_INSERT: "Administartor/adminstration/InsertBatch",
    GET_PERMISSIONS_BY_USER: (fUcode) => `Administartor/GetPermissionsByUserCode?fUcode=${fUcode}`,
    DELETE_PERMISSIONS: "Administartor/administration/delete"
  },
 TRANSPORTCREATION: {
    NEXT_TRANSPORT_CODE: '/transport/transmaxcode',
    GET_TRANSPORT_ITEMS: '/transport/transport?page=1&pageSize=100', // Adjust pageSize as needed
    GET_TRANSPORT_CODE: (code) => `/transport/transport/${code}`,
    CREATE_TRANSPORT: '/transport/transport',
    UPDATE_TRANSPORT: (code) => `/transport/transport/${code}`,
    DELETE_TRANSPORT: (code) => `/transport/transport/${code}`
  },

  STATECREATION: {
    GET_STATE_ITEMS: (page = 1, pageSize = 10) =>
      `/StateCreation/getStates?page=${page}&pageSize=${pageSize}`,
    NEXT_STATE_CODE: '/StateCreation/getStateFcode',
    GETSTATECODE: (code) => `/StateCreation/getStateFcode?code=${code}`,
    CREATE_STATE: '/StateCreation/createStates',
    UPDATE_STATE: (code) => `/StateCreation/updateModel`,
    DELETE_STATE: (code) => `/StateCreation/deleteState/${code}`,
  },

// In your api/endpoints.js

  // sales_return: {
  //   getMaxVoucherNo: (companyCode) => `/SalesReturn/getMaxVoucherNo/${companyCode}`,
  //   getCustomers: 'SalesReturn/GetPartyByParent',
  //   getBillList: (companyCode, page, pageSize) => `SalesReturn/GetSalesInvoiceBillList/${companyCode}?page=${page}&pageSize=${pageSize}`,
  //   getVoucherDetails: (voucherNo) => `SalesReturn/GetSalesInvoiceVoucherDetails?voucherNo=${voucherNo}`,
  //   getVoucherList: (companyCode) => `SalesReturn/VoucherList/${companyCode}`,
  //   createSalesReturn: 'SalesReturn/SalesReturnCreate?SelectType=true',
  //   // Note: No separate update endpoint - use create endpoint with SelectType=false
  //   deleteSalesReturn: (voucherNo, companyCode) => `SalesReturn/DeleteSalesReturn/${voucherNo}?compCode=${companyCode}`,
  //   getSalesReturnDetails: (voucherNo, companyCode) => `SalesReturn/GetSalesReturn/${voucherNo}/${companyCode}`,
  // },
 

  sales_return:{
     getMaxVoucherNo: (companyCode) => `SalesReturn/GetMaxVoucherNo/${companyCode}`,
      getVoucherList: (companyCode) => `SalesReturn/VoucherList/${companyCode}`,
       getCustomers: "Salesinvoices/GetPartyByParent",
       createSalesReturn: 'SalesReturn/SalesReturnCreate?SelectType=true',
    updateSalesReturn: 'SalesReturn/SalesReturnCreate?SelectType=false', // Same endpoint for both
    deleteSalesReturn: (voucherNo) => `SalesReturn/DeleteSalesReturn/${voucherNo}`,
    getSalesReturnDetails: (voucherNo) => `SalesReturn/GetSalesReturnDetails/${voucherNo}`,
      
      getSalesInvoiceBillList: (page = 1, pageSize = 20, compCode) =>
      `SalesReturn/Salesinvoicebilllist?page=${page}&pageSize=${pageSize}${compCode ? `&compCode=${compCode}` : ''}`,

        // NEW: ADD THIS VOUCHER DETAILS ENDPOINT
    getVoucherDetails: (voucherNo) => `SalesReturn/GetVoucherDetails?voucherNo=${voucherNo}`,
 getCustomerBalance: (customerCode, companyCode) =>
    `CUSTOMERREPORT/customerbalance/${customerCode}/${companyCode}`,

  getCustomer: (pageNumber = 1, pageSize = 10) =>
    `Salesinvoices/GetPartyByParent?pageNumber=${pageNumber}&pageSize=${pageSize}`,



  getLedger: (accountCode, compCode, fromDate, toDate) =>
    `ledger/GetLedger?accountCode=${accountCode}&compCode=${compCode}&fromDate=${encodeURIComponent(
      fromDate
    )}&toDate=${encodeURIComponent(toDate)}`,




  },
  //ScrapRateFixing/getFullScrapRateFixing
  SCRAP_RATE_FIXING: {
    GET_FULL_SCRAP_RATES:(pageNumber = 1, pageSize, search) => `ScrapRateFixing/getFullScrapRateFixing?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`,
    UPDATE_FULL_SCRAP_RATES: 'ScrapRateFixing/updateFullScrapRateFixing',
  },

  PURCHASE_INVOICE: {
    GET_PURCHASE_INVOICES: (compCode) => `PurchaseInvoice/FlushNumber/${compCode}`,
    CREATE_PURCHASE_INVOICE: (purchaseType) => `PurchaseInvoice/CreatePurchase/${purchaseType}`,
    GET_BILL_LIST: (compCode) => `PurchaseInvoice/PurBillList/${compCode}`,
    SUPPLIER_LIST: (search = '', page = 1, pageSize = 20) =>
      `PurchaseInvoice/SupplierList?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`,
    DELETE_PURCHASE_INVOICE: "PurchaseInvoice/RemovePurchaseBill",
    GET_PURCHASE_DETAILS: "PurchaseInvoice/GetPurchaseDetails",
    GET_ITEM_CODE_LIST: "Salesinvoices/GetItemsByType?type=FG",
    GET_ITEM_DETAILS_BY_CODE: (itemCode) => `Salesinvoices/GetStockByItemName1?itemcode=${itemCode}`,
    AUTO_GENERATE_BARCODE: "barcodeGenerate/AutoGenerateBarcode",
    GET_GROUP_LIST: (search = '', page = 1, pageSize = 20) => `GroupSelection/item-GroupList?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`,
    GET_GROUPITEMS_BY_GROUP: (groupCode) => `GroupSelection/items/get-Group-Items?fparent=${groupCode}`,
    GET_TRANSPORT_LIST: (page = 1, pageSize = 20,search='') => `transport/transport?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)  }`,
  },


  PURCHASE_RETURN: {
    GET_PURCHASE_RETURNS: (compCode) => `PurchaseReturn/GetPurchaseReturnVoucher/${compCode}`,
    GET_BILL_NUMBERS: (compCode, page = 1, pageSize = 20) => `PurchaseReturn/BillNumbers/${compCode}/${page}/${pageSize}`,
    GET_PURCHASE_RETURN_DETAILS: (voucherNo) => `PurchaseReturn/GetPurchaseReturnDetails/${voucherNo}`,
    GET_PURCHASE_BILL_LIST: (compCode, pageNo = 1, pageSize = 20) => `PurchaseReturn/GetPurchaseBillList?compCode=${compCode}&pageNo=${pageNo}&pageSize=${pageSize}`,
    GET_PURCHASE_ITEMS_BY_VOUCHER: (voucher) => `PurchaseReturn/GetPurchaseVoucherDetails?voucherNo=${voucher}`,
    GET_PURCHASE_VOUCHER_DETAILS: (voucherNo) => `PurchaseReturn/GetPurchaseVoucherDetails?voucherNo=${voucherNo}`,
    GET_PARTY_LIST: (search = '', pageNo = 1, pageSize = 20) => `PurchaseReturn/GetPartyList?search=${encodeURIComponent(search)}&pageNo=${pageNo}&pageSize=${pageSize}`,
    CREATE_PURCHASE_RETURN: (selectType) => `PurchaseReturn/PurchaseReturn?selecttype=${selectType}`,
    UPDATE_PURCHASE_RETURN: (selectType) => `PurchaseReturn/PurchaseReturn?selecttype=${selectType}`,
    DELETE_PURCHASE_RETURN: (voucherNo, compCode) => `PurchaseReturn/PurchaseReturnDelete?voucherNo=${voucherNo}&compCode=${compCode}`,
  },


  DESIGNCREATION: {
    NEXT_DESIGN_CODE: 'DesignCreation/getNextFcode',
    GET_DESIGNS: 'DesignCreation/getDesignItem',
    GETDESIGNCODE: (code) => `DesignCreation/getDesignItem/${code}`,
    CREATE_DESIGN: 'DesignCreation/createDesign',
    UPDATE_DESIGN: 'DesignCreation/updateDesign',
    DELETE_DESIGN: (code) => `DesignCreation/deleteDesign/${code}`
  },

  SCRAPCREATION: {
    GET_SCRAP_ITEMS: 'ScrapCreation/getScrapItem',
    GET_NEXT_SCRAP_CODE: 'ScrapCreation/getNextScrapFcode',
    CREATE_SCRAP: 'ScrapCreation/createScrap',
    UPDATE_SCRAP: 'ScrapCreation/updateScrap',
    DELETE_SCRAP: (code) => `ScrapCreation/deleteScrap/${code}`,
  },

  BRAND: {
    GET_BRANDS: 'Brand',
    CREATE_BRAND: 'Brand?selecttype=true',
    GET_NEXT_BRAND_CODE: 'Brand/getNextBrandFcode',
    UPDATE_BRAND: 'Brand?selecttype=false',
    DELETE_BRAND: (code) => `Brand/${code}`,
  },

  PRODUCT: {
  GET_PRODUCTS: 'Product',
  CREATE_PRODUCT: 'Product?selecttype=true',
  UPDATE_PRODUCT: 'Product?selecttype=false',
  DELETE_PRODUCT: (code) => `Product/${code}`,
  GET_NEXT_CODE: 'Product/getNextProductFcode'
},

CATEGORY: {
  GET_CATEGORIES: 'CATEGORY/GetAllCategory',
  CREATE_CATEGORY: 'CATEGORY/InsertCategory?selecttype=true',
  UPDATE_CATEGORY: 'CATEGORY/InsertCategory?selecttype=false',
  DELETE_CATEGORY: (code) => `CATEGORY/DeleteCategory/${code}`,
  GET_NEXT_CODE: 'CATEGORY/getNextModelFcode'
},

 SALESMAN_CREATION_ENDPOINTS: {
    getSalesmen: "SalesmanCreation/GetSalesman",
    getNextCode: "SalesmanCreation/SalesmanNextFcode",
    createSalesman: "SalesmanCreation/createSalesman",
    updateSalesman: "SalesmanCreation/updateSalesman",
    deleteSalesman: (fcode) => `SalesmanCreation/deleteSalesMan/${fcode}`,
    getSalesmenPaged: (page = 1, pageSize = 20, searchText = '') => `SalesmanCreation/GetSalesmanPaged/${page}/${pageSize}?searchText=${encodeURIComponent(searchText)}`
  },

  SALES_INVOICE_ENDPOINTS: {
  getNextBillNo: (compCode) =>
    `Salesinvoices/salesnextbillNo/${compCode}`,
  CREATE_SALES: "Salesinvoices/CreateSales/true",   // Insert
  UPDATE_SALES: "Salesinvoices/CreateSales/false",  // Update
  getBillList: (compCode, page = 1, pageSize = 20) =>`Salesinvoices/salesbillList/${compCode}?page=${page}&pageSize=${pageSize}`,
  deleteBillNumber: (voucher, compCode) =>`Salesinvoices/salesbillnumber?voucher=${voucher}&compCode=${compCode}`,
  getStockByItemName: (billType, itemcode) =>`Salesinvoices/GetStockByItemName?billType=${billType}&itemcode=${itemcode}`,
  getVoucherDetails: (voucherNo) =>`Salesinvoices/GetVoucherDetails?voucherNo=${voucherNo}`,
  getItemTypes: () =>`Salesinvoices/GetItemTypes`,
  getItemsByType: (type, page = 1, pageSize = 100) =>
    `Salesinvoices/GetItemsByType?type=${type}&page=${page}&pageSize=${pageSize}`,
  getStockByItemName1: (itemcode) =>`Salesinvoices/GetStockByItemName1?itemcode=${itemcode}`,
  getSalesman: () =>`SalesmanCreation/GetSalesman`,
   getCustomers: (pageNumber = 1, pageSize = 10) =>
    `Salesinvoices/GetPartyByParent?pageNumber=${pageNumber}&pageSize=${pageSize}`,
  getPurchaseStockDetailsByBarcode: (barcode) =>
    `Salesinvoices/GetpurchaseStockDetails?barcode=${barcode}`,

  getTaxList: (page = 1, pageSize = 10) =>
  `TaxCreation/gettaxlist?page=${page}&pageSize=${pageSize}`,

   getLastBillNoByCustomer: (customerCode) =>
    `Salesinvoices/GetLastBillNo?customerCode=${customerCode}`,
},

  Scrap_Procurement: {
    GET_VOUCHER_NO: (compCode) => `ScrapProcurement/GetMaxVoucherNo?compCode=${compCode}`,
    SAVE_SCRAP_PROCUREMENT: (saveType) =>
      `ScrapProcurement/SCRAPCREATE?selecttype=${saveType === 'create' ? 'true' : 'false'}`,
    GET_SALESiNVOICE_ITEMS: "Salesinvoices/GetItemsByType?type=SC",
    // GET_BILL_LIST:"ScrapProcurement/GetVouchersBillNoList?compCode=001&pageNumber=1&pageSize=100",
    GET_BILL_LIST: (fCompCode, page, pageSize) => `ScrapProcurement/GetVouchersBillNoList?compCode=${fCompCode}&pageNumber=${page}&pageSize=${pageSize}`,
    GET_VOUCHER_BY_NO: (voucherNo, compCode) => `ScrapProcurement/GetSCRAPDETAILS/${voucherNo}/${compCode}`,
    DELETE_SCRAP_PROCUREMENT: (voucherNo, compCode) => `ScrapProcurement/SCRAPDELETE/${voucherNo}/${compCode}`,
    GET_CUSTOMER_LIST: (page, pageSize) => `Salesinvoices/GetPartyByParent?pageNumber=${page}&pageSize=${pageSize}`,
    GET_ITEM_LIST: (page, pageSize) => `Salesinvoices/GetItemsByType?type=SC&page=${page}&pageSize=${pageSize}`,
    GET_TAX_LIST: "TaxCreation/gettaxlist",
  },
    TENDER: {
    opening: "Tender/opening",
    closing: "Tender/closing",
  },



  BILLCOLLECTOR:{
    GET_BILLCOLLECTOR_ITEMS:(fCompCode, search, page, pageSize) => `BillCollector/GetSalesBillslist?fCompCode=${fCompCode}&search=${search}&pageNumber=${page}&pageSize=${pageSize}`,
    GET_LIVE_DRAWER: (date) => `BillCollector/GetLiveDrawer?date=${date}`,
     GET_ITEMS_DISCOUNT_FLAG: (voucherNo) =>
    `BillCollector/GetItemsDiscountFlag?voucherNo=${voucherNo}`,

  },

  SALESRETURN: {
  GET_SALESRETURN_TENDER: (vouchNo) => `SalesReturn/SalesReturnTender?vouchNo=${vouchNo}`,
},
 TAX: {
  // GET with pagination
  GET_TAX_LIST: (page = 1, pageSize = 10) =>
    `/TaxCreation/gettaxlist?page=${page}&pageSize=${pageSize}`,

  // CREATE (selecttype = true)
  CREATE_TAX: `/TaxCreation/TaxCreation?selecttype=true`,

  // UPDATE (selecttype = false)
  UPDATE_TAX: `/TaxCreation/TaxCreation?selecttype=false`,

  // DELETE by code
  DELETE_TAX: (code) => `/TaxCreation/Delete/${code}`,
},





PAYMENTVOUCHER: {
  GETNEXTVNUMBER: (compCode) => `PaymentVoucher/GetNextVoucher?compCode=${compCode}`,
  GETPENDINGBILLS: (partyCode,compCode) => `PaymentVoucher/GetPendingBills?fcode=${partyCode}&fCompCode=${compCode}`,
  GETBILLNUMLIST: (compCode)=>`PaymentVoucher/BillNumberList/${compCode}`,
  GETPARTYLIST: (search = '', pageNumber = 1, pageSize = 20) => `PaymentVoucher/PartyList?search=${encodeURIComponent(search)}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
  GET_PAYMENT_DETAILS: (voucherNo, fcode, compCode) => `PaymentVoucher/getPaymentDetails?voucherNo=${voucherNo}&fcode=${fcode}&fCompCode=${compCode}`,
  POST_PAYMENT_VOUCHER: (selectType = true) => `PaymentVoucher/PaymentVoucherPost?selectType1=${selectType}`,
  DELETE_PAYMENT_VOUCHER: (voucherNo) => `PaymentVoucher/DeletePaymentVoucher?voucherNo=${voucherNo}`,
  GET_PAYMENT_VOUCHER_DETAILS: (voucherNo) => `PaymentVoucher/GetpaymentVoucherDetails?voucherNo=${voucherNo}`,
  GET_PARTY_BALANCE: (partyCode) => `PaymentVoucher/GetPartyBalance?partyCode=${partyCode}`,
  GET_CLOSING_BALANCE: `PaymentVoucher/GetClosingBalance`
},





  RECEIPTVOUCHER: {
    GETNEXTVNUMBER: (compCode) => `ReceiptVoucher/GetNextReceiptVoucher?compCode=${compCode}`,
    GETBILLNUMLIST: (compCode, pageNumber = 1, pageSize = 100) => `ReceiptVoucher/GetReceiptVoucherList?compCode=${compCode}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
    POST_RECEIPT_VOUCHER: (selectType = true) => `ReceiptVoucher/ReceiptVoucherPost?selectType=${selectType}`,
    PUT_RECEIPT_VOUCHER: (selectType = false) => `ReceiptVoucher/ReceiptVoucherPost?selectType=${selectType}`,
    DELETE: (voucherNo, compCode) => `ReceiptVoucher/DeleteReceiptVoucher?voucherNo=${voucherNo}&compCode=${compCode}`,
    PARTY_LIST: (pageNumber = 1, pageSize = 200) => `PaymentVoucher/PartyList?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    GET_VOUCHER_DETAILS: (voucherNo, companyCode) => `ReceiptVoucher/GetVoucherDetails?voucherNo=${voucherNo}&companyCode=${companyCode}`,
    GETPENDINGBILLS: (partyCode, compCode) => `ReceiptVoucher/GetPendingBills?fcode=${partyCode}&fCompCode=${compCode}`,
    GETPARTYLIST: (search = '', pageNumber = 1, pageSize = 200) => `PaymentVoucher/PartyList?search=${encodeURIComponent(search)}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
    GET_PARTY_BALANCE: (partyCode) => `ReceiptVoucher/GetPartyBalance?partyCode=${partyCode}`,
    GET_OPENING_BALANCE: `ReceiptVoucher/GetOpeningBalance`
  },

  PURCHASE_RETURN_REGISTER: {
    GET_LIST:(fromDate, toDate, compCode, page, pageSize) => `purchaseretunRegister/GetPurchaseReturnRegister?fromDate=${fromDate}&toDate=${toDate}&compCode=${compCode}&pageNumber=${page}&pageSize=${pageSize}`
  },
  PURCHASE_REGISTER: {
    GET_LIST:(fromDate, toDate, compCode, page, pageSize) => `PurchaseRegister/GetPurchaseRegister?fromDate=${fromDate}&toDate=${toDate}&compCode=${compCode}&pageNumber=${page}&pageSize=${pageSize}`
  },
  SCRAP_PURCHASE: {
    GET_LIST:(fromDate, toDate, compCode, page, pageSize) => `ScrapPur/GetScrapPurchaseRegister?fromDate=${fromDate}&toDate=${toDate}&compCode=${compCode}&pageNumber=${page}&pageSize=${pageSize}`
  },
  ACC_REC: {
    COMPANIES: 'AccRec/companies',
    LIST: (selectedCompanies, pageNumber = 1, pageSize = 20) => 
      `AccRec/list?selectedCompanies=${encodeURIComponent(selectedCompanies)}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
  },
 
  
  LEDGER: {
    COMPANIES: 'ledger/companies',
    PARTY_LIST: (pageNumber = 1, pageSize = 20, search = '') => 
      `ledger/partyList?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`,
    GET_LEDGER: (accountCode, compCode, fromDate, toDate) =>
      `ledger/GetLedger?accountCode=${encodeURIComponent(accountCode)}&compCode=${encodeURIComponent(compCode)}&fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`,
  },
  
  SALES_REGISTER: {
    SALES_REPORT: (fromDate, toDate, compCode, page = 1, pageSize = 20) =>
      `SalesRegister/SalesReport?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}&compCode=${encodeURIComponent(compCode)}&page=${page}&pageSize=${pageSize}`,
  },

  ACC_PAY: {
    COMPANIES: 'AccPayable/companies',
    LIST: (selectedCompanies, pageNumber = 1, pageSize = 20) => 
      `AccPayable/list?selectedCompanies=${encodeURIComponent(selectedCompanies)}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
  },

  GROUP_WISE_STOCK: {
    BRANCH_WISE_STOCK: (fromDate, toDate, compCodes, search = '', page = 1, pageSize = 100) =>
      `GroupWiseStock/branch-wise-stock?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}&compCodes=${encodeURIComponent(compCodes)}&search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`,
    GROUP_DETAIL: (groupName, fromDate, toDate, compCodes) =>
      `GroupWiseStock/group-detail?groupName=${encodeURIComponent(groupName)}&fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}&compCodes=${encodeURIComponent(compCodes)}`,
    ITEM_DETAIL: (itemName, fromDate, toDate, compCodes) =>
      `GroupWiseStock/item-detail?itemName=${encodeURIComponent(itemName)}&fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}&compCodes=${encodeURIComponent(compCodes)}`,
  }, // <-- Add this closing brace for GROUP_WISE_STOCK
  DAYBOOK: {
    GET_DAY_BOOK: (compCode, fromDate, toDate) =>
      `Daybook/GetDayBook?compCode=${encodeURIComponent(compCode)}&fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`,
  },

  DAYCLOSE: {
    GET: (compCode) => `DayClose/get-DayClose/${compCode}`,
    UPDATE: 'DayClose/update-DayClose',
  },

  SALES_RETURN_REGISTER: {
    GET_SALES_RETURN_REGISTER: (fromDate, toDate, compCode, pageNumber = 1, pageSize = 200) =>
      `SalesReturnRegister/GetSalesReturnRegister?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}&compCode=${encodeURIComponent(compCode)}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
  },

  BILL_COLLECTOR_REPORT: {
    GET_BILL_COLLECTOR_REPORT: (fromDate, toDate, compCode, pageNumber, pageSize,searchInvoiceNo) =>
      `TenderRecord/GetTenderRecords?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}&fCompCode=${encodeURIComponent(compCode)}&searchInvoiceNo=${searchInvoiceNo}&pageNo=${pageNumber}&pageSize=${pageSize}`,
  },

  TAG_PRINT: {
  GET_TAG_PRINT_LIST: (params) =>
    `tagprint/TagPrintList?fromDate=${params.fromDate}
    &toDate=${params.toDate}
    &search=${params.search}
    &fcompcode=${params.fcompcode}
    &page=${params.page}
    &pageSize=${params.pageSize}`,
  GET_TAG_PRINT_ITEMS: (params) =>
    `tagprint/TagPrintDetails?voucher=${encodeURIComponent(params.voucher)}&compCode=${encodeURIComponent(params.compCode)}&page=${params.page}&pageSize=${params.pageSize}`,
},

  PREFIX_HISTORY: {
    GET_BY_PREFIX: (prefix) => `/Prefixhistory/GetByPrefix?prefix=${prefix}`,
    // If you need other endpoints for prefix history
  },

  ITEMWISE_STOCK: {
    GET_ITEMS_LIST: (page = 1, pageSize = 10) =>
      `ItemwiseStock/GetItemslist?page=${page}&pageSize=${pageSize}`,

    GET_COMPANY_LIST: () =>
    `CompanyCreation/GetCompanyList`,

      GET_ITEM_STOCK_BY_DATE: (itemCode, compCode, startDate, endDate) =>
    `ItemwiseStock/GetitemStock?itemCode=${itemCode}&compCode=${compCode}&startDate=${startDate}&endDate=${endDate}`,
  },

};