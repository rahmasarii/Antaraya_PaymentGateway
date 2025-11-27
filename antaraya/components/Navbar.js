// components/Navbar.js
import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';

export default function Navbar({ active, cartItemCount: cartCountFromProps }) {
  const router = useRouter();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
  if (!isMenuOpen) return;

  const handleClickOutside = (event) => {
    if (!navRef.current) return;

    // kalau kliknya DI LUAR elemen <nav>, tutup menu
    if (!navRef.current.contains(event.target)) {
      setIsMenuOpen(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  document.addEventListener('touchstart', handleClickOutside);

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
    document.removeEventListener('touchstart', handleClickOutside);
  };
}, [isMenuOpen, navRef]);


  // Kalau parent TIDAK kasih cartItemCount, navbar ambil sendiri dari localStorage
  useEffect(() => {
    if (cartCountFromProps != null) return;

    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const totalItems = cart.reduce(
        (sum, item) => sum + (item.qty || item.quantity || 1),
        0
      );
      setCartItemCount(totalItems);
    };

    updateCartCount();
  }, [cartCountFromProps]);

  const displayedCartCount =
    cartCountFromProps != null ? cartCountFromProps : cartItemCount;

  const handleNavigate = (path) => {
    router.push(path);
    setIsMenuOpen(false);
  };

  return (
  <nav className="navbar" ref={navRef}>
    <div className="navbar-container">
        {/* Logo */}
        <div
          className="navbar-logo"
          onClick={() => handleNavigate('/')}
        >
          <img
            src="https://images.squarespace-cdn.com/content/v1/68e5e6c1d684b33ea2171767/2c7a0a58-e2d7-4e3b-99cb-7187e398953d/Logo+Putih+Transparent+Antaraya+Original.png?format=1500w"
            alt="Antaraya Logo"
          />
        </div>

        {/* Tombol hamburger (mobile) */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Menu */}
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <button
            onClick={() => handleNavigate('/')}
            className={`nav-link ${active === 'home' ? 'active' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavigate('/shop')}
            className={`nav-link ${active === 'shop' ? 'active' : ''}`}
          >
            Shop
          </button>
          <button
            onClick={() => handleNavigate('/about')}
            className={`nav-link ${active === 'about' ? 'active' : ''}`}
          >
            About
          </button>
        </div>

        {/* Cart */}
        <div
          className="navbar-cart"
          onClick={() => handleNavigate('/checkout')}
        >
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
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {displayedCartCount > 0 && (
            <span className="cart-badge">{displayedCartCount}</span>
          )}
        </div>
      </div>
    </nav>
  );
}
