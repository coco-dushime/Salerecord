import { useEffect, useState } from "react";
import api from "../api/client.js";

const emptyForm = {
  customerNumber: "",
  firstName: "",
  lastName: "",
  telephone: "",
  address: "",
};

const validateCustomer = (form) => {
  const errors = {};
  if (!form.customerNumber.trim()) errors.customerNumber = "Customer number is required.";
  if (!form.firstName.trim()) errors.firstName = "First name is required.";
  if (!form.lastName.trim()) errors.lastName = "Last name is required.";
  if (!form.telephone.trim()) errors.telephone = "Telephone is required.";
  else if (!/^[0-9+\-\s]{7,15}$/.test(form.telephone.trim())) {
    errors.telephone = "Enter a valid phone number (7–15 digits).";
  }
  if (!form.address.trim()) errors.address = "Address is required.";
  return errors;
};

export default function CustomersPage() {
  const [form, setForm] = useState(emptyForm);
  const [rows, setRows] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get("/customers");
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
    const errors = validateCustomer(form);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    try {
      await api.post("/customers", form);
      setMessage("Customer added successfully.");
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
        <h2 className="text-2xl font-bold text-ink">Customers</h2>
        <p className="text-muted text-sm">Add new customer records</p>
      </div>
      <form onSubmit={submit} className="bg-card rounded-xl border border-line p-6 grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-ink">Customer Number</span>
          <input
            className={inputClass("customerNumber")}
            value={form.customerNumber}
            onChange={(e) => setField("customerNumber", e.target.value)}
          />
          {fieldErrors.customerNumber && <p className="text-red-600 text-xs mt-1">{fieldErrors.customerNumber}</p>}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">First Name</span>
          <input
            className={inputClass("firstName")}
            value={form.firstName}
            onChange={(e) => setField("firstName", e.target.value)}
          />
          {fieldErrors.firstName && <p className="text-red-600 text-xs mt-1">{fieldErrors.firstName}</p>}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Last Name</span>
          <input
            className={inputClass("lastName")}
            value={form.lastName}
            onChange={(e) => setField("lastName", e.target.value)}
          />
          {fieldErrors.lastName && <p className="text-red-600 text-xs mt-1">{fieldErrors.lastName}</p>}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Telephone</span>
          <input
            className={inputClass("telephone")}
            value={form.telephone}
            onChange={(e) => setField("telephone", e.target.value)}
            placeholder="e.g. 0788123456"
          />
          {fieldErrors.telephone && <p className="text-red-600 text-xs mt-1">{fieldErrors.telephone}</p>}
        </label>
        <label className="block text-sm md:col-span-2">
          <span className="font-medium text-ink">Address</span>
          <input
            className={inputClass("address")}
            value={form.address}
            onChange={(e) => setField("address", e.target.value)}
          />
          {fieldErrors.address && <p className="text-red-600 text-xs mt-1">{fieldErrors.address}</p>}
        </label>
        <div className="md:col-span-2 flex gap-3 items-center">
          <button type="submit" disabled={loading} className="rounded-lg bg-accent text-accent-text px-5 py-2 font-semibold">{loading ? "Saving..." : "Add Customer"}</button>
          {message && <span className="text-sm text-green-600">{message}</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
      <div className="bg-card rounded-xl border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left">
            <tr>
              <th className="px-4 py-3">Customer Number</th>
              <th className="px-4 py-3">First Name</th>
              <th className="px-4 py-3">Last Name</th>
              <th className="px-4 py-3">Telephone</th>
              <th className="px-4 py-3">Address</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.customer_number} className="border-t border-line">
                <td className="px-4 py-3">{row.customer_number}</td>
                <td className="px-4 py-3">{row.first_name}</td>
                <td className="px-4 py-3">{row.last_name}</td>
                <td className="px-4 py-3">{row.telephone}</td>
                <td className="px-4 py-3">{String(row.address ?? "").slice(0, 40)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
