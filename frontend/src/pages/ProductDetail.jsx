import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

export default function ProductDetail({ productId, onBack }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/products');
        if (!response.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลสินค้าได้');
        }
        const products = await response.json();
        const found = products.find((p) => p.id === productId);
        if (!found) {
          throw new Error('ไม่พบสินค้าที่คุณต้องการ');
        }
        setProduct(found);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;
    addToCart(product, quantity);
    
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div style={styles.centerContainer} className="page-fade-in">
        <p style={{ color: 'var(--text-secondary)' }}>กำลังโหลดรายละเอียดสินค้า...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={styles.centerContainer} className="page-fade-in">
        <div style={styles.errorAlert}>{error || 'ไม่พบข้อมูลสินค้า'}</div>
        <div style={{ marginTop: '2rem' }}>
          <button onClick={onBack} className="btn-outline-neon">
            ← กลับไปหน้าร้านค้า
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container} className="page-fade-in">
      {/* Back navigation */}
      <div style={styles.backNav}>
        <button onClick={onBack} className="btn-outline-neon" style={styles.backBtn}>
          ← กลับไปหน้าร้านค้า
        </button>
      </div>

      {/* Main product layout */}
      <div className="product-detail-grid">
        {/* Left: Product Image */}
        <div style={styles.imageCard} className="glass-card glow-cyan">
          <div style={styles.categoryBadge}>{product.category}</div>
          <img src={product.image} alt={product.name} style={styles.productImg} />
        </div>

        {/* Right: Product Info */}
        <div style={styles.infoContainer}>
          <h1 style={styles.productName}>{product.name}</h1>

          {/* Stock status indicator */}
          <div style={styles.stockRow}>
            {product.stock <= 0 ? (
              <span style={styles.statusOutOfStock}>❌ สินค้าหมด (Out of Stock)</span>
            ) : product.stock <= 3 ? (
              <span style={styles.statusLowStock}>⚠️ สินค้าใกล้หมด (เหลือเพียง {product.stock} ชิ้น)</span>
            ) : (
              <span style={styles.statusInStock}>✓ มีสินค้าในสต็อก</span>
            )}
          </div>

          {/* Price */}
          <div style={styles.priceSection}>
            <span style={styles.priceLabel}>ราคาพิเศษ</span>
            <h2 style={styles.priceValue}>{product.price.toLocaleString()} บาท</h2>
          </div>

          <p style={styles.description}>{product.description}</p>

          {/* Purchase Controls */}
          {product.stock > 0 && (
            <div style={styles.purchaseControls} className="glass-card">
              <div style={styles.quantityRow}>
                <span style={styles.quantityLabel}>จำนวนที่ต้องการสั่งซื้อ:</span>
                <div style={styles.counterContainer}>
                  <button 
                    onClick={handleDecrease} 
                    style={styles.counterBtn}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span style={styles.counterValue}>{quantity}</span>
                  <button 
                    onClick={handleIncrease} 
                    style={styles.counterBtn}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn-neon"
                style={{
                  ...styles.addBtn,
                  ...(addedSuccess ? styles.addBtnSuccess : {})
                }}
              >
                {addedSuccess ? 'เพิ่มลงตะกร้าแล้ว! ✓' : 'ใส่ตะกร้าสินค้า'}
              </button>
            </div>
          )}

          {/* Technical Specs */}
          {product.specs && (
            <div style={styles.specsSection} className="glass-card">
              <h3 style={styles.specsTitle}>ข้อมูลจำเพาะสินค้า (Specifications)</h3>
              <table style={styles.specsTable}>
                <tbody>
                  {product.specs.manufacturer && (
                    <tr>
                      <td style={styles.specsKey}>ผู้ผลิต / แบรนด์</td>
                      <td style={styles.specsValue}>{product.specs.manufacturer}</td>
                    </tr>
                  )}
                  {product.specs.weight && (
                    <tr>
                      <td style={styles.specsKey}>น้ำหนักสุทธิ / ขนาด</td>
                      <td style={styles.specsValue}>{product.specs.weight}</td>
                    </tr>
                  )}
                  {product.specs.materials && (
                    <tr>
                      <td style={styles.specsKey}>ส่วนผสม / วัสดุ</td>
                      <td style={styles.specsValue}>{product.specs.materials}</td>
                    </tr>
                  )}
                  {product.specs.warranty && (
                    <tr>
                      <td style={styles.specsKey}>การรับรอง / การรับประกัน</td>
                      <td style={styles.specsValue}>{product.specs.warranty}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem 1.5rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  centerContainer: {
    textAlign: 'center',
    padding: '5rem 2rem',
  },
  errorAlert: {
    display: 'inline-block',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: 'var(--danger)',
    border: '1px solid var(--danger)',
    padding: '1rem 2rem',
    borderRadius: '8px',
    fontWeight: '600',
  },
  backNav: {
    marginBottom: '2rem',
  },
  backBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
  },
  imageCard: {
    padding: '0',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(21, 34, 25, 0.4)',
    height: '450px',
    borderRadius: '16px',
  },
  categoryBadge: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    backgroundColor: 'rgba(12, 19, 14, 0.85)',
    color: 'var(--primary-glow)',
    border: '1px solid var(--border-color)',
    padding: '0.3rem 0.9rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '700',
    zIndex: 2,
    backdropFilter: 'blur(4px)',
  },
  productImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  infoContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  },
  productName: {
    fontSize: '2.2rem',
    lineHeight: '1.2',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-title)',
    fontWeight: '800',
  },
  stockRow: {
    display: 'flex',
    alignItems: 'center',
  },
  statusOutOfStock: {
    color: 'var(--danger)',
    fontSize: '0.95rem',
    fontWeight: '600',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    padding: '0.3rem 0.8rem',
    borderRadius: '20px',
    border: '1px solid rgba(239, 68, 68, 0.25)',
  },
  statusLowStock: {
    color: 'var(--warning)',
    fontSize: '0.95rem',
    fontWeight: '600',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    padding: '0.3rem 0.8rem',
    borderRadius: '20px',
    border: '1px solid rgba(245, 158, 11, 0.25)',
  },
  statusInStock: {
    color: 'var(--success)',
    fontSize: '0.95rem',
    fontWeight: '600',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    padding: '0.3rem 0.8rem',
    borderRadius: '20px',
    border: '1px solid rgba(16, 185, 129, 0.25)',
  },
  priceSection: {
    borderTop: '1px solid var(--border-color)',
    borderBottom: '1px solid var(--border-color)',
    padding: '1rem 0',
  },
  priceLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    display: 'block',
    marginBottom: '0.2rem',
  },
  priceValue: {
    fontSize: '2rem',
    fontWeight: '800',
    color: 'var(--secondary-glow)',
    fontFamily: 'var(--font-title)',
  },
  description: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    lineHeight: '1.6',
  },
  purchaseControls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
    padding: '1.2rem',
    backgroundColor: 'rgba(21, 34, 25, 0.4)',
    border: '1px solid var(--border-color)',
  },
  quantityRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityLabel: {
    fontSize: '0.95rem',
    color: 'var(--text-primary)',
    fontWeight: '600',
  },
  counterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.3rem 0.6rem',
    backgroundColor: 'rgba(12, 19, 14, 0.6)',
  },
  counterBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '1.2rem',
    fontWeight: '700',
    cursor: 'pointer',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease',
  },
  counterValue: {
    fontSize: '1.1rem',
    fontWeight: '700',
    minWidth: '20px',
    textAlign: 'center',
  },
  addBtn: {
    width: '100%',
    padding: '0.8rem',
    fontSize: '1.05rem',
    fontWeight: '700',
  },
  addBtnSuccess: {
    backgroundColor: 'var(--success)',
    color: '#000',
    boxShadow: 'var(--shadow-neon)',
  },
  specsSection: {
    padding: '1.2rem',
    backgroundColor: 'rgba(21, 34, 25, 0.2)',
    border: '1px solid var(--border-color)',
  },
  specsTitle: {
    fontSize: '1.1rem',
    marginBottom: '1rem',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-title)',
  },
  specsTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  specsKey: {
    padding: '0.6rem 0.8rem 0.6rem 0',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    width: '40%',
    fontWeight: '500',
  },
  specsValue: {
    padding: '0.6rem 0',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    fontWeight: '600',
  },
};
