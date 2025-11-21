import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [displayImage, setDisplayImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/products?id=${id}`);
        const data = res.data;
        setProduct(data);

        // Default color
        if (data.colors?.length > 0) {
          const defaultColor = data.colors[0];
          setSelectedColor(defaultColor);
          setDisplayImage(defaultColor.image || data.displayImage);
        } else {
          setDisplayImage(data.displayImage);
        }

      } catch (err) {
        setError("Gagal memuat produk");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="main-container">
        <nav className="navbar">
          <div className="navbar-container">
            <div className="navbar-logo">
              <h1>ANTARAYA</h1>
            </div>
          </div>
        </nav>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Memuat produk...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-container">
        <nav className="navbar">
          <div className="navbar-container">
<div className="navbar-logo">
  <img 
    src="https://images.squarespace-cdn.com/content/v1/68e5e6c1d684b33ea2171767/2c7a0a58-e2d7-4e3b-99cb-7187e398953d/Logo+Putih+Transparent+Antaraya+Original.png?format=1500w" 
    alt="Antaraya Logo"
    onClick={() => router.push('/')}
  />
</div>
          </div>
        </nav>
        <div className="error-container" style={{ padding: '3rem', textAlign: 'center' }}>
          <p className="error-message">{error}</p>
          <button onClick={() => router.push('/')} className="retry-btn" style={{ marginTop: '1rem' }}>
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="main-container">
        <nav className="navbar">
          <div className="navbar-container">
            <div className="navbar-logo">
              <h1>ANTARAYA</h1>
            </div>
          </div>
        </nav>
        <div className="empty-state">
          <h3>Produk tidak ditemukan</h3>
          <button onClick={() => router.push('/')} style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const onColorChange = (colorObj) => {
    setSelectedColor(colorObj);
    setDisplayImage(colorObj?.image || product.displayImage);
  };

  const handleQuantityChange = (change) => {
    const newQty = quantity + change;
    if (newQty >= 1 && newQty <= 99) {
      setQuantity(newQty);
    }
  };

  const addToCart = () => {
    if (product.status === 'HABIS') {
      alert('Produk sedang habis stok');
      return;
    }

    const existing = JSON.parse(localStorage.getItem("cart") || "[]");

    const item = {
      _id: product._id,
      name: product.name,
      price: product.price,
      color: selectedColor?.colorName || "",
      displayImage: displayImage,
      qty: quantity
    };

    localStorage.setItem("cart", JSON.stringify([...existing, item]));
    alert("Produk ditambahkan ke keranjang!");
    router.push("/checkout");
  };

  const buyNow = () => {
    if (product.status === 'HABIS') {
      alert('Produk sedang habis stok');
      return;
    }

    const item = {
      _id: product._id,
      name: product.name,
      price: product.price,
      color: selectedColor?.colorName || "",
      displayImage: displayImage,
      qty: quantity
    };

    localStorage.setItem("cart", JSON.stringify([item]));
    router.push("/payment");
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
            <button 
              onClick={() => router.push('/')} 
              className="nav-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Kembali
            </button>
          </div>
        </div>
      </nav>

            <button
  onClick={() => window.open("https://wa.me/6281296135571", "_blank")}
  className="whatsapp-floating-btn"
>
  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" />
</button>

      {/* Product Detail Section */}
      <section className="product-detail-section">
        <div className="container">
          <div className="product-detail-grid">
            
            {/* Left Side - Gallery */}
            <div className="product-gallery">
              {/* Main Image */}
              <div className="main-image-container">
                <img
                  src={displayImage || "/no-image.png"}
                  alt={product.name}
                  className="main-image"
                />
              </div>

              {/* Thumbnail Gallery */}
              {Array.isArray(product.galleryImages) && product.galleryImages.length > 0 && (
                <div className="thumbnail-gallery">
                  {/* Display Image as first thumbnail */}
                  <div 
                    className={`thumbnail ${displayImage === product.displayImage ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedColor(null);
                      setDisplayImage(product.displayImage);
                    }}
                  >
                    <img src={product.displayImage || "/no-image.png"} alt="Main" />
                  </div>
                  
                  {/* Gallery images */}
                  {product.galleryImages.map((img, i) => (
                    <div 
                      key={i}
                      className={`thumbnail ${displayImage === img ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedColor(null);
                        setDisplayImage(img);
                      }}
                    >
                      <img src={img} alt={`Gallery ${i + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side - Product Info */}
            <div className="product-detail-info">
              
              {/* Product Name */}
              <h1 className="detail-product-name">{product.name}</h1>

              {/* Price */}
              <div className="detail-product-price">
                {formatPrice(product.price)}
              </div>

              {/* Status */}
              <div className="product-status-container">
                <span className={`product-status ${product.status === 'READY' ? 'ready' : 'out'}`}>
                  {product.status === 'READY' ? '✓ Ready Stock' : '✗ Stok Habis'}
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <div className="product-description">
                  <h3>Deskripsi Produk</h3>
                  <p>{product.description}</p>
                </div>
              )}

              {/* Color Selection */}
              {Array.isArray(product.colors) && product.colors.length > 0 && (
                <div className="color-selection">
                  <h3>Pilih Warna</h3>
                  <div className="color-options">
                    {product.colors.map((color, i) => (
                      <div
                        key={i}
                        className={`color-option ${selectedColor?.colorName === color.colorName ? 'selected' : ''}`}
                        onClick={() => onColorChange(color)}
                      >
                        <div 
                          className="color-preview"
                          style={{ 
                            backgroundColor: color.colorName.toLowerCase(),
                            border: color.colorName.toLowerCase() === 'white' ? '2px solid #e5e7eb' : 'none'
                          }}
                        />
                        <span>{color.colorName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="quantity-selector">
                <h3>Jumlah</h3>
                <div className="quantity-controls">
                  <button 
                    className="qty-btn"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <input 
                    type="number" 
                    className="qty-input"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(Math.max(1, Math.min(99, val)));
                    }}
                    min="1"
                    max="99"
                  />
                  <button 
                    className="qty-btn"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 99}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button
                  onClick={addToCart}
                  className="btn-add-cart"
                  disabled={product.status === 'HABIS'}
                >
                  Tambah ke Keranjang
                </button>
                <button
                  onClick={buyNow}
                  className="btn-buy-now"
                  disabled={product.status === 'HABIS'}
                >
                  Beli Sekarang
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
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

          <div className="footer-divider"></div>

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
              <h3>Follow Us</h3>
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
          <div className="footer-bottom">
            <p>© 2024 Antaraya. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}