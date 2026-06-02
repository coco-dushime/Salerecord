import { useEffect, useState } from "react";
import api from "../api/client.js";

const emptyForm = {
  productCode: "",
  productName: "",
  quantitySold: "",
  unitPrice: "",
};

const validateProduct = (form) => {
  const errors = {};
  if (!form.productCode.trim()) errors.productCode = "Product code is required.";
  else if (form.productCode.trim().length < 2) errors.productCode = "Code must be at least 2 characters.";
  if (!form.productName.trim()) errors.productName = "Product name is required.";
  if (form.quantitySold === "" || Number.isNaN(Number(form.quantitySold))) {
    errors.quantitySold = "Quantity sold is required.";
  } else if (Number(form.quantitySold) < 0) {
    errors.quantitySold = "Quantity cannot be negative.";
  }
  if (form.unitPrice === "" || Number.isNaN(Number(form.unitPrice))) {
    errors.unitPrice = "Unit price is required.";
  } else if (Number(form.unitPrice) < 0) {
    errors.unitPrice = "Price cannot be negative.";
  }
  return errors;
};

export default function ProductsPage() {
  const [form, setForm] = useState(emptyForm);
  const [rows, setRows] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get("/products");
      setRows(data);
    } catch {
      setError("Failed to load records.");
    }
  };

  useEffect(() => { load(); }, []);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const errors = validateProduct(form);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    try {
      await api.post("/products", form);
      setMessage("Product added successfully.");
      setForm(emptyForm);
      setFieldErrors({});
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (key) =>
    `mt-1 w-full rounded-lg border px-3 py-2 ${fieldErrors[key] ? "border-red-500" : "border-line"}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">Products</h2>
        <p className="text-muted text-sm">Add new product records</p>
      </div>
      <form onSubmit={submit} className="bg-card rounded-xl border border-line p-6 grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-ink">Product Code</span>
          <input
            className={inputClass("productCode")}
            value={form.productCode}
            onChange={(e) => setField("productCode", e.target.value.toUpperCase())}
            placeholder="e.g. PRD01"
          />
          {fieldErrors.productCode && <p className="text-red-600 text-xs mt-1">{fieldErrors.productCode}</p>}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Product Name</span>
          <input
            className={inputClass("productName")}
            value={form.productName}
            onChange={(e) => setField("productName", e.target.value)}
          />
          {fieldErrors.productName && <p className="text-red-600 text-xs mt-1">{fieldErrors.productName}</p>}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Quantity Sold</span>
          <input
            type="number"
            min="0"
            className={inputClass("quantitySold")}
            value={form.quantitySold}
            onChange={(e) => setField("quantitySold", e.target.value)}
          />
          {fieldErrors.quantitySold && <p className="text-red-600 text-xs mt-1">{fieldErrors.quantitySold}</p>}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Unit Price</span>
          <input
            type="number"
            min="0"
            step="0.01"
            className={inputClass("unitPrice")}
            value={form.unitPrice}
            onChange={(e) => setField("unitPrice", e.target.value)}
          />
          {fieldErrors.unitPrice && <p className="text-red-600 text-xs mt-1">{fieldErrors.unitPrice}</p>}
        </label>
        <div className="md:col-span-2 flex gap-3 items-center">
          <button type="submit" disabled={loading} className="rounded-lg bg-accent text-accent-text px-5 py-2 font-semibold">{loading ? "Saving..." : "Add Product"}</button>
          {message && <span className="text-sm text-green-600">{message}</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
      <div className="bg-card rounded-xl border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left">
            <tr>
              <th className="px-4 py-3">Product Code</th>
              <th className="px-4 py-3">Product Name</th>
              <th className="px-4 py-3">Quantity Sold</th>
              <th className="px-4 py-3">Unit Price</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.product_code} className="border-t border-line">
                <td className="px-4 py-3">{row.product_code}</td>
                <td className="px-4 py-3">{row.product_name}</td>
                <td className="px-4 py-3">{row.quantity_sold}</td>
                <td className="px-4 py-3">{row.unit_price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
