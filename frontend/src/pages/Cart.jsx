import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CheckoutModal from '../components/CheckoutModal';

const fallbackImage = 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';

export default function Cart({ onNavigate }) {
  const { 
    cart, 
    cartTotal, 
    updateQuantity, 
    removeFromCart, 
    validateAndSyncCart, 
    cartWarnings, 
    setCartWarnings, 
    loadingSync 
  } = useCart();
  const { user } = useAuth();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Sync / validate cart stock when loading Cart page
  useEffect(() => {
    validateAndSyncCart(true);
  }, []);

  const handleCheckoutClick = () => {
    if (!user) {
      onNavigate('login');
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const handleDismissWarning = (index) => {
    setCartWarnings(prev => prev.filter((_, idx) => idx !== index));
  };

  if (cart.length === 0) {
    return (
      <div style={styles.emptyContainer} className="page-fade-in">
        <div style={styles.emptyIcon}>🛒</div>
        <h2 style={styles.emptyTitle}>ตะกร้าสินค้าว่างเปล่า</h2>
        <p style={styles.emptyText}>เลือกชมสินค้าสุขภาพระดับพรีเมียมของเราและหยิบใส่ตะกร้าเพื่อเริ่มดูแลสุขภาพที่ดีของคุณ</p>
        <button onClick={() => onNavigate('home')} className="btn-neon" style={{ marginTop: '1.5rem' }}>
          ไปเลือกซื้อสินค้า
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container} className="page-fade-in">
      <div style={styles.headerRow}>
        <h1 style={styles.pageTitle}>ตะกร้าสินค้า</h1>
        {loadingSync && <span style={styles.syncIndicator}>กำลังเช็คสต็อกสินค้าแบบเรียลไทม์...</span>}
      </div>

      {/* Warning Box for Stock & Price Changes */}
      {cartWarnings && cartWarnings.length > 0 && (
        <div style={styles.warningContainer} className="page-fade-in">
          <div style={styles.warningHeader}>
            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
            <strong style={{ marginLeft: '0.5rem' }}>ระบบตรวจสอบความถูกต้องของสินค้าในตะกร้าและปรับปรุงล่าสุด:</strong>
          </div>
          <ul style={styles.warningList}>
            {cartWarnings.map((war, idx) => (
              <li key={idx} style={styles.warningItem}>
                <span>• {war}</span>
                <button onClick={() => handleDismissWarning(idx)} style={styles.dismissBtn}>×</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div style={styles.contentLayout}>
        {/* Left Side: Items List */}
        <div style={styles.itemsList}>
          {cart.map((item) => {
            const isStockLimited = item.stock <= 3;
            const hasReachedLimit = item.quantity >= item.stock;

            return (
              <div key={item.productId} style={styles.itemCard} className="glass-card">
                {/* Product Image Column */}
                <div style={styles.imgWrapper}>
                  <img src={item.image || fallbackImage} alt={item.name} style={styles.itemImage} />
                </div>

                {/* Product Name and Stock Info */}
                <div style={styles.itemDetails}>
                  <h3 style={styles.itemName}>{item.name}</h3>
                  <div style={styles.itemPriceDetail}>
                    ราคาต่อชิ้น: <span style={styles.highlightText}>{item.price.toLocaleString()} บาท</span>
                  </div>

                  {/* Stock Status Badge inside Cart Item */}
                  <div style={{ marginTop: '0.5rem' }}>
                    {item.stock <= 0 ? (
                      <span style={styles.badgeDanger}>❌ สินค้าหมดสต็อก</span>
                    ) : isStockLimited ? (
                      <span style={styles.badgeWarning}>⚠️ เหลือสต็อก {item.stock} ชิ้นสุดท้าย</span>
                    ) : (
                      <span style={styles.badgeSuccess}>✓ มีสินค้าพร้อมส่ง (สต็อกคงเหลือ {item.stock} ชิ้น)</span>
                    )}
                  </div>
                </div>
                
                <div style={styles.actionsContainer}>
                  {/* Quantity Editor */}
                  <div style={styles.quantityCol}>
                    <div style={styles.labelMini}>จำนวน</div>
                    <div style={styles.quantityContainer}>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)} 
                        style={styles.qtyBtn}
                        title="ลดจำนวน"
                      >
                        -
                      </button>
                      <span style={styles.qtyDisplay}>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)} 
                        style={{
                          ...styles.qtyBtn,
                          opacity: hasReachedLimit ? 0.35 : 1,
                          cursor: hasReachedLimit ? 'not-allowed' : 'pointer'
                        }}
                        disabled={hasReachedLimit}
                        title={hasReachedLimit ? "เกินจำนวนที่มีในสต็อก" : "เพิ่มจำนวน"}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div style={styles.subtotalCol}>
                    <div style={styles.labelMini}>ราคารวม</div>
                    <div style={styles.subtotalContainer}>
                      <span style={styles.subtotalText}>{(item.subtotal ?? (item.price * item.quantity)).toLocaleString()} บาท</span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromCart(item.productId)} 
                    style={styles.removeBtn}
                    title="ลบออกจากตะกร้า"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Order Summary */}
        <div style={styles.summaryCard}>
          <div style={styles.summarySticky} className="glass-card glow-cyan">
            <h2 style={styles.summaryTitle}>สรุปรายการสั่งซื้อ</h2>
            
            <div style={styles.summaryRow}>
              <span>จำนวนสินค้าทั้งหมด</span>
              <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} ชิ้น</span>
            </div>

            <div style={styles.summaryRow}>
              <span>การจัดส่ง</span>
              <span style={{ color: 'var(--success)', fontWeight: '600' }}>จัดส่งฟรี (Free Shipping)</span>
            </div>

            {/* Real-time Validation Check before checkout */}
            <div style={styles.summaryRow}>
              <span>สถานะการตรวจสอบสต็อก</span>
              {loadingSync ? (
                <span style={{ color: 'var(--warning)', fontWeight: '500' }}>กำลังตรวจสอบ...</span>
              ) : (
                <span style={{ color: 'var(--success)', fontWeight: '600' }}>ยืนยันสต็อกเรียบร้อย ✓</span>
              )}
            </div>

            <div style={styles.divider}></div>

            <div style={styles.totalRow}>
              <span>ยอดชำระสุทธิ</span>
              <span style={styles.totalPriceText}>{cartTotal.toLocaleString()} บาท</span>
            </div>

            <button 
              onClick={handleCheckoutClick} 
              className="btn-neon" 
              style={styles.checkoutBtn}
              disabled={loadingSync}
            >
              {user ? 'ดำเนินการสั่งซื้อ (Checkout) ➜' : 'เข้าสู่ระบบเพื่อดำเนินการสั่งซื้อ'}
            </button>

            <button 
              onClick={() => validateAndSyncCart(true)} 
              style={styles.syncBtn}
              disabled={loadingSync}
            >
              🔄 รีเฟรชเช็คสต็อกอีกครั้ง
            </button>
          </div>
        </div>
      </div>

      {isCheckoutOpen && (
        <CheckoutModal 
          onClose={() => setIsCheckoutOpen(false)} 
          onNavigate={onNavigate}
        />
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
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '2rem',
    borderBottom: '2px solid var(--border-color)',
    paddingBottom: '0.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  pageTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '2rem',
    color: 'var(--text-primary)',
    margin: 0,
  },
  syncIndicator: {
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    fontStyle: 'italic',
  },
  warningContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid var(--warning)',
    borderRadius: '12px',
    padding: '1.25rem',
    marginBottom: '2rem',
  },
  warningHeader: {
    display: 'flex',
    alignItems: 'center',
    color: 'var(--warning)',
    marginBottom: '0.75rem',
  },
  warningList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  warningItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    backgroundColor: 'rgba(12, 19, 14, 0.4)',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    borderLeft: '3px solid var(--warning)',
  },
  dismissBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '1.2rem',
    lineHeight: 1,
    padding: '0 0.2rem',
    transition: 'color 0.2s',
    '&:hover': {
      color: '#fff',
    }
  },
  contentLayout: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  itemsList: {
    flex: '1 1 700px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  itemCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '1.25rem',
    transition: 'all 0.3s ease',
    flexWrap: 'wrap',
  },
  imgWrapper: {
    width: '90px',
    height: '90px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
    flexShrink: 0,
    backgroundColor: '#0C130E',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  itemDetails: {
    flex: '1 1 250px',
  },
  itemName: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.15rem',
    color: 'var(--text-primary)',
    marginBottom: '0.35rem',
  },
  itemPriceDetail: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  highlightText: {
    color: 'var(--primary-glow)',
    fontWeight: '600',
  },
  actionsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
    marginLeft: 'auto',
  },
  quantityCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  labelMini: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  quantityContainer: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    overflow: 'hidden',
    backgroundColor: '#0C130E',
  },
  qtyBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    padding: '0.4rem 0.8rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s, color 0.2s',
    outline: 'none',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.05)',
      color: '#fff',
    }
  },
  qtyDisplay: {
    padding: '0.4rem 0.8rem',
    minWidth: '35px',
    textAlign: 'center',
    color: 'var(--text-primary)',
    borderLeft: '1px solid var(--border-color)',
    borderRight: '1px solid var(--border-color)',
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  subtotalCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    minWidth: '130px',
  },
  subtotalContainer: {
    fontSize: '1rem',
  },
  subtotalText: {
    color: 'var(--secondary-glow)',
    fontWeight: '700',
    fontSize: '1.05rem',
  },
  removeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.3rem',
    padding: '0.5rem',
    transition: 'transform 0.2s ease, opacity 0.2s',
    '&:hover': {
      transform: 'scale(1.15)',
    }
  },
  summaryCard: {
    flex: '1 1 350px',
  },
  summarySticky: {
    position: 'sticky',
    top: '100px',
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
  },
  summaryTitle: {
    fontSize: '1.4rem',
    marginBottom: '1.5rem',
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.5rem',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    marginBottom: '1rem',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '1.5rem 0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.75rem',
  },
  totalPriceText: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.75rem',
    fontWeight: '800',
    color: 'var(--secondary-glow)',
    textShadow: '0 0 10px rgba(245, 158, 11, 0.25)',
  },
  checkoutBtn: {
    width: '100%',
    padding: '1rem',
    fontSize: '1.05rem',
    borderRadius: '10px',
    marginBottom: '0.75rem',
  },
  syncBtn: {
    backgroundColor: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    padding: '0.6rem 1rem',
    fontSize: '0.85rem',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
    '&:hover': {
      border: '1px solid var(--primary-glow)',
      color: 'var(--text-primary)',
    }
  },
  badgeSuccess: {
    display: 'inline-block',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--success)',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
  },
  badgeWarning: {
    display: 'inline-block',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--warning)',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.25)',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
  },
  badgeDanger: {
    display: 'inline-block',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--danger)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
  },
  emptyContainer: {
    textAlign: 'center',
    padding: '5rem 2rem',
    maxWidth: '500px',
    margin: '0 auto',
  },
  emptyIcon: {
    fontSize: '5rem',
    marginBottom: '1.5rem',
    animation: 'pulse 2s infinite ease-in-out',
  },
  emptyTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.85rem',
    marginBottom: '0.75rem',
    color: 'var(--text-primary)',
  },
  emptyText: {
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    fontSize: '0.95rem',
  },
};
