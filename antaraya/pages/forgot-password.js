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
  const [msgType, setMsgType] = useState(""); // "success" | "error" | "info"
  const [loading, setLoading] = useState(false);

  // STEP 1 → Request OTP
  const sendOTP = async (e) => {
    e.preventDefault();
    setMsg("");
    setMsgType("");
    setLoading(true);

    try {
      const res = await axios.post("/api/auth/forgot", {
        step: "request",
        email,
      });

      if (res.status === 200) {
        setMsgType("success");
        setMsg("OTP telah dikirim ke email Anda.");
        setStep(2);
      }
    } catch (err) {
      setMsgType("error");
      setMsg(err.response?.data?.error || "Gagal mengirim OTP");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 → Verify OTP
  const verifyOTP = async (e) => {
    e.preventDefault();
    setMsg("");
    setMsgType("");
    setLoading(true);

    try {
      const res = await axios.post("/api/auth/forgot", {
        step: "verify",
        email,
        otp,
      });

      if (res.status === 200) {
        setMsgType("success");
        setMsg("OTP valid. Silakan buat password baru.");
        setStep(3);
      }
    } catch (err) {
      setMsgType("error");
      setMsg(err.response?.data?.error || "OTP tidak valid");
    } finally {
      setLoading(false);
    }
  };

  // STEP 3 → Reset Password
  const resetPassword = async (e) => {
    e.preventDefault();
    setMsg("");
    setMsgType("");

    if (newPass !== confirmNewPass) {
      setMsgType("error");
      setMsg("Password baru dan konfirmasi tidak sama!");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/api/auth/forgot", {
        step: "reset",
        email,
        newPass,
        confirmNewPass,
      });

      if (res.status === 200) {
        setMsgType("success");
        setMsg("Password berhasil diperbarui. Silakan login kembali.");
      }
    } catch (err) {
      setMsgType("error");
      setMsg(err.response?.data?.error || "Gagal memperbarui password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Brand / Logo */}
        <div className="auth-brand">
          <h1>ANTARAYA</h1>
          <p>Reset Password Admin</p>
        </div>

        {/* Step Indicator */}
        <div className="step-indicator">
          <div
            className={`step ${
              step === 1 ? "active" : step > 1 ? "completed" : ""
            }`}
          >
            <div className="step-number">1</div>
            <span className="step-label">Email</span>
          </div>

          <div className="step-divider" />

          <div
            className={`step ${
              step === 2 ? "active" : step > 2 ? "completed" : ""
            }`}
          >
            <div className="step-number">2</div>
            <span className="step-label">Verifikasi OTP</span>
          </div>

          <div className="step-divider" />

          <div className={`step ${step === 3 ? "active" : ""}`}>
            <div className="step-number">3</div>
            <span className="step-label">Password Baru</span>
          </div>
        </div>

        {/* STEP 1: kirim OTP ke email */}
        {step === 1 && (
          <form onSubmit={sendOTP} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Admin</label>
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className={`btn-submit ${loading ? "btn-loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Mengirim OTP..." : "Kirim OTP"}
            </button>
          </form>
        )}

        {/* STEP 2: verifikasi OTP */}
        {step === 2 && (
          <form onSubmit={verifyOTP} className="auth-form">
            <div className="form-group">
              <label className="form-label">Kode OTP</label>
              <input
                type="text"
                placeholder="Masukkan kode OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className={`btn-submit ${loading ? "btn-loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Memverifikasi..." : "Verifikasi OTP"}
            </button>

            <button
              type="button"
              className="btn-link"
              onClick={() => {
                setStep(1);
                setMsg("");
                setMsgType("");
              }}
              disabled={loading}
            >
              ← Ubah Email
            </button>
          </form>
        )}

        {/* STEP 3: set password baru */}
        {step === 3 && (
          <form onSubmit={resetPassword} className="auth-form">
            <div className="form-group">
              <label className="form-label">Password Baru</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Konfirmasi Password Baru</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmNewPass}
                onChange={(e) => setConfirmNewPass(e.target.value)}
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className={`btn-submit ${loading ? "btn-loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Perbarui Password"}
            </button>

            <button
              type="button"
              className="btn-link"
              onClick={() => {
                setStep(2);
                setMsg("");
                setMsgType("");
              }}
              disabled={loading}
            >
              ← Kembali ke Verifikasi OTP
            </button>
          </form>
        )}

        {/* Pesan */}
        {msg && (
          <div className={`auth-message ${msgType || "info"}`}>{msg}</div>
        )}

        {/* Link kembali ke login */}
        <div className="back-link">
          <a href="/login">← Kembali ke halaman login</a>
        </div>
      </div>
    </div>
  );
}
