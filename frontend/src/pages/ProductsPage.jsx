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
  `mt-2 w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    fieldErrors[key] ? "border-red-500" : "border-gray-300"
  }`;

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 p-6">
    <div className="max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-800">
          Product Management
        </h2>
        <p className="text-gray-500 mt-2">
          Add and manage product records
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={submit}
        className="bg-white rounded-3xl shadow-xl p-8 grid gap-5 md:grid-cols-2"
      >
        <label className="block">
          <span className="font-semibold text-gray-700">
            Product Code
          </span>
          <input
            className={inputClass("productCode")}
            value={form.productCode}
            onChange={(e) =>
              setField("productCode", e.target.value.toUpperCase())
            }
            placeholder="PRD01"
          />
          {fieldErrors.productCode && (
            <p className="text-red-600 text-sm mt-1">
              {fieldErrors.productCode}
            </p>
          )}
        </label>

        <label className="block">
          <span className="font-semibold text-gray-700">
            Product Name
          </span>
          <input
            className={inputClass("productName")}
            value={form.productName}
            onChange={(e) =>
              setField("productName", e.target.value)
            }
          />
          {fieldErrors.productName && (
            <p className="text-red-600 text-sm mt-1">
              {fieldErrors.productName}
            </p>
          )}
        </label>

        <label className="block">
          <span className="font-semibold text-gray-700">
            Quantity Sold
          </span>
          <input
            type="number"
            min="0"
            className={inputClass("quantitySold")}
            value={form.quantitySold}
            onChange={(e) =>
              setField("quantitySold", e.target.value)
            }
          />
          {fieldErrors.quantitySold && (
            <p className="text-red-600 text-sm mt-1">
              {fieldErrors.quantitySold}
            </p>
          )}
        </label>

        <label className="block">
          <span className="font-semibold text-gray-700">
            Unit Price
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            className={inputClass("unitPrice")}
            value={form.unitPrice}
            onChange={(e) =>
              setField("unitPrice", e.target.value)
            }
          />
          {fieldErrors.unitPrice && (
            <p className="text-red-600 text-sm mt-1">
              {fieldErrors.unitPrice}
            </p>
          )}
        </label>

        <div className="md:col-span-2 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition duration-300 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Add Product"}
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

      {/* Products Table */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left">Product Code</th>
              <th className="px-6 py-4 text-left">Product Name</th>
              <th className="px-6 py-4 text-left">Quantity Sold</th>
              <th className="px-6 py-4 text-left">Unit Price</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={row.product_code}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4 font-medium">
                  {row.product_code}
                </td>
                <td className="px-6 py-4">
                  {row.product_name}
                </td>
                <td className="px-6 py-4">
                  {row.quantity_sold}
                </td>
                <td className="px-6 py-4">
                  {Number(row.unit_price).toLocaleString()} RWF
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
