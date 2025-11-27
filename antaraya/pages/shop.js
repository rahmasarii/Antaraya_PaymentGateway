import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';

export default function ShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, statusFilter]);

  // Responsif: ubah itemsPerPage berdasarkan lebar layar
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateItemsPerPage = () => {
      const width = window.innerWidth;

      if (width <= 710) {
        // Mobile: 2 kolom
        setItemsPerPage(6);
      } else if (width <= 1024) {
        // iPad / tablet: 3 kolom -> pakai kelipatan 3
        setItemsPerPage(9);
      } else {
        // Desktop: 4 kolom -> pakai kelipatan 4
        setItemsPerPage(8);
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);

    return () => {
      window.removeEventListener('resize', updateItemsPerPage);
    };
  }, []);

  // Kalau itemsPerPage berubah, balik lagi ke page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Gagal memuat produk. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(product => product.status === statusFilter);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="main-container">
      {/* Navbar */}
      <Navbar active="shop" />

      <button
        onClick={() => window.open("https://wa.me/6281296135571", "_blank")}
        className="whatsapp-floating-btn"
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" />
      </button>

      {/* Hero Section - DENGAN BACKGROUND IMAGE */}
      <section 
        className="hero-section"
        style={{
          backgroundImage: 'url(https://images.squarespace-cdn.com/content/v1/5ec321c2af33de48734cc929/b501ce91-c834-4f50-b1ff-5064bb688549/image-asset+%286%29.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative'
        }}
      >
        <div className="hero-content">
          <h1 className="hero-title">Premium Audio Collection</h1>
          <p className="hero-subtitle">Experience the finest sound quality</p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="filter-section">
        <div className="container">
          <div className="filter-container">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>

            <div className="status-filter">
              <button
                className={`filter-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setStatusFilter('ALL')}
              >
                Semua
              </button>
              <button
                className={`filter-btn ${statusFilter === 'READY' ? 'active' : ''}`}
                onClick={() => setStatusFilter('READY')}
              >
                Ready Stock
              </button>
              <button
                className={`filter-btn ${statusFilter === 'HABIS' ? 'active' : ''}`}
                onClick={() => setStatusFilter('HABIS')}
              >
                Habis
              </button>
            </div>

            <div className="results-count">
              Menampilkan {filteredProducts.length} produk
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="products-section">
        <div className="container">
          {error && (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button onClick={fetchProducts} className="retry-btn">
                Coba Lagi
              </button>
            </div>
          )}

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Memuat produk...</p>
            </div>
          ) : currentProducts.length > 0 ? (
            <>
              <div className="products-grid">
                {currentProducts.map((product) => (
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

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ← Prev
                  </button>
                  
                  <div className="pagination-numbers">
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
                        onClick={() => paginate(index + 1)}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    className="pagination-btn"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="40" stroke="#E5E7EB" strokeWidth="2"/>
                <path d="M35 45h30M35 55h20" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <h3>Produk tidak ditemukan</h3>
              <p>Coba ubah filter atau kata kunci pencarian</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}