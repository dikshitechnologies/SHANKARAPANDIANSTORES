export const API_ENDPOINTS = {
  // Login Endpoint
  LOGIN: {
    getUserInfo: (username, password) => 
      `Login/GetCompanyUserInfo?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
  },

  LEDGER_CREATION_ENDPOINTS: {
    getTree: "LedgerGroupCreation/LedgerGroupCreationGet",
    getDropdown: "LedgerCreation/GetledgerCreationdropdowslist",
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
    GET_PERMISSIONS_BY_USER: "Administartor/GetPermissionsByUserCode",
    DELETE_PERMISSIONS: "Administartor/administration/delete"
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

  SCRAP_CREATION: {
    GET_SCRAP_ITEMS: '/ScrapCreation/getScrapItem',
    GET_NEXT_SCRAP_CODE: '/ScrapCreation/getNextScrapFcode',
    CREATE_SCRAP: '/ScrapCreation/createScrap',
    UPDATE_SCRAP: '/ScrapCreation/updateScrap',
    DELETE_SCRAP: (scrapCode) => `/ScrapCreation/deleteScrap/${scrapCode}`,
    GET_SCRAP_BY_CODE: (scrapCode) => `/ScrapCreation/getScrapByCode/${scrapCode}`,
  },
  sales_return:{
     getMaxVoucherNo: (companyCode) => `SalesReturn/GetMaxVoucherNo/${companyCode}`,
      getVoucherList: (companyCode) => `SalesReturn/VoucherList/${companyCode}`,
       getCustomers: "Salesinvoices/GetPartyByParent",
       createSalesReturn: 'SalesReturn/SalesReturnCreate?SelectType=true',
    updateSalesReturn: 'SalesReturn/SalesReturnCreate?SelectType=true', // Same endpoint for both
    deleteSalesReturn: (voucherNo) => `SalesReturn/DeleteSalesReturn/${voucherNo}`,
    getSalesReturnDetails: (voucherNo) => `SalesReturn/GetSalesReturnDetails/${voucherNo}`,
  },
  
  SCRAP_RATE_FIXING: {
    GET_FULL_SCRAP_RATES: 'ScrapRateFixing/getFullScrapRateFixing',
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
    GET_ITEM_DETAILS_BY_CODE: (itemCode) => `Salesinvoices/GetStockByItemName?itemcode=${itemCode}&billType=FG`,
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

  // 1) Get next bill number
  getNextBillNo: (compCode) =>
    `Salesinvoices/salesnextbillNo/${compCode}`,


   CREATE_SALES: "Salesinvoices/CreateSales/true",   // Insert
   UPDATE_SALES: "Salesinvoices/CreateSales/false",  // Update



  // 3) Get sales bill list
  getBillList: (compCode, page = 1, pageSize = 20) =>
    `Salesinvoices/salesbillList/${compCode}?page=${page}&pageSize=${pageSize}`,


  // 4) Delete sales bill number
  deleteBillNumber: (voucher, compCode) =>
    `Salesinvoices/salesbillnumber?voucher=${voucher}&compCode=${compCode}`,


  // 5) Get stock by item
  getStockByItemName: (billType, itemcode) =>
    `Salesinvoices/GetStockByItemName?billType=${billType}&itemcode=${itemcode}`,


  // 6) Get voucher details
  getVoucherDetails: (voucherNo) =>
    `Salesinvoices/GetVoucherDetails?voucherNo=${voucherNo}`,


  // 7) Get item types
  getItemTypes: () =>
    `Salesinvoices/GetItemTypes`,


  // 8) Get items by type
  getItemsByType: (type) =>
    `Salesinvoices/GetItemsByType?type=${type}`,


  // 9) Stock by itemcode (alternative)
  getStockByItemName1: (itemcode) =>
    `Salesinvoices/GetStockByItemName1?itemcode=${itemcode}`,


  // 10) Get salesman list
  getSalesman: () =>
    `SalesmanCreation/GetSalesman`,


  // 11) Item dropdown
  getItemDropdown: (page = 1, pageSize = 10, searchText = '') =>
    `ItemCreation/GetItemCreationdropdowslist?page=${page}&pageSize=${pageSize}&searchText=${encodeURIComponent(searchText)}`,


  // 12) Get customers
  getCustomers: () =>
    `Salesinvoices/GetPartyByParent`,
}














};

