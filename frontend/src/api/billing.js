import client from "./client";

// Customers
export const getCustomers = () => client.get("/customers").then((r) => r.data);
export const getCustomer = (id) => client.get(`/customers/${id}`).then((r) => r.data);
export const createCustomer = (data) => client.post("/customers", data).then((r) => r.data);
export const updateCustomer = (id, data) => client.put(`/customers/${id}`, data).then((r) => r.data);
export const deleteCustomer = (id) => client.delete(`/customers/${id}`);

// Products
export const getProducts = () => client.get("/products").then((r) => r.data);
export const getProduct = (id) => client.get(`/products/${id}`).then((r) => r.data);
export const createProduct = (data) => client.post("/products", data).then((r) => r.data);
export const updateProduct = (id, data) => client.put(`/products/${id}`, data).then((r) => r.data);
export const deleteProduct = (id) => client.delete(`/products/${id}`);

// Invoices
export const getInvoices = () => client.get("/invoices").then((r) => r.data);
export const getInvoice = (id) => client.get(`/invoices/${id}`).then((r) => r.data);
export const createInvoice = (data) => client.post("/invoices", data).then((r) => r.data);
export const updateInvoiceStatus = (id, status) =>
  client.patch(`/invoices/${id}/status`, { status }).then((r) => r.data);
export const deleteInvoice = (id) => client.delete(`/invoices/${id}`);
export const getDashboard = () => client.get("/invoices/dashboard").then((r) => r.data);
export const getAiSummary = (id) => client.get(`/invoices/${id}/ai-summary`).then((r) => r.data);
