import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState(""); // success, error, info
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      await axios.post("/api/auth/login", form);

      setMsgType("success");
      setMsg("Login berhasil! Mengalihkan...");
      setTimeout(() => router.push("/admin"), 1200);
    } catch (err) {
      setMsgType("error");
      setMsg(err.response?.data?.error || "Login gagal. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Brand/Logo */}
        <div className="auth-brand">
          <h1>ANTARAYA</h1>
          <p>Admin Login</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
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

          <button 
            type="submit" 
            className={`btn-submit ${loading ? 'btn-loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Message */}
        {msg && (
          <div className={`auth-message ${msgType}`}>
            {msg}
          </div>
        )}

        {/* Secondary Actions */}
        <div className="auth-links">
          <button 
            className="btn-link" 
            onClick={() => router.push("/register")}
            disabled={loading}
          >
            Daftar Admin Baru
          </button>

          <button 
            className="btn-link" 
            onClick={() => router.push("/forgot-password")}
            disabled={loading}
          >
            Lupa Password?
          </button>
        </div>

        {/* Back to Home */}
        <div className="back-link">
          <a href="/">← Kembali ke Beranda</a>
        </div>
      </div>
    </div>
  );
}