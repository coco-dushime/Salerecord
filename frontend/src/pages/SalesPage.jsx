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
    `mt-1 w-full rounded-lg border px-3 py-2 ${fieldErrors[key] ? "border-red-500" : "border-line"}`;

  const canSubmit = customers.length > 0 && products.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">Sales</h2>
        <p className="text-muted text-sm">Record sales — select customer, product, and payment method from the list</p>
      </div>
      {(customers.length === 0 || products.length === 0) && (
        <p className="text-amber-700 text-sm bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          Add at least one customer and one product before recording sales.
        </p>
      )}
      <form onSubmit={submit} className="bg-card rounded-xl border border-line p-6 grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-ink">Invoice Number</span>
          <input
            className={inputClass("invoiceNumber")}
            value={form.invoiceNumber}
            onChange={(e) => setField("invoiceNumber", e.target.value)}
          />
          {fieldErrors.invoiceNumber && <p className="text-red-600 text-xs mt-1">{fieldErrors.invoiceNumber}</p>}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Sales Date</span>
          <input
            type="datetime-local"
            className={inputClass("salesDate")}
            value={form.salesDate}
            onChange={(e) => setField("salesDate", e.target.value)}
          />
          {fieldErrors.salesDate && <p className="text-red-600 text-xs mt-1">{fieldErrors.salesDate}</p>}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Payment Method</span>
          <select
            className={inputClass("paymentMethod")}
            value={form.paymentMethod}
            onChange={(e) => setField("paymentMethod", e.target.value)}
          >
            <option value="">Select payment method</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          {fieldErrors.paymentMethod && <p className="text-red-600 text-xs mt-1">{fieldErrors.paymentMethod}</p>}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Total Amount</span>
          <input
            type="number"
            min="0"
            step="0.01"
            className={inputClass("totalAmountPaid")}
            value={form.totalAmountPaid}
            onChange={(e) => setField("totalAmountPaid", e.target.value)}
          />
          {fieldErrors.totalAmountPaid && <p className="text-red-600 text-xs mt-1">{fieldErrors.totalAmountPaid}</p>}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Customer</span>
          <select
            className={inputClass("customerNumber")}
            value={form.customerNumber}
            onChange={(e) => setField("customerNumber", e.target.value)}
            disabled={customers.length === 0}
          >
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c.customer_number} value={c.customer_number}>
                {c.customer_number} — {c.first_name} {c.last_name}
              </option>
            ))}
          </select>
          {fieldErrors.customerNumber && <p className="text-red-600 text-xs mt-1">{fieldErrors.customerNumber}</p>}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Product</span>
          <select
            className={inputClass("productCode")}
            value={form.productCode}
            onChange={(e) => setField("productCode", e.target.value)}
            disabled={products.length === 0}
          >
            <option value="">Select product</option>
            {products.map((p) => (
              <option key={p.product_code} value={p.product_code}>
                {p.product_code} — {p.product_name}
              </option>
            ))}
          </select>
          {fieldErrors.productCode && <p className="text-red-600 text-xs mt-1">{fieldErrors.productCode}</p>}
        </label>
        <div className="md:col-span-2 flex flex-wrap gap-3 items-center">
          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="rounded-lg bg-accent text-accent-text px-5 py-2 font-semibold disabled:opacity-50"
          >
            {loading ? "Saving..." : editId ? "Update" : "Add Sale"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={() => { setEditId(null); setForm(emptyForm); setFieldErrors({}); }}
              className="rounded-lg border border-line px-5 py-2"
            >
              Cancel
            </button>
          )}
          {message && <span className="text-sm text-green-600">{message}</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
      <div className="bg-card rounded-xl border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.invoice_number} className="border-t border-line">
                <td className="px-4 py-3">{row.invoice_number}</td>
                <td className="px-4 py-3">{String(row.sales_date ?? "").slice(0, 16)}</td>
                <td className="px-4 py-3">{row.payment_method}</td>
                <td className="px-4 py-3">{row.total_amount_paid}</td>
                <td className="px-4 py-3">{customerLabel(row.customer_number)}</td>
                <td className="px-4 py-3">{productLabel(row.product_code)}</td>
                <td className="px-4 py-3 space-x-2">
                  <button type="button" onClick={() => startEdit(row)} className="text-accent font-medium">Edit</button>
                  <button type="button" onClick={() => remove(row.invoice_number)} className="text-red-600 font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
