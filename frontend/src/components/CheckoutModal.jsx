import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../context/AuthContext';

export default function CheckoutModal({ onClose, onNavigate }) {
  const { cart, cartTotal, clearCart } = useCart();
  const { getAuthHeaders } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Shipping Address, 2: Payment, 3: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [shippingAddress, setShippingAddress] = useState({
    recipientName: '',
    phone: '',
    address: '',
    postalCode: '',
  });
  
  const [createdOrder, setCreatedOrder] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit address & create pending order
  const handleConfirmAddress = async (e) => {
    e.preventDefault();
    if (!shippingAddress.recipientName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.postalCode) {
      setError('โปรดกรอกข้อมูลจัดส่งให้ครบถ้วนทุกช่อง');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          items: cart,
          totalPrice: cartTotal,
          shippingAddress,
          paymentMethod: 'PromptPay'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ');
      }

      setCreatedOrder(data.order);
      setStep(2); // Go to payment step
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Simulate payment
  const handleSimulatePayment = async () => {
    if (!createdOrder) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/orders/${createdOrder.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'การจำลองชำระเงินล้มเหลว');
      }

      clearCart();
      setStep(3); // Go to success confirmation
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrders = () => {
    onClose();
    onNavigate('orders');
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modalCard} className="glass-card glow-cyan page-fade-in">
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            {step === 1 && 'ข้อมูลที่อยู่จัดส่ง'}
            {step === 2 && 'ชำระเงินด้วย PromptPay'}
            {step === 3 && 'สั่งซื้อเสร็จสิ้น'}
          </h2>
          {step !== 3 && (
            <button onClick={onClose} style={styles.closeBtn}>×</button>
          )}
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        {/* STEP 1: Shipping Address Form */}
        {step === 1 && (
          <form onSubmit={handleConfirmAddress} style={styles.form}>
            <div style={styles.cartSummaryMini}>
              <h3 style={styles.sectionTitle}>สรุปรายการสั่งซื้อ</h3>
              <div style={styles.summaryItems}>
                {cart.map(item => (
                  <div key={item.productId} style={styles.summaryItemRow}>
                    <span>{item.name} (x{item.quantity})</span>
                    <span>{item.subtotal.toLocaleString()} บาท</span>
                  </div>
                ))}
              </div>
              <div style={styles.summaryTotalRow}>
                <span>ยอดชำระรวม</span>
                <span style={styles.totalText}>{cartTotal.toLocaleString()} บาท</span>
              </div>
            </div>

            <h3 style={styles.sectionTitle}>ที่อยู่จัดส่ง</h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>ชื่อผู้รับ</label>
              <input
                type="text"
                name="recipientName"
                value={shippingAddress.recipientName}
                onChange={handleInputChange}
                placeholder="ชื่อ-นามสกุล ผู้รับพัสดุ"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>เบอร์โทรศัพท์ติดต่อ</label>
              <input
                type="tel"
                name="phone"
                value={shippingAddress.phone}
                onChange={handleInputChange}
                placeholder="เบอร์โทรศัพท์ผู้รับ (เช่น 0891234567)"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>ที่อยู่จัดส่ง</label>
              <textarea
                name="address"
                value={shippingAddress.address}
                onChange={handleInputChange}
                placeholder="บ้านเลขที่, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด"
                style={styles.textarea}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>รหัสไปรษณีย์</label>
              <input
                type="text"
                name="postalCode"
                value={shippingAddress.postalCode}
                onChange={handleInputChange}
                placeholder="รหัสไปรษณีย์ 5 หลัก"
                style={styles.input}
                maxLength="5"
                required
              />
            </div>

            <div style={styles.btnRow}>
              <button type="button" onClick={onClose} style={styles.cancelBtn}>
                ย้อนกลับ
              </button>
              <button type="submit" className="btn-neon" disabled={loading} style={styles.submitBtn}>
                {loading ? 'กำลังบันทึก...' : 'ยืนยันสั่งซื้อและชำระเงิน'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: PromptPay Payment Simulation */}
        {step === 2 && createdOrder && (
          <div style={styles.paymentContainer}>
            <div style={styles.paymentPrompt}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>กรุณาสแกนรหัสเพื่อชำระเงิน</p>
              <h3 style={styles.paymentAmount}>{createdOrder.totalPrice.toLocaleString()} บาท</h3>
            </div>

            {/* PromptPay QR Code Mockup */}
            <div style={styles.qrContainer}>
              <div style={styles.ppHeader}>
                <span style={styles.ppTitle}>พร้อมเพย์ (PromptPay)</span>
              </div>
              <div style={styles.qrBox}>
                {/* Visual grid to simulate a QR Code */}
                <div style={styles.qrGrid}>
                  <div style={styles.qrCorner}></div>
                  <div style={{ flexGrow: 1 }}></div>
                  <div style={styles.qrCorner}></div>
                  <div style={{ width: '100%', height: '20px' }}></div>
                  <div style={styles.qrCenter}></div>
                  <div style={{ width: '100%', height: '20px' }}></div>
                  <div style={styles.qrCorner}></div>
                  <div style={{ flexGrow: 1 }}></div>
                  <div style={styles.qrDot}></div>
                </div>
              </div>
              <div style={styles.ppFooter}>
                <span>FITPUNG WELLNESS E-COMMERCE</span>
              </div>
            </div>

            <div style={styles.paymentAlert}>
              💡 นี่คือการจำลองการชำระเงินของระบบการขาย หากกดปุ่มด้านล่างระบบจะจำลองว่าชำระเงินเสร็จสิ้น
            </div>

            <button 
              onClick={handleSimulatePayment} 
              className="btn-neon" 
              disabled={loading}
              style={{ ...styles.submitBtn, width: '100%', padding: '1rem' }}
            >
              {loading ? 'กำลังส่งข้อมูลชำระเงิน...' : 'ชำระเงินสำเร็จ (Simulate Payment)'}
            </button>
          </div>
        )}

        {/* STEP 3: Success Confirmation */}
        {step === 3 && (
          <div style={styles.successContainer}>
            <div style={styles.successIcon}>✓</div>
            <h3 style={styles.successTitle}>สั่งซื้อและชำระเงินสำเร็จ!</h3>
            <p style={styles.successText}>คำสั่งซื้อของคุณได้รับการยืนยันและชำระเงินเรียบร้อยแล้ว พนักงานจะเร่งตรวจสอบและเตรียมจัดส่งให้คุณโดยเร็วที่สุด</p>
            
            {createdOrder && (
              <div style={styles.orderIdBadge}>
                รหัสคำสั่งซื้อ: <strong style={{ color: 'var(--primary-glow)' }}>{createdOrder.id}</strong>
              </div>
            )}

            <button 
              onClick={handleViewOrders} 
              className="btn-neon"
              style={{ marginTop: '1.5rem', width: '100%' }}
            >
              ไปที่หน้า "คำสั่งซื้อของฉัน"
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 8, 6, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modalCard: {
    width: '100%',
    maxWidth: '560px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '2rem',
    borderRadius: '16px',
    backgroundColor: 'var(--bg-card)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.8rem',
  },
  modalTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.4rem',
    color: 'var(--text-primary)',
  },
  closeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '1.8rem',
    cursor: 'pointer',
    padding: '0 0.5rem',
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: 'var(--danger)',
    border: '1px solid var(--danger)',
    padding: '0.8rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  cartSummaryMini: {
    backgroundColor: 'rgba(12, 19, 14, 0.6)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '0.5rem',
  },
  sectionTitle: {
    fontSize: '1rem',
    color: 'var(--text-primary)',
    marginBottom: '0.8rem',
    fontFamily: 'var(--font-title)',
    borderLeft: '3px solid var(--primary-glow)',
    paddingLeft: '0.5rem',
  },
  summaryItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    maxHeight: '120px',
    overflowY: 'auto',
    paddingRight: '0.5rem',
  },
  summaryItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  summaryTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.8rem',
    borderTop: '1px dashed var(--border-color)',
    paddingTop: '0.6rem',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
  },
  totalText: {
    color: 'var(--secondary-glow)',
    fontSize: '1.1rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(12, 19, 14, 0.8)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    padding: '0.75rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  textarea: {
    backgroundColor: 'rgba(12, 19, 14, 0.8)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    padding: '0.75rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    outline: 'none',
    minHeight: '80px',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  btnRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    padding: '0.75rem',
    transition: 'all 0.2s',
  },
  submitBtn: {
    flex: 1,
  },
  paymentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
  },
  paymentPrompt: {
    textAlign: 'center',
  },
  paymentAmount: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: 'var(--secondary-glow)',
    fontFamily: 'var(--font-title)',
  },
  qrContainer: {
    backgroundColor: '#fff',
    color: '#000',
    width: '260px',
    borderRadius: '12px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
  },
  ppHeader: {
    backgroundColor: '#0F2C59',
    color: '#fff',
    width: '100%',
    textAlign: 'center',
    padding: '0.4rem 0',
    borderRadius: '6px 6px 0 0',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  ppTitle: {
    letterSpacing: '0.05em',
  },
  qrBox: {
    width: '160px',
    height: '160px',
    backgroundColor: '#eee',
    padding: '10px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrGrid: {
    width: '100%',
    height: '100%',
    border: '2px solid #000',
    padding: '8px',
    position: 'relative',
    display: 'flex',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
  },
  qrCorner: {
    width: '32px',
    height: '32px',
    border: '5px solid #000',
    backgroundColor: 'transparent',
  },
  qrCenter: {
    position: 'absolute',
    top: '50px',
    left: '50px',
    width: '40px',
    height: '40px',
    backgroundColor: '#000',
    borderRadius: '4px',
  },
  qrDot: {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    width: '16px',
    height: '16px',
    backgroundColor: '#000',
  },
  ppFooter: {
    marginTop: '1rem',
    fontSize: '0.65rem',
    color: '#666',
    fontWeight: 'bold',
  },
  paymentAlert: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    border: '1px solid var(--warning)',
    color: 'var(--warning)',
    padding: '0.8rem 1rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    lineHeight: '1.4',
    textAlign: 'center',
  },
  successContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '1rem 0',
  },
  successIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    border: '2px solid var(--primary-glow)',
    color: 'var(--primary-glow)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    boxShadow: 'var(--shadow-neon)',
  },
  successTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.5rem',
    color: 'var(--text-primary)',
    marginBottom: '0.8rem',
  },
  successText: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    lineHeight: '1.6',
    maxWidth: '400px',
    marginBottom: '1.5rem',
  },
  orderIdBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid var(--border-color)',
    padding: '0.6rem 1.2rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
  },
};
