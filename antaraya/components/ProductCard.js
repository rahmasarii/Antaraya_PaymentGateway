import Link from 'next/link';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const [imageError, setImageError] = useState(false);
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const defaultImage = '/images/placeholder-product.png';

  return (
    <Link href={`/product/${product._id}`}>
      <div className="product-card group cursor-pointer">
        {/* Image Container */}
        <div className="product-image-wrapper">
          <img
            src={imageError ? defaultImage : (product.displayImage || defaultImage)}
            alt={product.name}
            onError={() => setImageError(true)}
            className="product-image"
          />
          
          {/* Status Badge */}
          {product.status === 'HABIS' && (
            <div className="status-badge out-of-stock">
              HABIS
            </div>
          )}
          
          {/* Overlay on Hover */}
          <div className="product-overlay">
            <button className="btn-view-detail">
              Lihat Detail
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-price">{formatPrice(product.price)}</p>
          
          {/* Color Variants Preview */}
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
    </Link>
  );
}