import { query } from "../config/db.js";

export const getReports = async (req, res) => {
  try {
    const period = req.query.period || "daily";
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const month = req.query.month || date.slice(0, 7);

    let sales;
    if (period === "daily") {
      sales = await query("SELECT * FROM sales WHERE DATE(sales_date) = ?", [date]);
    } else if (period === "weekly") {
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required for weekly reports." });
      }
      sales = await query("SELECT * FROM sales WHERE DATE(sales_date) BETWEEN ? AND ?", [startDate, endDate]);
    } else {
      sales = await query("SELECT * FROM sales WHERE DATE_FORMAT(sales_date, '%Y-%m') = ?", [month]);
    }

    const customers = await query("SELECT * FROM customers");
    const products = await query("SELECT * FROM products");
    return res.json({ period, reports: { customers, products, sales } });
  } catch {
    return res.status(500).json({ message: "Failed to generate reports." });
  }
};
