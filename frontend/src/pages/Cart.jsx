import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CheckoutModal from '../components/CheckoutModal';

export default function Cart({ onNavigate }) {
  const { cart, cartTotal, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleCheckoutClick = () => {
    if (!user) {
      onNavigate('login');
    } else {
      setIsCheckoutOpen(true);
    }
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
      <h1 style={styles.pageTitle}>ตะกร้าสินค้า</h1>
      
      <div style={styles.contentLayout}>
        {/* Left Side: Items List */}
        <div style={styles.itemsList}>
          {cart.map((item) => (
            <div key={item.productId} style={styles.itemCard} className="glass-card">
              <div style={styles.itemDetails}>
                <h3 style={styles.itemName}>{item.name}</h3>
                <div style={styles.itemPriceDetail}>
                  ราคาต่อชิ้น: <span style={styles.highlightText}>{item.price.toLocaleString()} บาท</span>
                </div>
              </div>
              
              <div style={styles.actionsContainer}>
                {/* Quantity Editor */}
                <div style={styles.quantityContainer}>
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)} 
                    style={styles.qtyBtn}
                  >
                    -
                  </button>
                  <span style={styles.qtyDisplay}>{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)} 
                    style={styles.qtyBtn}
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <div style={styles.subtotalContainer}>
                  รวม: <span style={styles.subtotalText}>{item.subtotal.toLocaleString()} บาท</span>
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
          ))}
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

            <div style={styles.divider}></div>

            <div style={styles.totalRow}>
              <span>ยอดชำระสุทธิ</span>
              <span style={styles.totalPriceText}>{cartTotal.toLocaleString()} บาท</span>
            </div>

            <button 
              onClick={handleCheckoutClick} 
              className="btn-neon" 
              style={styles.checkoutBtn}
            >
              {user ? 'ดำเนินการสั่งซื้อ (Checkout) ➜' : 'เข้าสู่ระบบเพื่อดำเนินการสั่งซื้อ'}
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
  pageTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '2rem',
    marginBottom: '2rem',
    color: 'var(--text-primary)',
    borderBottom: '2px solid var(--border-color)',
    paddingBottom: '0.5rem',
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
    gap: '1rem',
  },
  itemCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    padding: '1.25rem 1.5rem',
    transition: 'all 0.2s ease',
  },
  itemName: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.15rem',
    color: 'var(--text-primary)',
    marginBottom: '0.25rem',
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
    gap: '1.5rem',
    flexWrap: 'wrap',
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
    background: 'none',
    color: 'var(--text-secondary)',
    padding: '0.4rem 0.8rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.2s',
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
  subtotalContainer: {
    minWidth: '130px',
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
  },
  subtotalText: {
    color: 'var(--secondary-glow)',
    fontWeight: '700',
    fontSize: '1.05rem',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.2rem',
    padding: '0.2rem',
    transition: 'transform 0.2s',
  },
  summaryCard: {
    flex: '1 1 350px',
  },
  summarySticky: {
    position: 'sticky',
    top: '100px',
    padding: '1.5rem',
  },
  summaryTitle: {
    fontSize: '1.3rem',
    marginBottom: '1.5rem',
    color: 'var(--text-primary)',
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
    marginBottom: '1.5rem',
  },
  totalPriceText: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.5rem',
    fontWeight: '800',
    color: 'var(--secondary-glow)',
    textShadow: '0 0 10px rgba(245, 158, 11, 0.2)',
  },
  checkoutBtn: {
    width: '100%',
    padding: '1rem',
    fontSize: '1.05rem',
    borderRadius: '10px',
  },
  emptyContainer: {
    textAlign: 'center',
    padding: '4rem 2rem',
    maxWidth: '500px',
    margin: '0 auto',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  emptyTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.75rem',
    marginBottom: '0.75rem',
    color: 'var(--text-primary)',
  },
  emptyText: {
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    fontSize: '0.95rem',
  },
};

