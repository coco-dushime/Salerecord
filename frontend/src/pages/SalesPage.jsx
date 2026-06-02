import { useEffect, useState } from "react";
import api from "../api/client.js";

const PAYMENT_METHODS = ["Cash", "Mobile Money", "Bank Transfer"];

const emptyForm = {
  invoiceNumber: "",
  salesDate: "",
  paymentMethod: "",
  totalAmountPaid: "",
  customerNumber: "",
  productCode: "",
};

const formatDateTimeLocal = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 16);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const validateSale = (form, customers, products) => {
  const errors = {};
  if (!form.invoiceNumber.trim()) errors.invoiceNumber = "Invoice number is required.";
  if (!form.salesDate) errors.salesDate = "Sales date is required.";
  if (!form.paymentMethod) errors.paymentMethod = "Select a payment method.";
  else if (!PAYMENT_METHODS.includes(form.paymentMethod)) {
    errors.paymentMethod = "Select Cash, Mobile Money, or Bank Transfer.";
  }
  if (form.totalAmountPaid === "" || Number.isNaN(Number(form.totalAmountPaid))) {
    errors.totalAmountPaid = "Total amount is required.";
  } else if (Number(form.totalAmountPaid) < 0) {
    errors.totalAmountPaid = "Amount cannot be negative.";
  }
  if (!form.customerNumber) errors.customerNumber = "Select a customer from the list.";
  else if (!customers.some((c) => c.customer_number === form.customerNumber)) {
    errors.customerNumber = "Selected customer is not valid.";
  }
  if (!form.productCode) errors.productCode = "Select a product from the list.";
  else if (!products.some((p) => p.product_code === form.productCode)) {
    errors.productCode = "Selected product is not valid.";
  }
  return errors;
};

