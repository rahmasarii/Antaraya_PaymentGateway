import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from '../components/Navbar';


export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Hitung total item di cart
  const updateCartCount = (cartData) => {
    const totalItems = cartData.reduce((sum, item) => sum + (item.qty || 1), 0);
    setCartItemCount(totalItems);
  };

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(stored);
    updateCartCount(stored);
    setLoading(false);
  }, []);

  const handleQuantityChange = (index, delta) => {
    const updated = [...cart];
    const newQty = Math.max(1, (updated[index].qty || 1) + delta);
    updated[index].qty = newQty;
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    updateCartCount(updated);
  };

  const handleRemoveItem = (index) => {
    if (confirm("Hapus item ini dari keranjang?")) {
      const updated = cart.filter((_, i) => i !== index);
      setCart(updated);
      localStorage.setItem("cart", JSON.stringify(updated));
      updateCartCount(updated);
    }
  };

  const handleClearCart = () => {
    if (confirm("Kosongkan semua item di keranjang?")) {
      const updated = [];
      setCart(updated);
      localStorage.setItem("cart", JSON.stringify(updated));
      updateCartCount(updated);
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * (item.qty || 1),
    0
  );
  const tax = subtotal * 0.11; // PPN 11%
  const total = subtotal + tax;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="main-container">
        <Navbar active="shop" cartItemCount={cartItemCount} />


        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Memuat keranjang...</p>
        </div>
      </div>
    );
  }

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

      {/* Checkout Section */}
      <section className="checkout-section">
        <div className="container">
          <div className="checkout-header">
            <h1 className="checkout-title">Keranjang Belanja</h1>
            {cart.length > 0 && (
              <button onClick={handleClearCart} className="btn-clear-cart">
                Kosongkan Keranjang
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="empty-cart">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                />
                <path
                  d="M40 50h40M40 60h40M40 70h30"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <h3>Keranjang Belanja Kosong</h3>
              <p>Belum ada produk yang ditambahkan ke keranjang</p>
              <button
                onClick={() => router.push("/shop")}
                className="btn-shop-now"
              >
                Mulai Belanja
              </button>
            </div>
          ) : (
            <div className="checkout-content">
              {/* Cart Items */}
              <div className="cart-items-section">
                <div className="cart-items-header">
                  <h2>Item Keranjang ({cart.length})</h2>
                </div>

                <div className="cart-items-list">
                  {cart.map((item, i) => (
                    <div key={i} className="cart-item">
                      {/* Product Image */}
                      <div className="cart-item-image">
                        <img
                          src={item.displayImage || "/no-image.png"}
                          alt={item.name}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="cart-item-info">
                        <h3 className="cart-item-name">{item.name}</h3>
                        {item.color && (
                          <p className="cart-item-variant">
                            <span className="variant-label">Warna:</span>
                            <span className="variant-value">{item.color}</span>
                          </p>
                        )}
                        <p className="cart-item-price">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="cart-item-quantity">
                        <label>Jumlah</label>
                        <div className="quantity-controls-mini">
                          <button
                            onClick={() => handleQuantityChange(i, -1)}
                            className="qty-btn-mini"
                            disabled={item.qty <= 1}
                          >
                            −
                          </button>
                          <span className="qty-display">{item.qty || 1}</span>
                          <button
                            onClick={() => handleQuantityChange(i, 1)}
                            className="qty-btn-mini"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="cart-item-subtotal">
                        <label>Subtotal</label>
                        <p className="subtotal-price">
                          {formatPrice(item.price * (item.qty || 1))}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(i)}
                        className="btn-remove-item"
                        title="Hapus item"
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path
                            d="M6 6l8 8M14 6l-8 8"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="order-summary">
                <h2 className="summary-title">Ringkasan Pesanan</h2>

                <div className="summary-details">
                  <div className="summary-row">
                    <span>Subtotal ({cart.length} item)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  <div className="summary-row">
                    <span>PPN (11%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>

                  <div className="summary-divider"></div>

                  <div className="summary-row total-row">
                    <span>Total</span>
                    <span className="total-amount">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/payment")}
                  className="btn-checkout"
                >
                  Lanjut ke Pembayaran
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M7 4l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <div className="security-badges">
                  <div className="badge-item">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
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
                    <span>Pembayaran Aman</span>
                  </div>
                  <div className="badge-item">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M3 8h14M3 12h14M7 4h6a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"
                        stroke="#4ade80"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>Garansi 100%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
