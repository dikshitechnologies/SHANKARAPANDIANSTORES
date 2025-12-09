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
    CREATE_SIZE: "UnitCreation/CreateUnit",
    UPDATE_SIZE: (code) => `UnitCreation/UpdateUnit/${code}`,
    DELETE_SIZE: (code) => `UnitCreation/DeleteUnit/${code}`,
  },  
  
  COLORCREATION: {
    NEXT_COLOR_CODE : "Colour_Creation/getNextColurFcode", 
    GET_COLOR_ITEMS : "Colour_Creation/getColourItem",
    // GETCOLORCODE : (code) => `ColorCreation/GetColor/${code}`, 
    CREATE_COLOR: "Colour_Creation/createColour",
    UPDATE_COLOR: "Colour_Creation/updateColour",
    DELETE_COLOR: (code) => `Colour_Creation/deleteColour/${code}`,
  },
  SIZECREATION: {
    NEXT_SIZE_CODE : "SizeCreation/SizeNextFcode", 
    GET_SIZE_ITEMS : "SizeCreation/getSizeItem",
    // GETUNITCODE : (code) => `SizeCreation/GetSize/${code}`, 
    CREATE_SIZE: "SizeCreation/createSize",
    UPDATE_SIZE: "SizeCreation/UpdateSize",
    DELETE_SIZE: (code) => `SizeCreation/DeleteSize/${code}`,
  },
  MODELCREATION: {
    NEXT_MODEL_CODE : "ModelCreation/getNextModelFcode", 
    GET_MODEL_ITEMS : "ModelCreation/getModelItem",
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
    DELETE_STATE: (code) => `/StateCreation/deleteState?fuCode=${code}`,
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

