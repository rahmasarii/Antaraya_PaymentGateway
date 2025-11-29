import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';

export default function HomePage() {
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsToShow, setItemsToShow] = useState(4); // default desktop
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
      firstName: "",
      lastName: "",
      email: "",
      // subscribe: false,
      message: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  // Responsif: ubah itemsToShow berdasarkan lebar layar
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateItemsToShow = () => {
      const width = window.innerWidth;

         if (width <= 710) {
        // Mobile: 2 kolom
        setItemsToShow(4);
      } else if (width <= 1024) {
        // iPad / tablet: 3 kolom -> pakai kelipatan 3
        setItemsToShow(3);
      } else {
        // Desktop: 4 kolom -> pakai kelipatan 4
        setItemsToShow(4);
      }

    };

    updateItemsToShow();
    window.addEventListener('resize', updateItemsToShow);

    return () => {
      window.removeEventListener('resize', updateItemsToShow);
    };
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setFeaturedProducts(data.slice(0, itemsToShow));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update featured products ketika itemsToShow berubah
  useEffect(() => {
    if (featuredProducts.length > 0) {
      fetchFeaturedProducts();
    }
  }, [itemsToShow]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });

      const data = await res.json();
      setFormLoading(false);

      if (res.ok) {
        alert("Pesan Anda telah terkirim! Kami akan segera menghubungi Anda 😊");
        setContactForm({
          name: "",
          email: "",
          message: "",
        });
      } else {
        alert("Gagal mengirim pesan. Silakan coba lagi.");
      }
    } catch (error) {
      setFormLoading(false);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="main-container">
      {/* Navbar */}
      <Navbar active="home" />

      <button
        onClick={() => window.open("https://wa.me/6281296135571", "_blank")}
        className="whatsapp-floating-btn"
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" />
      </button>

      {/* Hero Section */}
      <section
        className="hero-section-home"
        style={{
          backgroundImage:
            'url(https://images.squarespace-cdn.com/content/v1/68e5e6c1d684b33ea2171767/4aeceed3-c6b0-40d1-8234-6ec082d974c9/openart-image_SvCkyGSD_1753133761178_raw+%281%29.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          }}
        />

        <div
          className="hero-content"
          style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            color: 'white',
          }}
        >
          <h1
            style={{
              fontSize: '4rem',
              fontWeight: '800',
              marginBottom: '1.5rem',
              letterSpacing: '-1px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            Discover The Full Detail Of Your Music
          </h1>
          <p
            style={{
              fontSize: '1.75rem',
              fontWeight: '300',
              marginBottom: '2rem',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            With Our Signature Euphoria Sound Technology
          </p>
          <button
            onClick={() => router.push('/shop')}
            style={{
              padding: '1rem 3rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              color: 'white',
              backgroundColor: 'transparent',
              border: '2px solid white',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.color = '#1a1a1a';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = 'white';
            }}
          >
            LEARN MORE
          </button>
        </div>
      </section>  

      {/* Featured Products Section */}
      <section className="featured-products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Produk Terbaru</h2>
            <button
              onClick={() => router.push('/shop')}
              className="btn-view-all"
            >
              SEMUA PRODUK
            </button>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Memuat produk...</p>
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <div
                  key={product._id}
                  className="product-card"
                  onClick={() => router.push(`/product/${product._id}`)}
                >
                  <div className="product-image-wrapper">
                    <img
                      src={product.displayImage || '/no-image.png'}
                      alt={product.name}
                      className="product-image"
                    />
                    {product.status === 'HABIS' && (
                      <div className="status-badge out-of-stock">HABIS</div>
                    )}
                    <div className="product-overlay">
                      <button className="btn-view-detail">Lihat Detail</button>
                    </div>
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">{formatPrice(product.price)}</p>
                    {product.colors && product.colors.length > 0 && (
                      <div className="color-variants">
                        {product.colors.slice(0, 4).map((color, idx) => (
                          <div
                            key={idx}
                            className="color-dot"
                            style={{ backgroundColor: color.colorName.toLowerCase() }}
                            title={color.colorName}
                          />
                        ))}
                        {product.colors.length > 4 && (
                          <span className="color-more">+{product.colors.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Shipping Section */}
      <section className="shipping-section">
        <div className="container">
          <div className="shipping-content">
            <div className="shipping-text">
              <h2 className="shipping-title">Pilihan Kurir</h2>
              <p className="shipping-subtitle">
                <strong>Gratis Ongkir Instant</strong> khusus daerah <strong>BSD City</strong> dan <strong>Gading Serpong</strong>
              </p>
            </div>
            <div className="courier-logos">
              <div className="courier-logo-item">
                <img
                  src="https://images.squarespace-cdn.com/content/v1/68e5e6c1d684b33ea2171767/0fc15baf-e243-4e82-98bd-47c1fce3c37d/0+J%26T+Express.png?format=500w"
                  alt="J&T Express"
                />
              </div>
              <div className="courier-logo-item">
                <img
                  src="https://images.squarespace-cdn.com/content/v1/68e5e6c1d684b33ea2171767/788b542d-bc89-462f-bb47-d2465b0ccfaa/0+JNE+Express.png?format=500w"
                  alt="JNE Express"
                />
              </div>
              <div className="courier-logo-item">
                <img
                  src="https://images.squarespace-cdn.com/content/v1/68e5e6c1d684b33ea2171767/4b78bf57-295d-4e7b-a137-4565eb47bf59/0+SiCepat+2.png?format=500w"
                  alt="SiCepat"
                />
              </div>
              <div className="courier-logo-item">
                <img
                  src="https://images.squarespace-cdn.com/content/v1/68e5e6c1d684b33ea2171767/1856b44a-844f-43b4-bcff-708f9520a5a0/0+Gosend+Gojek.png?format=750w"
                  alt="GoSend"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2 className="contact-title">Untuk Kebutuhan Bisnis Anda.</h2>
            </div>

            <div className="contact-form-wrapper">
              <form onSubmit={handleContactSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Nama Anda:</label>
                  <input
                    type="text"
                    id="firstName"
                    placeholder="Masukkan Nama"
                    required
                    value={contactForm.firstName}
                    onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">E-mail Anda:</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Masukkan Email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Pesan Anda:</label>
                  <textarea
                    id="message"
                    rows="6"
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="btn-submit" disabled={formLoading}>
                  {formLoading ? "Mengirim..." : "POST"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Peluang Bisnis Section */}
      <section className="business-opportunity-section">
        <div className="container business-opportunity-container">
          <div className="business-left image-grid">
            <a href="https://www.instagram.com/p/DOfUUGAAYmZ/" target="_blank">
              <img src="https://images.squarespace-cdn.com/content/v1/68e5e6c1d684b33ea2171767/1760054444247-1XQ0XHVL829G6V275N0T/image-asset.jpeg?format=500w" />
            </a>

            <a href="https://www.instagram.com/p/DOfURnEAaFn/" target="_blank">
              <img src="https://images.squarespace-cdn.com/content/v1/68e5e6c1d684b33ea2171767/1760054445057-IZE5D4LLACIYRKTGGX6J/image-asset.jpeg?format=500w" />
            </a>

            <a href="https://www.instagram.com/p/DOfUHemgVtS/" target="_blank">
              <img src="https://images.squarespace-cdn.com/content/v1/68e5e6c1d684b33ea2171767/1760054445799-5GWI33Q2BDHQE7MCALFA/image-asset.jpeg?format=500w" />
            </a>

            <a href="https://www.instagram.com/p/DMasmH5B2WJ/" target="_blank">
              <img src="https://images.squarespace-cdn.com/content/v1/68e5e6c1d684b33ea2171767/1760054446582-EPTMHZHTR9TT5LRHL4T1/image-asset.jpeg?format=500w" />
            </a>

            <a href="https://www.instagram.com/p/DMasj1SBaLl/" target="_blank">
              <img src="https://images.squarespace-cdn.com/content/v1/68e5e6c1d684b33ea2171767/1760054447311-QUW45OTEVFDYYHU180MA/image-asset.jpeg?format=500w" />
            </a>

            <a href="https://www.instagram.com/p/DMasgM7Ba1u/" target="_blank">
              <img src="https://images.squarespace-cdn.com/content/v1/68e5e6c1d684b33ea2171767/1760054448024-RFXN8HRM7MQN58UZC3YT/image-asset.jpeg?format=500w" />
            </a>
          </div>

          <div className="business-right">
            <h2 className="business-title">Peluang Bisnis<br />Di Antaraya !</h2>

            <p className="business-subtitle">
              Dapatkan komisi pertama anda dengan hanya menjual 1 produk pertama anda.
            </p>

            <p className="business-desc">
              Kami membuka kesempatan untuk anda yang berminat menjadi :
            </p>

            <ul className="business-list">
              <li>• Reseller</li>
              <li>• Affiliate</li>
              <li>• Dropshipper</li>
            </ul>
            <button
              onClick={() => router.push('/about')}
              className="business-button"
            >
              SAYA TERTARIK!
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}