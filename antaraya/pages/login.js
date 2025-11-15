import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("/api/auth/login", form);

      setMsg("Login success! Redirecting...");
      setTimeout(() => router.push("/admin"), 1200); // ⬅ redirect updated
    } catch (err) {
      setMsg(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div style={container}>
      <h1>Admin Login</h1>

      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          type="email"
          placeholder="Email"
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

        <button style={button}>Login</button>
      </form>

      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        <button style={linkBtn} onClick={() => router.push("/register")}>
          Register Admin
        </button>

        <button style={linkBtn} onClick={() => router.push("/forgot-password")}>
          Forgot Password?
        </button>
      </div>

      <p style={{ marginTop: 20 }}>{msg}</p>
    </div>
  );
}

// ===== Styles =====
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

const linkBtn = {
  padding: "10px",
  background: "#eaeaea",
  borderRadius: "6px",
  cursor: "pointer",
};
