import api from "@/api/axios";

export const registerCustomer = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/register", data);
  console.log("API response", response.data);
  return response;
};

export const registerBusiness = async (data: any) => {
  const response = await api.post("/business/register", data);
  return response;
};

