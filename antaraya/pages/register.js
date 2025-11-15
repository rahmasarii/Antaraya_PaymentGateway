// pages/register.js
import { useState } from "react";
import axios from "axios";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const [msg, setMsg] = useState("");

  // STEP 1 — Validate password and send OTP
const requestOTP = async (e) => {
  e.preventDefault();
  setMsg("");

  // Local check first
  if (form.password !== form.confirmPassword) {
    setMsg("Passwords do not match!");
    return;
  }

  try {
    const res = await axios.post("/api/auth/register", {
      step: "request",
      name: form.name,
      email: form.email,
      password: form.password,
        confirmPassword: form.confirmPassword,  // <-- ADD THIS

    });

    // === MOVE TO OTP ONLY AFTER BACKEND SUCCEEDS ===
    if (res.status === 200) {
      setMsg("OTP sent to owner email");
      setStep(2);
    }
  } catch (err) {
    setMsg(err.response?.data?.error || "Failed to send OTP");
        setStep(1); // stay in step 1

  }
};

  // STEP 2 — Verify OTP
  const verifyOTP = async (e) => {
    e.preventDefault();

    try {
      await axios.post("/api/auth/register", {
        step: "verify",
        email: form.email,
        otp: form.otp,
      });

      setMsg("Admin registered successfully!");
    } catch (err) {
      setMsg(err.response?.data?.error || "Invalid OTP");
    }
  };

  return (
    <div style={container}>
      <h1>Admin Registration</h1>

      {step === 1 ? (
        <form onSubmit={requestOTP} style={formStyle}>
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={input}
            required
          />

          <input
            type="email"
            placeholder="Admin Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={input}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={input}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            style={input}
            required
          />

          <button style={button}>Request OTP</button>
        </form>
      ) : (
        <form onSubmit={verifyOTP} style={formStyle}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={form.otp}
            onChange={(e) => setForm({ ...form, otp: e.target.value })}
            style={input}
            required
          />

          <button style={button}>Verify OTP</button>
        </form>
      )}

      <p style={{ marginTop: 10, color: "red" }}>{msg}</p>
    </div>
  );
}

// ======================
// INLINE STYLES
// ======================

const container = {
  maxWidth: "400px",
  margin: "60px auto",
  padding: "30px",
  borderRadius: "10px",
  border: "1px solid #ddd",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const input = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const button = {
  padding: "12px",
  background: "#0070f3",
  color: "white",
  borderRadius: "8px",
  cursor: "pointer",
};
