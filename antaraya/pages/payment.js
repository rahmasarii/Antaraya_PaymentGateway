// pages/payment.js
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";

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

  const [proofImage, setProofImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const router = useRouter();

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

  const handleUploadProof = async (file) => {
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await axios.post("/api/upload-proof", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    setProofImage(res.data.url);
  } catch (err) {
    console.error(err);
    alert("Gagal upload bukti pembayaran");
  }
};


  const handlePay = async () => {
    if (
      !form.firstName ||
      !form.lastName ||
      !form.phone ||
      !form.address ||
      !proofImage
    ) {
      alert("Mohon isi semua data dan upload bukti pembayaran.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/manual-payment", {
        cart,
        customer: form,
        proof: proofImage,
      });

      localStorage.removeItem("cart");
      setCart([]);
      setCartItemCount(0);

      alert("Transaksi berhasil! Admin akan memeriksa pembayaran Anda.");
      router.push("/checkout");
    } catch (err) {
      console.error(err);
      alert("Gagal membuat transaksi.");
    }
    setLoading(false);
  };

  // --- Download QR function ---
  const downloadQR = () => {
    const link = document.createElement("a");
    link.href = "/qris.png";
    link.download = "qris-payment.png";
    link.click();
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

      <section className="payment-section">
        <div className="container">
          <div className="payment-header">
            <h1 className="payment-title">Pembayaran</h1>
            <p className="payment-subtitle">
              Silakan isi data di bawah dan unggah bukti pembayaran.
            </p>
          </div>

          <div className="payment-content">
            
            {/* RINGKASAN PESANAN */}
            <div className="payment-card">
              <h2 className="payment-card-title">Ringkasan Pesanan</h2>

              <div className="payment-items-wrapper">
                {cart.map((item, i) => (
                  <div key={i} className="payment-item-row">
                    <div className="payment-item-main">
                      <div className="payment-item-name">{item.name}</div>

                      {item.color && (
                        <div className="payment-item-meta">
                          Warna: {item.color}
                        </div>
                      )}

                      <div className="payment-item-meta">
                        Jumlah: {item.qty || item.quantity || 1} × Rp
                        {item.price.toLocaleString("id-ID")}
                      </div>
                    </div>

                    <div className="payment-item-subtotal">
                      Rp
                      {(
                        item.price * (item.qty || item.quantity || 1)
                      ).toLocaleString("id-ID")}
                    </div>
                  </div>
                ))}
              </div>

              <div className="payment-summary-footer">
                <div className="payment-summary-row">
                  <span>Total</span>
                  <span className="payment-summary-total">
                    Rp{totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* QRIS SECTION */}
              <div style={{ marginTop: "25px", textAlign: "center" }}>
                <h3>Silakan Scan QRIS untuk Pembayaran</h3>

                <img
                  src="/qris.png"
                  alt="QRIS"
                  style={{
                    width: "220px",
                    margin: "15px auto",
                    display: "block",
                    borderRadius: "10px",
                  }}
                />

                <button
                  onClick={downloadQR}
                  className="btn-download-qris"
                  style={{
                    marginTop: "10px",
                    background: "#4a4a4a",
                    padding: "10px 20px",
                    color: "#fff",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Download QR
                </button>
              </div>
              {/* END QRIS SECTION */}
            </div>

            {/* FORM PENGIRIMAN */}
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
                    rows={3}
                    placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota/kabupaten, provinsi"
                  />
                </div>

                <div className="payment-form-group">
                  <label>Deskripsi Alamat (opsional)</label>
                  <textarea
                    name="addressDesc"
                    value={form.addressDesc}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Patokan rumah, gerbang, atau catatan tambahan untuk kurir"
                  />
                </div>

                <div className="payment-form-group">
                  <label>Metode Pengiriman</label>
                  <select
                    name="courier"
                    value={form.courier}
                    onChange={handleChange}
                  >
                    <option value="Toko (Gratis)">Kurir Instan Toko (Gratis)</option>
                    <option value="SiCepat">SiCepat</option>
                    <option value="JNE">JNE</option>
                    <option value="JNT">JNT</option>
                  </select>
                </div>

                <div className="payment-form-group">
                  <label>Upload Bukti Pembayaran *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadProof(e.target.files[0])}
                  />

                  {proofImage && (
                    <img
                      src={proofImage}
                      style={{
                        width: "150px",
                        marginTop: "10px",
                        borderRadius: "8px",
                      }}
                    />
                  )}
                </div>

                <div className="payment-info-box">
                  <p>
                    ⚠ <strong>Pembayaran Midtrans sedang tidak aktif.</strong>
                    <br />
                    Silakan transfer manual lalu upload bukti pembayaran.
                  </p>
                </div>
              </div>

              <div className="payment-actions">
                <button
                  onClick={handlePay}
                  disabled={loading}
                  className={`btn-pay ${loading ? "btn-pay-loading" : ""}`}
                >
                  {loading ? "Memproses..." : "Kirim Bukti Pembayaran"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
