import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subscribe: false,
    message: "",
  });

  const [loading, setLoading] = useState(false); // ✅ FIXED

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      alert("Your message has been sent! We'll get back to you soon 😊");

      // Reset form state
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        subscribe: false,
        message: "",
      });

      e.target.reset();
    } else {
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="form-wrapper">
      <h1>Hubungi Kami</h1>
      <form onSubmit={handleSubmit}>
        
        <div>
          <label>First Name</label>
          <input
            type="text"
            required
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
        </div>

        <div>
          <label>Last Name</label>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={form.subscribe}
              onChange={(e) =>
                setForm({ ...form, subscribe: e.target.checked })
              }
            />
            Sign up for news
          </label>
        </div>

        <div>
          <label>Message</label>
          <textarea
            required
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          ></textarea>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "SUBMIT"}
        </button>
      </form>
    </div>
  );
}
