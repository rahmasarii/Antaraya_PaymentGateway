import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';


export default function AboutPage() {
  const router = useRouter();
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    updateCartCount();
  }, []);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    setCartItemCount(totalItems);
  };

  return (
    <div className="main-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
  <img 
    src="https://images.squarespace-cdn.com/content/v1/68e5e6c1d684b33ea2171767/2c7a0a58-e2d7-4e3b-99cb-7187e398953d/Logo+Putih+Transparent+Antaraya+Original.png?format=1500w" 
    alt="Antaraya Logo"
    onClick={() => router.push('/')}
  />
</div>
          <div className="navbar-menu">
            <button onClick={() => router.push('/')} className="nav-link">
              Home
            </button>
            <button onClick={() => router.push('/shop')} className="nav-link">
              Shop
            </button>
            <button onClick={() => router.push('/about')} className="nav-link active">
              About
            </button>
          </div>
          <div className="navbar-cart" onClick={() => router.push('/checkout')}>
            <svg 
              width="28" 
              height="28" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="cart-icon"
            >
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">About Antaraya</h1>
          <p className="hero-subtitle">Premium Audio Equipment Distributor</p>
        </div>
      </section>

      {/* About Content */}
      <section className="about-content-section">
        <div className="container">
          <div className="about-content-wrapper">
            {/* Company Story */}
            <div className="about-text-section">
              <h2>Tentang Kami</h2>
              <p>
                PT Antaraya Persada adalah distributor resmi peralatan audio premium yang berkomitmen untuk menghadirkan pengalaman mendengar terbaik bagi para audiophile di Indonesia. Kami menyediakan berbagai produk audio berkualitas tinggi dari brand-brand terkemuka dunia.
              </p>
              <p>
                Dengan pengalaman bertahun-tahun di industri audio, kami memahami kebutuhan setiap pelanggan dan selalu berusaha memberikan produk terbaik dengan layanan yang memuaskan.
              </p>
            </div>

            {/* Vision & Mission */}
            <div className="vision-mission-grid">
              <div className="vision-mission-card">
                <h3>Visi Kami</h3>
                <p>
                  Menjadi distributor audio terdepan di Indonesia yang dikenal dengan kualitas produk premium dan pelayanan terbaik untuk para pecinta audio sejati.
                </p>
              </div>

              <div className="vision-mission-card">
                <h3>Misi Kami</h3>
                <p>
                  Menyediakan produk audio berkualitas tinggi dengan harga kompetitif dan memberikan pengalaman berbelanja yang menyenangkan bagi setiap pelanggan.
                </p>
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="why-choose-section">
              <h2>Mengapa Memilih Antaraya?</h2>
              
              <div className="features-grid">
                <div className="feature-item">
                  <div className="feature-icon">
                    <span>✓</span>
                  </div>
                  <h3>Produk Original</h3>
                  <p>100% produk original dengan garansi resmi dari distributor</p>
                </div>

                <div className="feature-item">
                  <div className="feature-icon">
                    <span>💎</span>
                  </div>
                  <h3>Kualitas Premium</h3>
                  <p>Hanya menjual produk audio berkualitas tinggi dari brand terpercaya</p>
                </div>

                <div className="feature-item">
                  <div className="feature-icon">
                    <span>🚚</span>
                  </div>
                  <h3>Pengiriman Cepat</h3>
                  <p>Pengiriman cepat dan aman ke seluruh Indonesia</p>
                </div>

                <div className="feature-item">
                  <div className="feature-icon">
                    <span>🎧</span>
                  </div>
                  <h3>Konsultasi Gratis</h3>
                  <p>Tim ahli kami siap membantu memilih produk yang sesuai</p>
                </div>
              </div>
            </div>    
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>ANTARAYA</h3>
              <p>Premium audio equipment untuk pengalaman mendengar terbaik Anda.</p>
            </div>
            <div className="footer-section">
              <h4>Follow Us</h4>
              <div className="social-links">
                <a href="https://www.instagram.com/pt.antarayapersada/" className="social-link">Instagram</a>
                <a href="https://shopee.co.id/antarayapersada" className="social-link">Shopee</a>
                <a href="https://www.tokopedia.com/antaraya-1" className="social-link">Tokopedia</a>
              </div>
            </div>
            <div className="footer-section">
              <h4>Hubungi Kami</h4>
              <p>Gading Serpong, +62 812-9613-5571</p>
              <p>Jakarta Barat, +62 813-1898-3498</p>
              <br />
              <p>Senin-Jumat: 8.00 am - 17.30 pm</p>
              <p>Sabtu: 8.00 am - 13.00 pm</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 Antaraya. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}