export default function SalesPage() {
  const [form, setForm] = useState(emptyForm);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [rows, setRows] = useState([]);
  const [editId, setEditId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadSales = async () => {
    try {
      const { data } = await api.get("/sales");
      setRows(data);
    } catch {
      setError("Failed to load sales records.");
    }
  };

  const loadCustomers = async () => {
    try {
      const { data } = await api.get("/customers");
      setCustomers(data);
    } catch {
      setError("Failed to load customers.");
    }
  };

  const loadProducts = async () => {
    try {
      const { data } = await api.get("/products");
      setProducts(data);
    } catch {
      setError("Failed to load products.");
    }
  };

  useEffect(() => {
    loadSales();
    loadCustomers();
    loadProducts();
  }, []);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const errors = validateSale(form, customers, products);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/sales/${editId}`, form);
        setMessage("Sale updated.");
      } else {
        await api.post("/sales", form);
        setMessage("Sale added.");
      }
      setForm(emptyForm);
      setFieldErrors({});
      setEditId(null);
      loadSales();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (row) => {
    setEditId(row.invoice_number);
    setFieldErrors({});
    setForm({
      invoiceNumber: row.invoice_number ?? "",
      salesDate: formatDateTimeLocal(row.sales_date),
      paymentMethod: row.payment_method ?? "",
      totalAmountPaid: String(row.total_amount_paid ?? ""),
      customerNumber: row.customer_number ?? "",
      productCode: row.product_code ?? "",
    });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await api.delete(`/sales/${id}`);
      loadSales();
    } catch {
      setError("Delete failed.");
    }
  };

  const customerLabel = (number) => {
    const c = customers.find((x) => x.customer_number === number);
    if (!c) return number;
    return `${c.first_name} ${c.last_name} (${number})`;
  };

  const productLabel = (code) => {
    const p = products.find((x) => x.product_code === code);
    if (!p) return code;
    return `${p.product_name} (${code})`;
  };

 const inputClass = (key) =>
  `mt-2 w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    fieldErrors[key] ? "border-red-500" : "border-gray-300"
  }`;

  const canSubmit = customers.length > 0 && products.length > 0;

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 p-6">
    <div className="max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-800">
          Sales Management
        </h2>
        <p className="text-gray-500 mt-2">
          Record and manage customer sales transactions
        </p>
      </div>

      {/* Warning */}
      {(customers.length === 0 || products.length === 0) && (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded-xl">
          Add at least one customer and one product before recording sales.
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={submit}
        className="bg-white rounded-3xl shadow-xl p-8 grid gap-5 md:grid-cols-2"
      >
        <label>
          <span className="font-semibold text-gray-700">
            Invoice Number
          </span>
          <input
            className={inputClass("invoiceNumber")}
            value={form.invoiceNumber}
            onChange={(e) =>
              setField("invoiceNumber", e.target.value)
            }
          />
        </label>

        <label>
          <span className="font-semibold text-gray-700">
            Sales Date
          </span>
          <input
            type="datetime-local"
            className={inputClass("salesDate")}
            value={form.salesDate}
            onChange={(e) =>
              setField("salesDate", e.target.value)
            }
          />
        </label>

        <label>
          <span className="font-semibold text-gray-700">
            Payment Method
          </span>
          <select
            className={inputClass("paymentMethod")}
            value={form.paymentMethod}
            onChange={(e) =>
              setField("paymentMethod", e.target.value)
            }
          >
            <option value="">Select Payment</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="font-semibold text-gray-700">
            Total Amount
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            className={inputClass("totalAmountPaid")}
            value={form.totalAmountPaid}
            onChange={(e) =>
              setField("totalAmountPaid", e.target.value)
            }
          />
        </label>

        <label>
          <span className="font-semibold text-gray-700">
            Customer
          </span>
          <select
            className={inputClass("customerNumber")}
            value={form.customerNumber}
            onChange={(e) =>
              setField("customerNumber", e.target.value)
            }
            disabled={customers.length === 0}
          >
            <option value="">Select Customer</option>
            {customers.map((c) => (
              <option
                key={c.customer_number}
                value={c.customer_number}
              >
                {c.customer_number} - {c.first_name} {c.last_name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="font-semibold text-gray-700">
            Product
          </span>
          <select
            className={inputClass("productCode")}
            value={form.productCode}
            onChange={(e) =>
              setField("productCode", e.target.value)
            }
            disabled={products.length === 0}
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option
                key={p.product_code}
                value={p.product_code}
              >
                {p.product_code} - {p.product_name}
              </option>
            ))}
          </select>
        </label>

        <div className="md:col-span-2 flex flex-wrap gap-4 items-center">
          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition duration-300 disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : editId
              ? "Update Sale"
              : "Add Sale"}
          </button>

          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setForm(emptyForm);
                setFieldErrors({});
              }}
              className="border border-gray-300 px-8 py-3 rounded-xl hover:bg-gray-100"
            >
              Cancel
            </button>
          )}

          {message && (
            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg">
              {message}
            </span>
          )}

          {error && (
            <span className="bg-red-100 text-red-700 px-4 py-2 rounded-lg">
              {error}
            </span>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left">Invoice</th>
              <th className="px-6 py-4 text-left">Date</th>
              <th className="px-6 py-4 text-left">Payment</th>
              <th className="px-6 py-4 text-left">Amount</th>
              <th className="px-6 py-4 text-left">Customer</th>
              <th className="px-6 py-4 text-left">Product</th>
              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={row.invoice_number}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4 font-medium">
                  {row.invoice_number}
                </td>
                <td className="px-6 py-4">
                  {String(row.sales_date ?? "").slice(0, 16)}
                </td>
                <td className="px-6 py-4">
                  {row.payment_method}
                </td>
                <td className="px-6 py-4">
                  {Number(row.total_amount_paid).toLocaleString()} RWF
                </td>
                <td className="px-6 py-4">
                  {customerLabel(row.customer_number)}
                </td>
                <td className="px-6 py-4">
                  {productLabel(row.product_code)}
                </td>
                <td className="px-6 py-4 space-x-3">
                  <button
                    type="button"
                    onClick={() => startEdit(row)}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => remove(row.invoice_number)}
                    className="text-red-600 font-semibold hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  </div>
);
}
