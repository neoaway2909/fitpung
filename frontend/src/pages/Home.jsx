import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Home({ onViewDetails }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedItemIds, setAddedItemIds] = useState(new Set());

  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/products');
        if (!response.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลสินค้าได้');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    if (product.stock <= 0) return;
    addToCart(product, 1);
    
    // Simple visual feedback for adding to cart
    setAddedItemIds(prev => {
      const next = new Set(prev);
      next.add(product.id);
      return next;
    });
    setTimeout(() => {
      setAddedItemIds(prev => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 1500);
  };

  const categories = ['All', 'Supplement', 'Food & Beverage', 'Fitness Gear'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div style={styles.centerContainer} className="page-fade-in">
        <p>กำลังโหลดสินค้าเพื่อสุขภาพระดับพรีเมียม...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centerContainer} className="page-fade-in">
        <div style={styles.errorAlert}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container} className="page-fade-in">
      {/* Hero Banner */}
      <div style={styles.heroBanner} className="glass-card glow-cyan">
        <h1 style={styles.heroTitle}>VITALIFE WELLNESS</h1>
        <p style={styles.heroSubtitle}>
          ยกระดับสุขภาพและการดำเนินชีวิตของคุณด้วยผลิตภัณฑ์พรีเมียมคัดสรรพิเศษเพื่อความสุขที่ยั่งยืน
        </p>
      </div>

      {/* Search & Category Filter Section */}
      <div style={styles.filterSection}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="🔍 ค้นหาผลิตภัณฑ์สุขภาพ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.categoriesContainer}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                ...styles.categoryBtn,
                ...(selectedCategory === cat ? styles.categoryBtnActive : {})
              }}
            >
              {cat === 'All' ? 'ทั้งหมด' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          ไม่พบสินค้าตามเงื่อนไขการค้นหาของคุณ
        </div>
      ) : (
        <div style={styles.productGrid}>
          {filteredProducts.map(product => (
            <div key={product.id} style={styles.productCard} className="glass-card">
              <div style={styles.categoryBadge}>{product.category}</div>
              <div style={styles.imgContainer} onClick={() => onViewDetails(product.id)}>
                <img src={product.image} alt={product.name} style={styles.productImg} />
              </div>
              <div style={styles.productInfo}>
                <h3 
                  style={styles.productName} 
                  onClick={() => onViewDetails(product.id)}
                  onMouseEnter={(e) => e.target.style.color = 'var(--primary-glow)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-primary)'}
                >
                  {product.name}
                </h3>
                
                {/* Stock status indicator */}
                <div style={styles.stockRow}>
                  {product.stock <= 0 ? (
                    <span style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: '600' }}>
                      ❌ สินค้าหมด
                    </span>
                  ) : product.stock <= 3 ? (
                    <span style={{ color: 'var(--warning)', fontSize: '0.85rem', fontWeight: '600' }}>
                      ⚠️ เหลือเพียง {product.stock} ชิ้น
                    </span>
                  ) : (
                    <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: '600' }}>
                      ✓ มีสินค้าในสต็อก
                    </span>
                  )}
                </div>

                <p style={styles.description}>{product.description}</p>
                
                <div style={styles.footerRow}>
                  <div style={styles.priceContainer}>
                    <span style={styles.priceLabel}>ราคา</span>
                    <span style={styles.priceValue}>{product.price.toLocaleString()} บาท</span>
                  </div>
                  
                  <div style={styles.btnGroup}>
                    <button
                      onClick={() => onViewDetails(product.id)}
                      className="btn-outline-neon"
                      style={styles.detailsBtn}
                    >
                      รายละเอียด
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      className="btn-neon"
                      style={{
                        ...styles.addBtn,
                        ...(addedItemIds.has(product.id) ? styles.addBtnSuccess : {}),
                        ...(product.stock <= 0 ? styles.addBtnDisabled : {})
                      }}
                    >
                      {product.stock <= 0 ? 'หมด' : addedItemIds.has(product.id) ? 'เพิ่มแล้ว! ✓' : 'ใส่ตะกร้า'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem 1rem',
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
  heroBanner: {
    textAlign: 'center',
    padding: '3rem 2rem',
    marginBottom: '2.5rem',
    background: 'linear-gradient(135deg, rgba(21, 34, 25, 0.9) 0%, rgba(12, 19, 14, 0.95) 100%)',
  },
  heroTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '2.5rem',
    fontWeight: '800',
    letterSpacing: '0.05em',
    marginBottom: '1rem',
    background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--primary-glow) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '1.05rem',
    maxWidth: '650px',
    margin: '0 auto',
    lineHeight: '1.6',
  },
  filterSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1.5rem',
    marginBottom: '2.5rem',
  },
  searchContainer: {
    flex: '1 1 300px',
  },
  searchInput: {
    width: '100%',
    backgroundColor: 'rgba(21, 34, 25, 0.8)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    padding: '0.8rem 1.2rem',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  categoriesContainer: {
    display: 'flex',
    gap: '0.8rem',
    flexWrap: 'wrap',
  },
  categoryBtn: {
    backgroundColor: 'rgba(21, 34, 25, 0.5)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    padding: '0.5rem 1.2rem',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
    transition: 'all 0.3s ease',
  },
  categoryBtnActive: {
    backgroundColor: 'var(--primary-glow)',
    borderColor: 'var(--primary-glow)',
    color: '#000',
    boxShadow: 'var(--shadow-neon)',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '2rem',
  },
  productCard: {
    position: 'relative',
    padding: '0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  categoryBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: 'rgba(12, 19, 14, 0.85)',
    color: 'var(--primary-glow)',
    border: '1px solid var(--border-color)',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '700',
    zIndex: 2,
    backdropFilter: 'blur(4px)',
  },
  imgContainer: {
    width: '100%',
    height: '200px',
    backgroundColor: 'rgba(12, 19, 14, 0.5)',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  productImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
  },
  productInfo: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  productName: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.2rem',
    color: 'var(--text-primary)',
    marginBottom: '0.5rem',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  },
  stockRow: {
    marginBottom: '0.8rem',
  },
  description: {
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    lineHeight: '1.5',
    marginBottom: '1.5rem',
    flexGrow: 1,
  },
  footerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  priceContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  priceLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  priceValue: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: 'var(--secondary-glow)',
    fontFamily: 'var(--font-title)',
  },
  btnGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
  detailsBtn: {
    padding: '0.6rem 0.8rem',
    fontSize: '0.85rem',
    borderRadius: '8px',
    border: '1px solid var(--primary-glow)',
    background: 'transparent',
    color: 'var(--primary-glow)',
    cursor: 'pointer',
    fontFamily: 'var(--font-title)',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  addBtn: {
    padding: '0.6rem 0.8rem',
    fontSize: '0.85rem',
    borderRadius: '8px',
  },
  addBtnSuccess: {
    background: 'var(--success)',
    color: '#000',
    boxShadow: 'var(--shadow-neon)',
  },
  addBtnDisabled: {
    background: '#374151',
    borderColor: '#374151',
    color: '#9CA3AF',
    cursor: 'not-allowed',
    boxShadow: 'none',
    transform: 'none',
  },
};
