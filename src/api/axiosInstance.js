// src/api/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
 
  baseURL: "http://dikshiserver/reacttest/api/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },

});

export default axiosInstance;


export const api = axios.create({
  baseURL: "http://dikshiserver/reacttest/api/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});



