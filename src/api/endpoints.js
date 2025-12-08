export const API_ENDPOINTS = {
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
    NEXT_SIZE_CODE : "UnitCreation/NextBillNo", 
    GET_SIZE_ITEMS : "UnitCreation/GetUnits",
    GETUNITCODE : (code) => `UnitCreation/GetUnit/${code}`, 
    CREATE_SIZE: "UnitCreation/CreationUnit",
    UPDATE_SIZE: (code) => `UnitCreation/UpdateUnit/${code}`,
    DELETE_SIZE: (code) => `UnitCreation/DeleteUnit/${code}`,
  },    

    ADMINISTRATION: {
    USER_LIST: "Administartor/UserNameList",
    ADMIN_BATCH_INSERT: "Administartor/adminstration/InsertBatch",
    GET_PERMISSIONS_BY_USER: "Administartor/GetPermissionsByUserCode",
    DELETE_PERMISSIONS: "Administartor/administration/delete"
  },

  SCRAP_CREATION: {
    GET_SCRAP_ITEMS: '/ScrapCreation/getScrapItem',
    GET_NEXT_SCRAP_CODE: '/ScrapCreation/getNextScrapFcode',
    CREATE_SCRAP: '/ScrapCreation/createScrap',
    UPDATE_SCRAP: '/ScrapCreation/updateScrap',
    DELETE_SCRAP: (scrapCode) => `/ScrapCreation/deleteScrap/${scrapCode}`,
    GET_SCRAP_BY_CODE: (scrapCode) => `/ScrapCreation/getScrapByCode/${scrapCode}`,
  },











 scrapratefix:
 {
  getscrapratefixing:"ScrapRateFixing/getFullScrapRateFixing",
  putscrapratefixing:"ScrapRateFixing/updateFullScrapRateFixing",
 },

  PURCHASE_INVOICE: {
    GET_PURCHASE_INVOICES: (compCode) => `PurchaseInvoice/FlushNumber/${compCode}`,
    CREATE_PURCHASE_INVOICE: "PurchaseInvoice/CreatePurchase",
  }
    

};
