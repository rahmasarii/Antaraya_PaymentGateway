// pages/payment.js
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function Payment() {
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
  const router = useRouter();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (storedCart.length === 0) {
      alert("Keranjang kosong, silakan tambahkan produk dulu!");
      router.push("/checkout");
      return;
    }
    setCart(storedCart);
  }, []);

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePay = async () => {
    if (!form.firstName || !form.lastName || !form.phone || !form.address) {
      alert("Mohon isi semua data yang wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/create-transaction", {
        cart,
        customer: form,
      });

      const { token } = res.data;
                localStorage.removeItem("cart"); // hapus cart setelah bayar

      window.snap.pay(token, {
        onSuccess: function (result) {
          alert("Pembayaran berhasil!");
          console.log(result);
          // localStorage.removeItem("cart"); // hapus cart setelah bayar
          router.push("/checkout");
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
      if (err.response) {
        alert(`Gagal membuat transaksi: ${err.response.data?.message || "Server error"}`);
      } else if (err.request) {
        alert("Gagal membuat transaksi: Tidak ada respon dari server");
      } else {
        alert("Gagal membuat transaksi: " + err.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">💳 Pembayaran</h1>

      {/* 🧾 Order Summary */}
      <div className="border rounded-lg shadow-sm mb-6 overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 font-semibold text-lg">
          🧾 Ringkasan Pesanan
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-3 py-2 text-left">Produk</th>
              <th className="px-3 py-2">Jumlah</th>
              <th className="px-3 py-2">Harga</th>
              <th className="px-3 py-2">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, i) => (
              <tr key={i} className="border-b">
                <td className="px-3 py-2">{item.name}</td>
                <td className="px-3 py-2 text-center">{item.quantity || 1}</td>
                <td className="px-3 py-2 text-right">
                  Rp{item.price.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right">
                  Rp{(item.price * (item.quantity || 1)).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-semibold">
              <td colSpan="3" className="px-3 py-2 text-right">
                Total:
              </td>
              <td className="px-3 py-2 text-right text-green-700">
                Rp{totalPrice.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 📋 Form Data Pengguna */}
      <div className="border rounded-lg shadow-sm p-4">
        <h2 className="font-semibold text-lg mb-3">📦 Data Pengiriman</h2>

        <div className="space-y-3">
          {["firstName", "lastName", "phone", "address", "addressDesc"].map((name, i) => (
            <input
              key={i}
              name={name}
              placeholder={
                name === "firstName"
                  ? "Nama Depan *"
                  : name === "lastName"
                  ? "Nama Belakang *"
                  : name === "phone"
                  ? "Nomor HP *"
                  : name === "address"
                  ? "Alamat Lengkap *"
                  : "Deskripsi Alamat (opsional)"
              }
              value={form[name]}
              onChange={handleChange}
              className="border p-2 w-full rounded"
              required={["firstName", "lastName", "phone", "address"].includes(name)}
            />
          ))}

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
          </select>
        </div>
      </div>

      <button
        onClick={handlePay}
        disabled={loading}
        className={`mt-5 w-full py-3 rounded text-white ${
          loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Memproses..." : "Bayar Sekarang 💸"}
      </button>
    </div>
  );
}
