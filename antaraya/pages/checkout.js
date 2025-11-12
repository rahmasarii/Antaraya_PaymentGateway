// pages/checkout.js
import { useEffect, useState } from "react";
import axios from "axios";

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    courier: "Toko (Gratis)",
    address: "",
    addressDesc: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ambil data produk dari localStorage
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  }, []);

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePay = async () => {
    if (!form.firstName || !form.lastName || !form.phone || !form.address) {
      alert("Mohon isi semua data yang wajib diisi");
      return;
    }

    setLoading(true);

    try {
      // kirim ke backend untuk buat transaksi
      const res = await axios.post("/api/create-transaction", {
        cart,
        customer: form,
      });

      const { token } = res.data;

      // panggil Midtrans Snap popup
      window.snap.pay(token, {
        onSuccess: function (result) {
          alert("Pembayaran berhasil!");
          console.log(result);
        },
        onPending: function (result) {
          alert("Menunggu pembayaran...");
          console.log(result);
        },
        onError: function (result) {
          alert("Terjadi kesalahan pembayaran");
          console.log(result);
        },
        onClose: function () {
          alert("Kamu menutup popup tanpa menyelesaikan pembayaran");
        },
      });
} catch (err) {
  console.error("Error creating transaction:", err);

  // Tampilkan pesan error dari server kalau ada
  if (err.response) {
    alert(`Gagal membuat transaksi: ${err.response.data?.message || "Server error"}`);
    console.error("Response:", err.response.data);
  } else if (err.request) {
    alert("Gagal membuat transaksi: Tidak ada respon dari server");
  } else {
    alert("Gagal membuat transaksi: " + err.message);
  }
}


    setLoading(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧾 Checkout</h1>

      {/* Daftar produk */}
      {cart.length === 0 ? (
        <p>Keranjang masih kosong.</p>
      ) : (
        <table className="w-full border mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-1">Nama</th>
              <th className="border px-3 py-1">Harga</th>
              <th className="border px-3 py-1">Warna</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, i) => (
              <tr key={i}>
                <td className="border px-3 py-1">{item.name}</td>
                <td className="border px-3 py-1">Rp{item.price.toLocaleString()}</td>
                <td className="border px-3 py-1">{item.color || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="font-semibold text-lg mb-2">Total: Rp{totalPrice.toLocaleString()}</h2>

      {/* Form Data Pengguna */}
      <div className="space-y-3">
        <input
          name="firstName"
          placeholder="First Name *"
          value={form.firstName}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
        <input
          name="lastName"
          placeholder="Last Name *"
          value={form.lastName}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
        <input
          name="phone"
          placeholder="Nomor HP *"
          value={form.phone}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />

        <select
          name="courier"
          value={form.courier}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        >
          <option value="Toko (Gratis)">Kurir Instan Toko (Gratis)</option>
          <option value="SiCepat">SiCepat</option>
          <option value="JNE">JNE</option>
          <option value="JNT">JNT</option>
          <option value="Gojek Sameday">Gojek Sameday</option>
          <option value="Gojek Instant">Gojek Instant</option>
          <option value="Grab Sameday">Grab Sameday</option>
          <option value="Grab Instant">Grab Instant</option>
        </select>

        <textarea
          name="address"
          placeholder="Alamat Lengkap *"
          value={form.address}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        ></textarea>

        <textarea
          name="addressDesc"
          placeholder="Deskripsi Rumah/Kantor (opsional)"
          value={form.addressDesc}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        ></textarea>
      </div>

      <button
        onClick={handlePay}
        disabled={loading || cart.length === 0}
        className={`mt-5 w-full py-3 rounded text-white ${
          loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Memproses..." : "💳 Bayar Sekarang"}
      </button>
    </div>
  );
}
