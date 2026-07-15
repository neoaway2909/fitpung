import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ currentPage, setCurrentPage }) {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  const handleLogout = () => {
    logout();
    setCurrentPage('home');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.logo} onClick={() => setCurrentPage('home')}>
        VITA<span style={styles.logoGlow}>LIFE</span>
      </div>
      
      <div style={styles.menu}>
        <button 
          onClick={() => setCurrentPage('home')} 
          style={{
            ...styles.navBtn,
            ...(currentPage === 'home' || currentPage === 'detail' ? styles.navBtnActive : {})
          }}
        >
          ร้านค้า (Shop)
        </button>

        {user && (
          <button 
            onClick={() => setCurrentPage('orders')} 
            style={{
              ...styles.navBtn,
              ...(currentPage === 'orders' ? styles.navBtnActive : {})
            }}
          >
            คำสั่งซื้อของฉัน (Orders)
          </button>
        )}

        {user && (user.role === 'admin' || user.role === 'staff') && (
          <button 
            onClick={() => setCurrentPage('admin')} 
            style={{
              ...styles.navBtn,
              ...(currentPage === 'admin' ? styles.navBtnActive : {})
            }}
          >
            จัดการหลังร้าน (Admin)
          </button>
        )}

        <button 
          onClick={() => setCurrentPage('cart')} 
          style={{
            ...styles.cartBtn,
            ...(currentPage === 'cart' ? styles.cartBtnActive : {})
          }}
        >
          🛒 ตะกร้าสินค้า
          {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
        </button>

        {user ? (
          <div style={styles.userContainer}>
            <span style={styles.userName}>👤 {user.name || user.username}</span>
            {(user.role === 'admin' || user.role === 'staff') && (
              <span style={styles.roleBadge} onClick={() => setCurrentPage('admin')}>
                {user.role.toUpperCase()}
              </span>
            )}
            <button onClick={handleLogout} style={styles.logoutBtn}>
              ออกจากระบบ
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setCurrentPage('login')} 
            style={styles.loginBtn}
          >
            เข้าสู่ระบบ (Login)
          </button>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.2rem 2rem',
    backgroundColor: 'rgba(12, 19, 14, 0.95)',
    borderBottom: '1px solid var(--border-color)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(10px)',
  },
  logo: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.6rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    letterSpacing: '0.05em',
  },
  logoGlow: {
    color: 'var(--primary-glow)',
    textShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
  },
  menu: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  navBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    padding: '0.5rem 0.8rem',
    borderRadius: '6px',
  },
  navBtnActive: {
    color: 'var(--text-primary)',
    textShadow: '0 0 8px rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  cartBtn: {
    background: 'rgba(21, 34, 25, 0.8)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    position: 'relative',
  },
  cartBtnActive: {
    borderColor: 'var(--primary-glow)',
    boxShadow: 'var(--shadow-neon)',
  },
  cartBadge: {
    backgroundColor: 'var(--secondary-glow)',
    color: '#000',
    fontSize: '0.75rem',
    fontWeight: '700',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    paddingLeft: '1rem',
    borderLeft: '1px solid var(--border-color)',
  },
  userName: {
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  roleBadge: {
    fontSize: '0.75rem',
    padding: '0.2rem 0.5rem',
    backgroundColor: 'var(--secondary-glow)',
    color: '#000',
    borderRadius: '4px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--danger)',
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontWeight: '500',
    padding: '0.2rem 0.5rem',
  },
  loginBtn: {
    backgroundColor: 'var(--primary-glow)',
    color: '#000',
    border: 'none',
    padding: '0.5rem 1.2rem',
    borderRadius: '8px',
    fontWeight: '700',
    fontFamily: 'var(--font-title)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};

