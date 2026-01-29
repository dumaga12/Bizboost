import axios from "axios";

export const registerCustomer = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const response = await axios.post(`${API}/auth/register`, data);
  console.log("API response", response.data);
  return response.data;
};

export const registerBusiness = async (data: any) => {
  const response = await axios.post(`${API}/business/register`, data);
  return response.data;
};

