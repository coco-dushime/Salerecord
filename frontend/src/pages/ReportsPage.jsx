import { useState } from "react";
import api from "../api/client.js";

const sections = [
  {
    key: "customers",
    label: "Customers",
    cols: ["Number", "First Name", "Last Name", "Phone"],
    keys: ["customer_number", "first_name", "last_name", "telephone"],
  },
  {
    key: "products",
    label: "Products",
    cols: ["Code", "Name", "Qty", "Price"],
    keys: ["product_code", "product_name", "quantity_sold", "unit_price"],
  },
  {
    key: "sales",
    label: "Sales",
    cols: ["Invoice", "Date", "Amount", "Method", "Customer", "Product"],
    keys: ["invoice_number", "sales_date", "total_amount_paid", "payment_method", "customer_number", "product_code"],
  },
];

const today = () => new Date().toISOString().slice(0, 10);
const thisMonth = () => today().slice(0, 7);

export default function ReportsPage() {
  const [period, setPeriod] = useState("daily");
  const [date, setDate] = useState(today());
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(today());
  const [month, setMonth] = useState(thisMonth());
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const params = { period };
      if (period === "daily") params.date = date;
      if (period === "weekly") {
        if (!startDate || !endDate) {
          setError("Select start date and end date for the weekly report.");
          setLoading(false);
          return;
        }
        if (startDate > endDate) {
          setError("Start date must be before or equal to end date.");
          setLoading(false);
          return;
        }
        params.startDate = startDate;
        params.endDate = endDate;
      }
      if (period === "monthly") params.month = month;

      const { data: res } = await api.get("/reports", { params });
      setData(res.reports);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

return (
  <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 p-6">
    <div className="max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-800">
          Sales Reports
        </h2>
        <p className="text-gray-500 mt-2">
          Daily, Weekly and Monthly Customer, Product & Sales Reports
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">

        <label className="block">
          <span className="font-semibold text-gray-700">
            Report Type
          </span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="mt-2 w-full md:w-72 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="daily">Daily Report</option>
            <option value="weekly">Weekly Report</option>
            <option value="monthly">Monthly Report</option>
          </select>
        </label>

        {period === "daily" && (
          <label className="block">
            <span className="font-semibold text-gray-700">
              Select Date
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-2 w-full md:w-72 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </label>
        )}

        {period === "weekly" && (
          <div className="grid gap-5 md:grid-cols-2">
            <label>
              <span className="font-semibold text-gray-700">
                Start Date
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </label>

            <label>
              <span className="font-semibold text-gray-700">
                End Date
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </label>
          </div>
        )}

        {period === "monthly" && (
          <label className="block">
            <span className="font-semibold text-gray-700">
              Select Month
            </span>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="mt-2 w-full md:w-72 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </label>
        )}

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition duration-300 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Generate Report"}
        </button>

      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Reports */}
      {data && (
        <div className="grid gap-8">
          {sections.map((s) => (
            <div
              key={s.key}
              className="bg-white rounded-3xl shadow-xl overflow-hidden"
            >
              <div className="bg-blue-600 text-white px-6 py-4 font-semibold text-lg">
                {s.label} ({(data[s.key] || []).length})
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      {s.cols.map((c) => (
                        <th
                          key={c}
                          className="px-6 py-4 text-left font-semibold text-gray-700"
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {(data[s.key] || []).length === 0 ? (
                      <tr>
                        <td
                          colSpan={s.cols.length}
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          No records found for this period.
                        </td>
                      </tr>
                    ) : (
                      (data[s.key] || []).map((row, i) => (
                        <tr
                          key={i}
                          className="border-b hover:bg-gray-50 transition"
                        >
                          {s.keys.map((k) => (
                            <td
                              key={k}
                              className="px-6 py-4"
                            >
                              {String(row[k] ?? "").slice(0, 40)}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  </div>
);
}
