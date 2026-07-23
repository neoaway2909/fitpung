import React from 'react';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.container}>
        {/* Brand Info */}
        <div style={styles.brandCol}>
          <h3 style={styles.brandTitle}>FIT<span style={styles.brandHighlight}>PUNG</span></h3>
          <p style={styles.brandDesc}>
            ยกระดับสุขภาพและการดำเนินชีวิตของคุณด้วยผลิตภัณฑ์พรีเมียมคัดสรรพิเศษเพื่อความสุขและสุขภาพที่ดีอย่างยั่งยืน
          </p>
          <div style={styles.socials}>
            <span style={styles.socialIcon} title="Facebook">📘 Facebook</span>
            <span style={styles.socialIcon} title="Instagram">📸 Instagram</span>
            <span style={styles.socialIcon} title="Twitter">🐦 Twitter</span>
          </div>
        </div>

        {/* Quick Links */}
        <div style={styles.linksCol}>
          <h4 style={styles.colTitle}>เมนูแนะนำ</h4>
          <ul style={styles.linkList}>
            <li><span style={styles.linkLabel}>หน้าแรก / ร้านค้า</span></li>
            <li><span style={styles.linkLabel}>ตะกร้าสินค้า</span></li>
            <li><span style={styles.linkLabel}>ประวัติการสั่งซื้อ</span></li>
          </ul>
        </div>

        {/* Categories */}
        <div style={styles.linksCol}>
          <h4 style={styles.colTitle}>หมวดหมู่สินค้า</h4>
          <ul style={styles.linkList}>
            <li><span style={styles.linkLabel}>อาหารเสริม (Supplements)</span></li>
            <li><span style={styles.linkLabel}>เครื่องดื่มสุขภาพ (Beverages)</span></li>
            <li><span style={styles.linkLabel}>อุปกรณ์ฟิตเนส (Fitness Gear)</span></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div style={styles.brandCol}>
          <h4 style={styles.colTitle}>ติดต่อเรา</h4>
          <p style={styles.contactText}>📍 123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110</p>
          <p style={styles.contactText}>✉️ support@fitpung.com</p>
          <p style={styles.contactText}>📞 02-123-4567</p>
        </div>
      </div>

      {/* Copyright */}
      <div style={styles.copyright}>
        <p style={styles.copyText}>© {new Date().getFullYear()} FITPUNG E-Commerce Co., Ltd. All rights reserved. Designed for Premium Health Care.</p>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: '#00260bff',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '4rem 0 2rem 0',
    color: '#94A3B8',
    fontFamily: 'var(--font-sans)',
    marginTop: 'auto', // Pushes footer to the bottom if container is flex
  },
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '3rem',
    marginBottom: '3rem',
  },
  brandCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  brandTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: '0.05em',
    margin: 0,
  },
  brandHighlight: {
    color: 'var(--primary-glow)',
    textShadow: '0 0 10px rgba(0, 245, 255, 0.3)',
  },
  brandDesc: {
    fontSize: '0.9rem',
    lineHeight: '1.6',
    color: '#64748B',
  },
  socials: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  socialIcon: {
    fontSize: '0.85rem',
    cursor: 'pointer',
    opacity: 0.7,
    transition: 'opacity 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
  },
  linksCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  },
  colTitle: {
    fontFamily: 'var(--font-title)',
    color: '#FFF',
    fontSize: '1.1rem',
    fontWeight: '700',
    margin: 0,
    position: 'relative',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid rgba(0, 245, 255, 0.2)',
    alignSelf: 'flex-start',
  },
  linkList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  },
  linkLabel: {
    color: '#94A3B8',
    fontSize: '0.9rem',
    cursor: 'default',
  },
  contactText: {
    fontSize: '0.9rem',
    lineHeight: '1.6',
    margin: 0,
    color: '#94A3B8',
  },
  copyright: {
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '2rem',
    textAlign: 'center',
  },
  copyText: {
    fontSize: '0.8rem',
    color: '#475569',
    margin: 0,
  },
};
