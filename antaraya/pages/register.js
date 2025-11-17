import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState(""); // success, error, info
  const [loading, setLoading] = useState(false);

  // STEP 1 – Validate password and send OTP
  const requestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    // Local check first
    if (form.password !== form.confirmPassword) {
      setMsgType("error");
      setMsg("Password tidak cocok!");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("/api/auth/register", {
        step: "request",
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      if (res.status === 200) {
        setMsgType("success");
        setMsg("OTP telah dikirim ke email owner");
        setStep(2);
      }
    } catch (err) {
      setMsgType("error");
      setMsg(err.response?.data?.error || "Gagal mengirim OTP");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 – Verify OTP
  const verifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      await axios.post("/api/auth/register", {
        step: "verify",
        email: form.email,
        otp: form.otp,
      });

      setMsgType("success");
      setMsg("Admin berhasil didaftarkan!");
      
      // Redirect to login after success
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setMsgType("error");
      setMsg(err.response?.data?.error || "OTP tidak valid");
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Brand/Logo */}
        <div className="auth-brand">
          <h1>ANTARAYA</h1>
          <p>Pendaftaran Admin</p>
        </div>

        {/* Step Indicator */}
        <div className="step-indicator">
          <div className={`step ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <span className="step-label">Data Admin</span>
          </div>
          <div className="step-divider"></div>
          <div className={`step ${step === 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span className="step-label">Verifikasi OTP</span>
          </div>
        </div>

        {/* STEP 1: Registration Form */}
        {step === 1 && (
          <form onSubmit={requestOTP} className="auth-form">
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Admin</label>
              <input
                type="email"
                placeholder="admin@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Konfirmasi Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className={`btn-submit ${loading ? 'btn-loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Mengirim OTP...' : 'Kirim OTP'}
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={verifyOTP} className="auth-form">
            <div className="form-group">
              <label className="form-label">Kode OTP</label>
              <input
                type="text"
                placeholder="Masukkan 6 digit OTP"
                value={form.otp}
                onChange={(e) => setForm({ ...form, otp: e.target.value })}
                className="form-input"
                required
                disabled={loading}
                maxLength={6}
                style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.5rem' }}
              />
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                OTP telah dikirim ke email owner
              </p>
            </div>

            <button 
              type="submit" 
              className={`btn-submit ${loading ? 'btn-loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
            </button>

            <button 
              type="button"
              className="btn-link"
              onClick={() => {
                setStep(1);
                setMsg("");
                setForm({ ...form, otp: "" });
              }}
              disabled={loading}
            >
              ← Kembali ke Form Registrasi
            </button>
          </form>
        )}

        {/* Message */}
        {msg && (
          <div className={`auth-message ${msgType}`}>
            {msg}
          </div>
        )}

        {/* Back to Login */}
        {step === 1 && (
          <div className="back-link">
            <a href="/login">Sudah punya akun? Login di sini</a>
          </div>
        )}
      </div>
    </div>
  );
}