import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function AboutPage() {
  const router = useRouter();
  const [cartItemCount, setCartItemCount] = useState(0);
  
  // Contact form state
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subscribe: false,
    message: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    updateCartCount();
  }, []);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    setCartItemCount(totalItems);
  };

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
            {cartItemCount > 0 && (
              <span className="cart-badge">{cartItemCount}</span>
            )}
          </div>
        </div>
      </nav>

            <button
  onClick={() => window.open("https://wa.me/6281296135571", "_blank")}
  className="whatsapp-floating-btn"
>
  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" />
</button>

      {/* About Content */}
      <section className="about-content-section">
        <div className="container">
          {/* Siapakah Kami Section */}
          <div className="who-we-are-section">
            <div className="who-we-are-content">
              <div className="who-we-are-text">
                <h2>Siapakah kami ?</h2>
                <p>
                  Kami hanyalah sebuah perusahaan rintisan kecil yang memiliki <strong>visi</strong> untuk membantu dan meningkatkan gaya hidup masyarakat Indonesia tanpa harus mengeluarkan biaya yang besar. Kami juga berharap dapat memperluas dan meningkatkan gaya hidup banyak orang di seluruh dunia. Kami lahir dari seorang pemuda yang menginginkan masyarakat kelas menengah ke bawah untuk menikmati produk berkualitas seperti halnya mereka yang berada di kelas menengah ke atas. Maka, pemuda tersebut mulai membangun perusahaan kecil untuk mewujudkan mimpinya, dan perusahaan itu bernama <strong>Antaraya</strong>. Di sini, Anda akan mengikuti langkah-langkahnya selama bertahun-tahun mendatang.
                </p>
                <p>
                  <strong>Misi</strong> kami adalah menyediakan dan mendistribusikan produk-produk berkualitas di seluruh pasar Indonesia dan memberikan akses bagi masyarakat kelas menengah ke bawah untuk menikmati produk-produk berkualitas tinggi tanpa mengeluarkan biaya yang mahal. Kami memastikan bahwa produk kami memiliki nilai kualitas yang lebih tinggi dari harga yang kami tetapkan. Kami juga bertujuan untuk memberikan layanan terbaik untuk memaksimalkan pengalaman konsumen kami, mulai dari sebelum penjualan hingga setelah penjualan.
                </p>
              </div>
              <div className="who-we-are-image">
                <img 
                  src="https://images.squarespace-cdn.com/content/v1/68e5e6c1d684b33ea2171767/0a948f4d-f7c6-4e01-82dd-fd0bcd796c63/Picture+1.jpg?format=2500w"
                  alt="Antaraya Audio Experience"
                />
              </div>
            </div>
          </div>

          {/* Founder Section */}
          <div className="founder-section">
            <div className="founder-content">
              <div className="founder-image">
                <img 
                  src="https://images.squarespace-cdn.com/content/v1/68e5e6c1d684b33ea2171767/d473536d-228c-48c3-b249-c3aa7a5d7495/Picture+0+Thicc.jpg?format=2500w"
                  alt="Steve Yang - Founder & CEO"
                />
              </div>
              <div className="founder-text">
                <div className="founder-info">
                  <p className="founder-name">Steve Yang</p>
                  <p className="founder-title">Antaraya Persada Founder & CEO</p>
                </div>
                <blockquote className="founder-quote">
                  It all begins with an idea. Maybe you want to launch a business. Maybe you want to turn a hobby into something more. Whatever it is, make sure your idea helps other people needs.
                </blockquote>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="contact-form-section">
            <div className="contact-form-header">
              <h2>Hubungi Kami</h2>
              <p>Apakah anda tertarik untuk bekerja sama ? Isi form ini dan kami akan menghubungi anda secepatnya. Kami tidak sabar untuk mendengar dari anda!</p>
            </div>
            <div className="contact-form-wrapper">
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name *</label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      placeholder="Masukkan nama depan"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      id="lastName"
                      type="text"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      placeholder="Masukkan nama belakang"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="nama@example.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    required
                    rows="6"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tulis pesan Anda di sini..."
                  ></textarea>
                </div>

                <div className="form-group-checkbox">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.subscribe}
                      onChange={(e) =>
                        setForm({ ...form, subscribe: e.target.checked })
                      }
                    />
                    <span>Sign up for news and updates</span>
                  </label>
                </div>

                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="button-spinner"></span>
                      Sending...
                    </>
                  ) : (
                    'SUBMIT'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">


          <div className="footer-content">
            <div className="footer-section">
              <h3>Hubungi Kami</h3>
              <p>Gading Serpong, +62 812-9613-5571</p>
              <p>Jakarta Barat, +62 813-1898-3498</p>
              <br />
              <p>Senin-Jumat: 8.00 am - 17.30 pm</p>
              <p>Sabtu: 8.00 am - 13.00 pm</p>
            </div>
            <div className="footer-section">
              <h3>Ikuti Kami</h3>
              <div className="social-links">
                <a href="https://www.instagram.com/pt.antarayapersada/" className="social-link">Instagram</a>
                <a href="https://shopee.co.id/antarayapersada" className="social-link">Shopee</a>
                <a href="https://www.tokopedia.com/antaraya-1" className="social-link">Tokopedia</a>
              </div>
            </div>
            <div className="footer-section">
              <h3>ANTARAYA</h3>
              <p>Premium audio equipment untuk pengalaman mendengar terbaik Anda.</p>
            </div>
          </div>


          {/* Brand Logos Section */}
          <div className="footer-brands">
            <div className="brand-logo-item">
              <img
                src="https://images.squarespace-cdn.com/content/v1/68e5e6c1d684b33ea2171767/b06286ba-ff07-4798-b70d-548e404c6c24/Long+normal+26x7.5.png?format=750w"
                alt="Antaraya"
              />
            </div>
            <div className="brand-logo-item">
              <img
                src="https://images.squarespace-cdn.com/content/v1/68e5e6c1d684b33ea2171767/4fa552a3-b070-4147-b2ef-39317c0384d1/Jive+Transparent+black.png?format=500w"
                alt="Jive Audio"
              />
            </div>
            <div className="brand-logo-item">
              <img
                src="https://images.squarespace-cdn.com/content/v1/68e5e6c1d684b33ea2171767/b8cb54c1-ba98-40f4-b13c-c338b416739e/Alluve+long+inv+bg.png?format=750w"
                alt="Alluve"
              />
            </div>
            <div className="brand-logo-item">
              <img
                src="https://images.squarespace-cdn.com/content/v1/68e5e6c1d684b33ea2171767/19be8492-2927-49bd-9923-d8b605f00c0d/SINGLE+BEAN+Transparent.png?format=500w"
                alt="Single Bean"
              />
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