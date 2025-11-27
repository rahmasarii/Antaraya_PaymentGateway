// pages/payment.js
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Navbar from '../components/Navbar';

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
  const [cartItemCount, setCartItemCount] = useState(0);
  const router = useRouter();

  // Hitung total item di cart
  const updateCartCount = (cartData) => {
    const totalItems = cartData.reduce(
      (sum, item) => sum + (item.qty || item.quantity || 1),
      0
    );
    setCartItemCount(totalItems);
  };

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (storedCart.length === 0) {
      alert("Keranjang kosong, silakan tambahkan produk dulu!");
      router.push("/checkout");
      return;
    }
    setCart(storedCart);
    updateCartCount(storedCart);
  }, [router]);

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * (item.qty || item.quantity || 1),
    0
  );

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
      // hapus cart setelah buat transaksi
      localStorage.removeItem("cart");
      setCart([]);
      setCartItemCount(0);

      window.snap.pay(token, {
        onSuccess: function (result) {
          alert("Pembayaran berhasil!");
          console.log(result);
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
        alert(
          `Gagal membuat transaksi: ${
            err.response.data?.message || "Server error"
          }`
        );
      } else if (err.request) {
        alert("Gagal membuat transaksi: Tidak ada respon dari server");
      } else {
        alert("Gagal membuat transaksi: " + err.message);
      }
    }
    setLoading(false);
  };


  return (
    <div className="main-container">
      <Navbar active="shop" cartItemCount={cartItemCount} />


      <button
        onClick={() => window.open("https://wa.me/6281296135571", "_blank")}
        className="whatsapp-floating-btn"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="WhatsApp"
        />
      </button>

      {/* Payment Section */}
      <section className="payment-section">
        <div className="container">
          <div className="payment-header">
            <div>
              <h1 className="payment-title">Pembayaran</h1>
              <p className="payment-subtitle">
                Cek kembali pesanan dan isi data pengiriman sebelum melakukan
                pembayaran.
              </p>
            </div>
          </div>

          <div className="payment-content">
            {/* Ringkasan Pesanan */}
            <div className="payment-card">
              <h2 className="payment-card-title">Ringkasan Pesanan</h2>

              <div className="payment-items-wrapper">
                {cart.map((item, i) => (
                  <div key={i} className="payment-item-row">
                    <div className="payment-item-main">
                      <div className="payment-item-name">{item.name}</div>
                      {item.color && (
                        <div className="payment-item-meta">
                          <span>Warna: {item.color}</span>
                        </div>
                      )}
                      <div className="payment-item-meta">
                        <span>
                          Jumlah: {item.qty || item.quantity || 1} x Rp
                          {item.price.toLocaleString("id-ID", {
                            minimumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="payment-item-subtotal">
                      Rp
                      {(
                        item.price * (item.qty || item.quantity || 1)
                      ).toLocaleString("id-ID", {
                        minimumFractionDigits: 0,
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="payment-summary-footer">
                <div className="payment-summary-row">
                  <span>Total</span>
                  <span className="payment-summary-total">
                    Rp
                    {totalPrice.toLocaleString("id-ID", {
                      minimumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <p className="payment-summary-note">
                  Harga belum termasuk ongkos kirim (kecuali jika memilih kurir
                  instan toko).
                </p>
              </div>
            </div>

            {/* Data Pengiriman */}
            <div className="payment-card">
              <h2 className="payment-card-title">Data Pengiriman</h2>

              <div className="payment-form">
                <div className="payment-form-row">
                  <div className="payment-form-group">
                    <label>Nama Depan *</label>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="Nama depan"
                    />
                  </div>
                  <div className="payment-form-group">
                    <label>Nama Belakang *</label>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Nama belakang"
                    />
                  </div>
                </div>

                <div className="payment-form-group">
                  <label>Nomor HP *</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Contoh: 0812xxxxxxx"
                  />
                </div>

                <div className="payment-form-group">
                  <label>Alamat Lengkap *</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota/kabupaten, provinsi"
                    rows={3}
                  />
                </div>

                <div className="payment-form-group">
                  <label>Deskripsi Alamat (opsional)</label>
                  <textarea
                    name="addressDesc"
                    value={form.addressDesc}
                    onChange={handleChange}
                    placeholder="Patokan rumah, gerbang, atau catatan tambahan untuk kurir"
                    rows={2}
                  />
                </div>

                <div className="payment-form-group">
                  <label>Metode Pengiriman</label>
                  <select
                    name="courier"
                    value={form.courier}
                    onChange={handleChange}
                  >
                    <option value="Toko (Gratis)">
                      Kurir Instan Toko (Gratis)
                    </option>
                    <option value="SiCepat">SiCepat</option>
                    <option value="JNE">JNE</option>
                    <option value="JNT">JNT</option>
                  </select>
                </div>

                <div className="payment-info-box">
                  <p>
                    Setelah menekan tombol <strong>Bayar Sekarang</strong>, kamu
                    akan diarahkan ke halaman pembayaran Midtrans untuk memilih
                    metode pembayaran (VA, e-wallet, kartu, dll).
                  </p>
                </div>
              </div>

              <div className="payment-actions">
                <button
                  onClick={handlePay}
                  disabled={loading}
                  className={`btn-pay ${loading ? "btn-pay-loading" : ""}`}
                >
                  {loading ? "Memproses..." : "Bayar Sekarang "}
                </button>

                <div className="security-badges">
                  <div className="badge-item">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M10 2L3 6v5c0 4.5 3 8 7 9 4-1 7-4.5 7-9V6l-7-4z"
                        stroke="#4ade80"
                        strokeWidth="2"
                        fill="none"
                      />
                      <path
                        d="M7 10l2 2 4-4"
                        stroke="#4ade80"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Pembayaran Aman dengan Midtrans</span>
                  </div>
                  <div className="badge-item">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M3 8h14M3 12h14M7 4h6a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"
                        stroke="#4ade80"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>Berbagai metode pembayaran tersedia</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
