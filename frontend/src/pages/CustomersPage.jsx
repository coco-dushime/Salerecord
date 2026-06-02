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
  `mt-2 w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    fieldErrors[key] ? "border-red-500" : "border-gray-300"
  }`;

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 p-6">
    <div className="max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-800">
          Customer Management
        </h2>
        <p className="text-gray-500 mt-2">
          Add and manage customer records
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={submit}
        className="bg-white rounded-3xl shadow-xl p-8 grid gap-5 md:grid-cols-2"
      >
        <label className="block">
          <span className="font-semibold text-gray-700">
            Customer Number
          </span>
          <input
            className={inputClass("customerNumber")}
            value={form.customerNumber}
            onChange={(e) => setField("customerNumber", e.target.value)}
          />
          {fieldErrors.customerNumber && (
            <p className="text-red-600 text-sm mt-1">
              {fieldErrors.customerNumber}
            </p>
          )}
        </label>

        <label className="block">
          <span className="font-semibold text-gray-700">
            First Name
          </span>
          <input
            className={inputClass("firstName")}
            value={form.firstName}
            onChange={(e) => setField("firstName", e.target.value)}
          />
          {fieldErrors.firstName && (
            <p className="text-red-600 text-sm mt-1">
              {fieldErrors.firstName}
            </p>
          )}
        </label>

        <label className="block">
          <span className="font-semibold text-gray-700">
            Last Name
          </span>
          <input
            className={inputClass("lastName")}
            value={form.lastName}
            onChange={(e) => setField("lastName", e.target.value)}
          />
          {fieldErrors.lastName && (
            <p className="text-red-600 text-sm mt-1">
              {fieldErrors.lastName}
            </p>
          )}
        </label>

        <label className="block">
          <span className="font-semibold text-gray-700">
            Telephone
          </span>
          <input
            className={inputClass("telephone")}
            value={form.telephone}
            onChange={(e) => setField("telephone", e.target.value)}
            placeholder="0788123456"
          />
          {fieldErrors.telephone && (
            <p className="text-red-600 text-sm mt-1">
              {fieldErrors.telephone}
            </p>
          )}
        </label>

        <label className="block md:col-span-2">
          <span className="font-semibold text-gray-700">
            Address
          </span>
          <input
            className={inputClass("address")}
            value={form.address}
            onChange={(e) => setField("address", e.target.value)}
          />
          {fieldErrors.address && (
            <p className="text-red-600 text-sm mt-1">
              {fieldErrors.address}
            </p>
          )}
        </label>

        <div className="md:col-span-2 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition duration-300 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Add Customer"}
          </button>

          {message && (
            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm">
              {message}
            </span>
          )}

          {error && (
            <span className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm">
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
              <th className="px-6 py-4 text-left">Customer Number</th>
              <th className="px-6 py-4 text-left">First Name</th>
              <th className="px-6 py-4 text-left">Last Name</th>
              <th className="px-6 py-4 text-left">Telephone</th>
              <th className="px-6 py-4 text-left">Address</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={row.customer_number}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4">{row.customer_number}</td>
                <td className="px-6 py-4">{row.first_name}</td>
                <td className="px-6 py-4">{row.last_name}</td>
                <td className="px-6 py-4">{row.telephone}</td>
                <td className="px-6 py-4">{row.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  </div>
);
}
