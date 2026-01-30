const BASE_URL = 'http://dikshiserver/spstores/api';

export const API_ENDPOINTS = {
  // Item Group Creation
  itemGroup: {
    dropdownlist: `${BASE_URL}/ItemGroupCreation/ItemgroupCreationDropdownlist`,
    list: `${BASE_URL}/ItemGroupCreation/list`,
    create: `${BASE_URL}/ItemGroupCreation/create`,
    update: `${BASE_URL}/ItemGroupCreation/update`,
    delete: `${BASE_URL}/ItemGroupCreation/delete`,
  },


};

export default API_ENDPOINTS;
