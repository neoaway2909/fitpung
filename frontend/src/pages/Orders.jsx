import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Orders() {
  const { user, getAuthHeaders } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:5001/api/orders', {
          headers: getAuthHeaders(),
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'ไม่สามารถดึงข้อมูลคำสั่งซื้อได้');
        }
        
        // Sort orders by date descending
        const sortedOrders = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const cancelOrder = async (orderId) => {
    if (!window.confirm('คุณต้องการยกเลิกคำสั่งซื้อนี้ใช่หรือไม่?\n\nหากชำระเงินแล้ว ระบบจะดำเนินการคืนเงินให้ตามช่องทางที่ชำระ (จำลอง)')) return;

    try {
      const response = await fetch(`http://localhost:5001/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'เกิดข้อผิดพลาดในการยกเลิกคำสั่งซื้อ');
      }
      
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
      alert('ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว');
    } catch (err) {
      alert(err.message);
    }
  };

  if (!user) {
    return (
      <div style={styles.centerContainer} className="page-fade-in">
        <h2>กรุณาเข้าสู่ระบบ</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          เพื่อดูประวัติการสั่งซื้อและติดตามสถานะจัดส่งสินค้าของคุณ
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.centerContainer} className="page-fade-in">
        <p>กำลังโหลดข้อมูลคำสั่งซื้อของคุณ...</p>
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

  if (orders.length === 0) {
    return (
      <div style={styles.centerContainer} className="page-fade-in">
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
        <h2>ยังไม่มีรายการสั่งซื้อ</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          เริ่มเลือกซื้อสินค้าสุขภาพพรีเมียมของเราได้ทันทีที่หน้าหลัก
        </p>
      </div>
    );
  }

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Pending':
        return styles.badgePending;
      case 'Paid':
        return styles.badgePaid;
      case 'Shipped':
        return styles.badgeShipped;
      case 'Delivered':
        return styles.badgeDelivered;
      case 'Cancelled':
        return styles.badgeCancelled;
      default:
        return styles.badgeDefault;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Pending':
        return 'รอชำระเงิน';
      case 'Paid':
        return 'ชำระเงินแล้ว';
      case 'Shipped':
        return 'กำลังจัดส่ง';
      case 'Delivered':
        return 'จัดส่งสำเร็จ';
      case 'Cancelled':
        return 'ยกเลิกคำสั่งซื้อ';
      default:
        return status;
    }
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543} เวลา ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} น.`;
  };

  return (
    <div style={styles.container} className="page-fade-in">
      <h1 style={styles.pageTitle}>คำสั่งซื้อของฉัน</h1>
      
      <div style={styles.ordersList}>
        {orders.map((order) => (
          <div key={order.id} style={styles.orderCard} className="glass-card">
            {/* Header: ID, Date, Status */}
            <div style={styles.orderHeader}>
              <div>
                <span style={styles.orderLabel}>รหัสคำสั่งซื้อ:</span>
                <span style={styles.orderId}> {order.id}</span>
                <div style={styles.orderDate}>{formatDate(order.createdAt)}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <div style={getStatusBadgeStyle(order.status)}>
                  {getStatusText(order.status)}
                </div>
                {(order.status === 'Pending' || order.status === 'Paid') && (
                  <button 
                    onClick={() => cancelOrder(order.id)}
                    style={styles.cancelBtn}
                    className="cancel-btn-hover"
                  >
                    ยกเลิกคำสั่งซื้อ
                  </button>
                )}
              </div>
            </div>

            {/* List of items */}
            <div style={styles.itemsSection}>
              <h4 style={styles.sectionTitle}>รายการสินค้า</h4>
              {order.items.map((item, idx) => (
                <div key={idx} style={styles.itemRow}>
                  <div style={styles.itemName}>{item.name}</div>
                  <div style={styles.itemPriceQty}>
                    {item.price.toLocaleString()} บาท x {item.quantity}
                  </div>
                  <div style={styles.itemSubtotal}>
                    {item.subtotal.toLocaleString()} บาท
                  </div>
                </div>
              ))}
            </div>

            {/* Summary & Shipping details */}
            <div style={styles.detailsGrid}>
              {/* Shipping Address */}
              <div style={styles.detailsBlock}>
                <h4 style={styles.sectionTitle}>ที่อยู่สำหรับจัดส่ง</h4>
                <div style={styles.detailsText}>
                  <strong>ผู้รับ:</strong> {order.shippingAddress.recipientName}
                </div>
                <div style={styles.detailsText}>
                  <strong>โทรศัพท์:</strong> {order.shippingAddress.phone}
                </div>
                <div style={styles.detailsText}>
                  <strong>ที่อยู่:</strong> {order.shippingAddress.address} {order.shippingAddress.postalCode}
                </div>
              </div>

              {/* Status and Total */}
              <div style={styles.detailsBlock}>
                <h4 style={styles.sectionTitle}>ข้อมูลจัดส่งและยอดรวม</h4>
                <div style={styles.detailsText}>
                  <strong>วิธีการชำระเงิน:</strong> {order.paymentMethod}
                </div>
                <div style={styles.detailsText}>
                  <strong>เลขพัสดุ:</strong>{' '}
                  {order.trackingNumber ? (
                    <span style={styles.trackingNo}>{order.trackingNumber}</span>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      {order.status === 'Paid' ? 'กำลังเตรียมการจัดส่ง' : 'รอชำระเงิน'}
                    </span>
                  )}
                </div>
                <div style={styles.totalBlock}>
                  ยอดสั่งซื้อสุทธิ:{' '}
                  <span style={{
                    ...styles.totalPriceText,
                    textDecoration: order.status === 'Cancelled' ? 'line-through' : 'none',
                    color: order.status === 'Cancelled' ? 'var(--text-secondary)' : 'var(--secondary-glow)'
                  }}>
                    {order.totalPrice.toLocaleString()} บาท
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem 1rem',
    maxWidth: '900px',
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
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  orderCard: {
    padding: '1.5rem',
    transition: 'all 0.2s ease',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  orderLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  orderId: {
    fontFamily: 'var(--font-title)',
    fontWeight: '700',
    color: 'var(--primary-glow)',
  },
  orderDate: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    marginTop: '0.2rem',
  },
  // Status Badges
  badgePending: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    color: 'var(--warning)',
    border: '1px solid var(--warning)',
    padding: '0.4rem 0.8rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  badgePaid: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    color: 'var(--success)',
    border: '1px solid var(--success)',
    padding: '0.4rem 0.8rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '600',
    boxShadow: '0 0 5px rgba(16, 185, 129, 0.2)',
  },
  badgeShipped: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    color: '#60A5FA',
    border: '1px solid #3B82F6',
    padding: '0.4rem 0.8rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  badgeDelivered: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    color: 'var(--success)',
    border: '1px dashed var(--success)',
    padding: '0.4rem 0.8rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  badgeCancelled: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    color: 'var(--danger)',
    border: '1px solid var(--danger)',
    padding: '0.4rem 0.8rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  badgeDefault: {
    backgroundColor: '#374151',
    color: '#9CA3AF',
    padding: '0.4rem 0.8rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  itemsSection: {
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '0.95rem',
    color: 'var(--text-primary)',
    marginBottom: '0.6rem',
    borderLeft: '2px solid var(--primary-glow)',
    paddingLeft: '0.5rem',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    borderBottom: '1px dashed rgba(255, 255, 255, 0.05)',
    fontSize: '0.9rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  itemName: {
    flex: '1 1 300px',
    color: 'var(--text-primary)',
  },
  itemPriceQty: {
    color: 'var(--text-secondary)',
    marginRight: '1rem',
  },
  itemSubtotal: {
    fontWeight: '600',
    color: 'var(--text-primary)',
    minWidth: '100px',
    textAlign: 'right',
  },
  detailsGrid: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(12, 19, 14, 0.4)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '1rem',
  },
  detailsBlock: {
    flex: '1 1 300px',
  },
  detailsText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    marginBottom: '0.3rem',
  },
  trackingNo: {
    color: 'var(--primary-glow)',
    fontWeight: '700',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },
  totalBlock: {
    marginTop: '1rem',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    textAlign: 'right',
    color: 'var(--text-primary)',
  },
  totalPriceText: {
    color: 'var(--secondary-glow)',
    fontSize: '1.2rem',
    fontWeight: '800',
    marginLeft: '0.5rem',
  },
  cancelBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid var(--danger)',
    color: 'var(--danger)',
    padding: '0.3rem 0.6rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
};
