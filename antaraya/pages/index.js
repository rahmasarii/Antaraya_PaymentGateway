import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';

// Data dummy untuk testing
const DUMMY_PRODUCTS = [
  {
    _id: "1",
    name: "Jive Active Earbuds",
    price: 149999,
    description: "Express Your Taste - Earbuds TWS dengan kualitas suara premium dan Ultra Bass Technology",
    displayImage: "https://images.squarespace-cdn.com/content/v1/68e5e6c1d684b33ea2171767/eb7d72ae-4b73-4396-bdb5-74601b698c9e/11.png?format=1500w",
    colors: [
      { colorName: "Black", image: "/images/jive-active-black.jpg" },
      { colorName: "White", image: "/images/jive-active-white.jpg" }
    ],
    status: "READY"
  },
  {
    _id: "2",
    name: "Bass Pro Headphones",
    price: 299999,
    description: "Professional grade headphones dengan active noise cancellation",
    displayImage: "/images/bass-pro.jpg",
    colors: [
      { colorName: "Black", image: "/images/bass-pro-black.jpg" }
    ],
    status: "READY"
  },
  {
    _id: "3",
    name: "Studio Monitor Speaker",
    price: 899999,
    description: "Studio quality monitor speakers untuk pengalaman audio sempurna",
    displayImage: "/images/studio-monitor.jpg",
    colors: [
      { colorName: "Wood", image: "/images/studio-monitor-wood.jpg" }
    ],
    status: "HABIS"
  },
  {
    _id: "4",
    name: "Wireless Soundbar",
    price: 1299999,
    description: "Premium soundbar dengan Dolby Atmos technology",
    displayImage: "/images/soundbar.jpg",
    colors: [
      { colorName: "Black", image: "/images/soundbar-black.jpg" }
    ],
    status: "READY"
  }
];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // TESTING MODE: Gunakan dummy data
      // Comment bagian ini setelah MongoDB siap
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      setProducts(DUMMY_PRODUCTS);
      
      // PRODUCTION MODE: Uncomment ini untuk pakai MongoDB
      // const response = await axios.get('/api/products');
      // setProducts(response.data);
      
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(product => product.status === statusFilter);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  // ... sisa code sama
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="main-container">
      {/* ... sisa JSX sama persis ... */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <h1>ANTARAYA</h1>
          </div>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Premium Audio Collection</h1>
          <p className="hero-subtitle">Experience the finest sound quality</p>
        </div>
      </section>

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

      <section className="products-section">
        <div className="container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Memuat produk...</p>
            </div>
          ) : currentProducts.length > 0 ? (
            <>
              <div className="products-grid">
                {currentProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
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

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>ANTARAYA</h3>
              <p>Premium audio equipment untuk pengalaman mendengar terbaik Anda.</p>
            </div>
            <div className="footer-section">
              <h4>Kontak</h4>
              <p>Email: info@antaraya.id</p>
              <p>Phone: +62 xxx xxxx xxxx</p>
            </div>
            <div className="footer-section">
              <h4>Follow Us</h4>
              <div className="social-links">
                <a href="#" className="social-link">Instagram</a>
                <a href="#" className="social-link">Facebook</a>
                <a href="#" className="social-link">Twitter</a>
              </div>
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