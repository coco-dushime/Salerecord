import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/db.js";

const signToken = (user) =>
  jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET || "exam_secret",
    { expiresIn: "8h" }
  );

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email and password are required." });
    }
    const emailNorm = normalizeEmail(email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    const existingUser = await query("SELECT id FROM users WHERE username = ?", [username.trim()]);
    if (existingUser.length) {
      return res.status(409).json({ message: "Username already exists." });
    }
    const existingEmail = await query("SELECT id FROM users WHERE email = ?", [emailNorm]);
    if (existingEmail.length) {
      return res.status(409).json({ message: "Email already registered." });
    }
    const hash = await bcrypt.hash(password, 10);
    await query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [
      username.trim(),
      emailNorm,
      hash,
    ]);
    return res.status(201).json({ message: "Account created successfully." });
  } catch {
    return res.status(500).json({ message: "Server error during registration." });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
    const rows = await query("SELECT * FROM users WHERE username = ?", [username.trim()]);
    if (!rows.length) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    return res.json({
      message: "Login successful.",
      token: signToken(user),
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch {
    return res.status(500).json({ message: "Server error during login." });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }
    if (!newPassword) {
      return res.status(400).json({ success: false, message: "New password is required." });
    }
    if (!confirmPassword) {
      return res.status(400).json({ success: false, message: "Confirm password is required." });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password must match.",
      });
    }
    const emailNorm = normalizeEmail(email);
    const rows = await query("SELECT id FROM users WHERE email = ?", [emailNorm]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await query("UPDATE users SET password = ? WHERE email = ?", [hash, emailNorm]);
    return res.json({ success: true, message: "Password reset successfully" });
  } catch {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
