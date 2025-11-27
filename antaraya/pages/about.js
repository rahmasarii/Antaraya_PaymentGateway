import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';


export default function AboutPage() {
  const router = useRouter();
  
  // Contact form state
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subscribe: false,
    message: "",
  });
  const [loading, setLoading] = useState(false);


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
      <Navbar active="about" />


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
    </div>
  );
}