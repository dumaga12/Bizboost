import axios from "axios";

const API_URL = "http://localhost:3001/api/auth";

export const registerCustomer = (data) => {
  return axios.post(`${API_URL}/register`, {
    full_name: data.name,
    email: data.email,
    password: data.password,
    role: "customer",
  });
};

export const registerBusiness = (data) => {
  return axios.post(`${API_URL}/business/register`, data);
};

