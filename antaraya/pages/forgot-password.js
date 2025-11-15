// pages/forgot-password.js
import { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmNewPass, setConfirmNewPass] = useState("");
  const [msg, setMsg] = useState("");

  // STEP 1 → Request OTP
  const sendOTP = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const res = await axios.post("/api/auth/forgot", {
        step: "request",
        email,
      });

      if (res.status === 200) {
        setMsg("OTP sent to your email.");
        setStep(2);
      }
    } catch (err) {
      setMsg(err.response?.data?.error || "Failed to send OTP");
    }
  };

  // STEP 2 → Verify OTP
  const verifyOTP = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const res = await axios.post("/api/auth/forgot", {
        step: "verify",
        email,
        otp,
      });

      if (res.status === 200) {
        setMsg("OTP verified. Enter your new password.");
        setStep(3);
      }
    } catch (err) {
      setMsg(err.response?.data?.error || "Invalid OTP");
    }
  };

  // STEP 3 → Reset Password
  const resetPassword = async (e) => {
    e.preventDefault();
    setMsg("");

    if (newPass !== confirmNewPass) {
      setMsg("Passwords do not match!");
      return;
    }

    try {
      const res = await axios.post("/api/auth/forgot", {
        step: "reset",
        email,
        newPass,
        confirmNewPass,     // ✅ FIXED: send confirm password!
      });

      if (res.status === 200) {
        setMsg("Password updated successfully!");
      }
    } catch (err) {
      setMsg(err.response?.data?.error || "Failed to update password");
    }
  };

  return (
    <div style={container}>
      <h1>Forgot Password</h1>

      {step === 1 && (
        <form onSubmit={sendOTP} style={formStyle}>
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={input}
            required
          />

          <button style={button}>Send OTP</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={verifyOTP} style={formStyle}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={input}
            required
          />

          <button style={button}>Verify OTP</button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={resetPassword} style={formStyle}>
          <input
            type="password"
            placeholder="New Password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            style={input}
            required
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmNewPass}
            onChange={(e) => setConfirmNewPass(e.target.value)}
            style={input}
            required
          />

          <button style={button}>Update Password</button>
        </form>
      )}

      <p style={{ marginTop: 10, color: "red" }}>{msg}</p>
    </div>
  );
}

// styles
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
