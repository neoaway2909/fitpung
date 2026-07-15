import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Admin() {
  const { user, getAuthHeaders } = useAuth();
  
  // Tab management
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data lists
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Search filters
  const [orderSearch, setOrderSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  
  // Editing Order State
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [trackingNumInput, setTrackingNumInput] = useState('');
  const [statusInput, setStatusInput] = useState('');
  
  // Add/Edit Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = add new, object = edit
  const [prodForm, setProdForm] = useState({
    name: '',
    category: 'Supplement',
    price: '',
    stock: '',
    image: '',
    description: '',
    manufacturer: '',
    weight: '',
    materials: '',
    warranty: ''
  });

  // Add User Modal State
  const [showUserModal, setShowUserModal] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userSubTab, setUserSubTab] = useState('staff'); // 'staff' or 'customer'
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    email: '',
    name: '',
    role: 'staff'
  });
  
  // Performance Test State
  const [perfConcurrent, setPerfConcurrent] = useState(5);
  const [perfTotalReqs, setPerfTotalReqs] = useState(50);
  const [perfTarget, setPerfTarget] = useState('/products');
  const [perfRunning, setPerfRunning] = useState(false);
  const [perfProgress, setPerfProgress] = useState(0);
  const [perfResults, setPerfResults] = useState(null);

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      
      // Fetch products, orders, and users
      const [resProducts, resOrders, resUsers] = await Promise.all([
        fetch('http://localhost:5001/api/products'),
        fetch('http://localhost:5001/api/orders', { headers }),
        fetch('http://localhost:5001/api/admin/users', { headers })
      ]);
      
      if (!resProducts.ok || !resOrders.ok || !resUsers.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลระบบได้ครบถ้วน กรุณาตรวจสอบสิทธิ์การใช้งาน');
      }
      
      const dataProducts = await resProducts.json();
      const dataOrders = await resOrders.json();
      const dataUsers = await resUsers.json();
      
      setProducts(dataProducts);
      setOrders(dataOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setUsers(dataUsers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerSuccessMsg = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Order Actions
  const handleEditOrderClick = (order) => {
    setEditingOrderId(order.id);
    setStatusInput(order.status);
    setTrackingNumInput(order.trackingNumber || '');
  };

  const handleSaveOrder = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          status: statusInput,
          trackingNumber: trackingNumInput
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'ไม่สามารถแก้ไขคำสั่งซื้อได้');
      
      triggerSuccessMsg('อัปเดตสถานะคำสั่งซื้อเรียบร้อยแล้ว!');
      setEditingOrderId(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Product Actions (Quick Stock Adjust)
  const adjustStock = async (product, delta) => {
    const newStock = Math.max(0, product.stock + delta);
    try {
      const response = await fetch(`http://localhost:5001/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ stock: newStock })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'ไม่สามารถปรับสต็อกได้');
      
      triggerSuccessMsg(`ปรับสต็อกสินค้า ${product.name} สำเร็จ!`);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบสินค้าชิ้นนี้?')) return;
    try {
      const response = await fetch(`http://localhost:5001/api/products/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'ไม่สามารถลบสินค้าได้');
      
      triggerSuccessMsg('ลบสินค้าออกจากระบบสำเร็จ!');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdForm({
      name: '',
      category: 'Supplement',
      price: '',
      stock: '',
      image: '',
      description: '',
      manufacturer: '',
      weight: '',
      materials: '',
      warranty: ''
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (product) => {
    setEditingProduct(product);
    setProdForm({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      image: product.image,
      description: product.description,
      manufacturer: product.specs?.manufacturer || '',
      weight: product.specs?.weight || '',
      materials: product.specs?.materials || '',
      warranty: product.specs?.warranty || ''
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const payload = {
      name: prodForm.name,
      category: prodForm.category,
      price: Number(prodForm.price),
      stock: Number(prodForm.stock),
      image: prodForm.image,
      description: prodForm.description,
      specs: {
        manufacturer: prodForm.manufacturer,
        weight: prodForm.weight,
        materials: prodForm.materials,
        warranty: prodForm.warranty
      }
    };

    try {
      let response;
      if (editingProduct) {
        // Edit product
        response = await fetch(`http://localhost:5001/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Add new product
        response = await fetch('http://localhost:5001/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'ไม่สามารถบันทึกข้อมูลสินค้าได้');
      
      triggerSuccessMsg(editingProduct ? 'แก้ไขข้อมูลสินค้าสำเร็จ!' : 'เพิ่มสินค้าใหม่เข้าระบบสำเร็จ!');
      setShowProductModal(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // User Actions
  const handleOpenAddUser = () => {
    setUserForm({
      username: '',
      password: '',
      email: '',
      name: '',
      role: 'staff'
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(userForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'ไม่สามารถเพิ่มผู้ใช้งานได้');
      
      triggerSuccessMsg(`เพิ่มบัญชีสำหรับ ${data.user.name} เรียบร้อยแล้ว!`);
      setShowUserModal(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (userToDelete) => {
    if (userToDelete.id === user.id) {
      alert('ไม่สามารถลบบัญชีของตนเองได้');
      return;
    }
    if (userToDelete.id === 'u1') {
      alert('ไม่สามารถลบบัญชีผู้ดูแลระบบหลัก (System Administrator) ได้');
      return;
    }
    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบบัญชีผู้ใช้ของ ${userToDelete.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'ไม่สามารถลบผู้ใช้งานได้');

      triggerSuccessMsg(`ลบบัญชีผู้ใช้ ${userToDelete.name} เรียบร้อยแล้ว!`);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Performance QA Benchmarker
  const runPerformanceQA = async () => {
    setPerfRunning(true);
    setPerfProgress(0);
    setPerfResults(null);
    
    const targetUrl = perfTarget === '/products' 
      ? 'http://localhost:5001/api/products'
      : 'http://localhost:5001/api/orders';
      
    const headers = getAuthHeaders();
    const startTime = performance.now();
    let completed = 0;
    let errors = 0;
    const latencies = [];
    
    // Process queue in batches with custom concurrency
    const runWorker = async () => {
      while (completed < perfTotalReqs) {
        const index = completed++;
        setPerfProgress(Math.round((completed / perfTotalReqs) * 100));
        
        const reqStart = performance.now();
        try {
          const res = await fetch(targetUrl, { headers });
          const reqEnd = performance.now();
          latencies.push(reqEnd - reqStart);
          if (!res.ok) errors++;
        } catch (err) {
          errors++;
          latencies.push(performance.now() - reqStart);
        }
      }
    };

    // Create concurrent workers
    const workers = [];
    for (let i = 0; i < Math.min(perfConcurrent, perfTotalReqs); i++) {
      workers.push(runWorker());
    }

    await Promise.all(workers);

    const endTime = performance.now();
    const totalDurationMs = endTime - startTime;
    const totalDurationSec = totalDurationMs / 1000;
    const rps = totalDurationSec > 0 ? (latencies.length / totalDurationSec) : 0;
    
    const sum = latencies.reduce((a, b) => a + b, 0);
    const avg = latencies.length > 0 ? (sum / latencies.length) : 0;
    const min = latencies.length > 0 ? Math.min(...latencies) : 0;
    const max = latencies.length > 0 ? Math.max(...latencies) : 0;

    // Calculate throughput bands
    setPerfResults({
      totalRequests: latencies.length,
      successRequests: latencies.length - errors,
      errorCount: errors,
      totalTimeMs: totalDurationMs,
      avgLatencyMs: avg,
      minLatencyMs: min,
      maxLatencyMs: max,
      rps: rps,
      latencies: latencies
    });
    setPerfRunning(false);
  };

  // Calculations for Dashboard Metrics
  const calculatedMetrics = () => {
    const totalSales = orders
      .filter(o => o.status === 'Paid' || o.status === 'Shipped' || o.status === 'Delivered')
      .reduce((sum, o) => sum + o.totalPrice, 0);
    
    const categorySales = {};
    orders
      .filter(o => o.status === 'Paid' || o.status === 'Shipped' || o.status === 'Delivered')
      .forEach(o => {
        o.items.forEach(item => {
          const prod = products.find(p => p.id === item.productId);
          const cat = prod?.category || 'General';
          categorySales[cat] = (categorySales[cat] || 0) + item.subtotal;
        });
      });

    return {
      totalSales,
      ordersCount: orders.length,
      pendingOrders: orders.filter(o => o.status === 'Pending').length,
      productsCount: products.length,
      usersCount: users.length,
      categorySales
    };
  };

  if (loading && activeTab !== 'performance') {
    return (
      <div style={styles.centerContainer} className="page-fade-in">
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>กำลังโหลดข้อมูลแดชบอร์ดแอดมิน...</p>
      </div>
    );
  }

  const metrics = calculatedMetrics();

  return (
    <div style={styles.container} className="page-fade-in">
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>แผงควบคุมผู้ดูแลระบบ (Admin Panel)</h1>
          <p style={styles.subtitle}>
            สวัสดีคุณ <strong style={{ color: 'var(--primary-glow)' }}>{user?.name || user?.username}</strong> ({user?.role?.toUpperCase()})
          </p>
        </div>
        
        {successMsg && (
          <div style={styles.successNotification}>
            ✨ {successMsg}
          </div>
        )}
      </header>

      {/* Tabs */}
      <div style={styles.tabBar}>
        <button 
          onClick={() => setActiveTab('dashboard')} 
          style={{
            ...styles.tabBtn,
            borderBottomColor: activeTab === 'dashboard' ? 'var(--primary-glow)' : 'transparent',
            color: activeTab === 'dashboard' ? 'var(--primary-glow)' : 'var(--text-secondary)',
            backgroundColor: activeTab === 'dashboard' ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
          }}
        >
          📊 ภาพรวม (Overview)
        </button>
        <button 
          onClick={() => setActiveTab('orders')} 
          style={{
            ...styles.tabBtn,
            borderBottomColor: activeTab === 'orders' ? 'var(--primary-glow)' : 'transparent',
            color: activeTab === 'orders' ? 'var(--primary-glow)' : 'var(--text-secondary)',
            backgroundColor: activeTab === 'orders' ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
          }}
        >
          📦 จัดการคำสั่งซื้อ ({orders.length})
        </button>
        <button 
          onClick={() => setActiveTab('products')} 
          style={{
            ...styles.tabBtn,
            borderBottomColor: activeTab === 'products' ? 'var(--primary-glow)' : 'transparent',
            color: activeTab === 'products' ? 'var(--primary-glow)' : 'var(--text-secondary)',
            backgroundColor: activeTab === 'products' ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
          }}
        >
          🥑 คลังสินค้า ({products.length})
        </button>
        {user?.role === 'admin' && (
          <button 
            onClick={() => setActiveTab('users')} 
            style={{
              ...styles.tabBtn,
              borderBottomColor: activeTab === 'users' ? 'var(--primary-glow)' : 'transparent',
              color: activeTab === 'users' ? 'var(--primary-glow)' : 'var(--text-secondary)',
              backgroundColor: activeTab === 'users' ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
            }}
          >
            👥 จัดการพนักงาน ({users.length})
          </button>
        )}
        <button 
          onClick={() => setActiveTab('performance')} 
          style={{
            ...styles.tabBtn,
            borderBottomColor: activeTab === 'performance' ? 'var(--primary-glow)' : 'transparent',
            color: activeTab === 'performance' ? 'var(--primary-glow)' : 'var(--text-secondary)',
            backgroundColor: activeTab === 'performance' ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
          }}
        >
          ⚡ Performance QA Tester
        </button>
      </div>

      {/* ERROR DISPLAY */}
      {error && (
        <div style={styles.errorAlert}>
          ⚠️ <strong>เกิดข้อผิดพลาด:</strong> {error}
          <button style={styles.retryBtn} onClick={fetchData}>โหลดใหม่</button>
        </div>
      )}

      {/* TAB CONTENTS */}

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'dashboard' && !error && (
        <div style={styles.tabContent}>
          {/* Metrics Grid */}
          <div style={styles.metricsGrid}>
            <div className="glass-card" style={styles.metricCard}>
              <div style={styles.metricHeader}>
                <span style={styles.metricLabel}>ยอดขายที่เสร็จสิ้น</span>
                <span style={{ fontSize: '1.5rem' }}>💰</span>
              </div>
              <div style={styles.metricVal}>{metrics.totalSales.toLocaleString()} ฿</div>
              <div style={styles.metricFooter}>คำนวณจากออเดอร์ที่จ่ายแล้วขึ้นไป</div>
            </div>

            <div className="glass-card" style={styles.metricCard}>
              <div style={styles.metricHeader}>
                <span style={styles.metricLabel}>คำสั่งซื้อทั้งหมด</span>
                <span style={{ fontSize: '1.5rem' }}>📦</span>
              </div>
              <div style={styles.metricVal}>{metrics.ordersCount} ออเดอร์</div>
              <div style={styles.metricFooter}>
                <span style={{ color: 'var(--warning)' }}>รอชำระเงิน {metrics.pendingOrders}</span>
              </div>
            </div>

            <div className="glass-card" style={styles.metricCard}>
              <div style={styles.metricHeader}>
                <span style={styles.metricLabel}>สินค้าในระบบ</span>
                <span style={{ fontSize: '1.5rem' }}>🍏</span>
              </div>
              <div style={styles.metricVal}>{metrics.productsCount} รายการ</div>
              <div style={styles.metricFooter}>พร้อมจัดจำหน่ายทางหน้าเว็บ</div>
            </div>

            <div className="glass-card" style={styles.metricCard}>
              <div style={styles.metricHeader}>
                <span style={styles.metricLabel}>สมาชิกทั้งหมด</span>
                <span style={{ fontSize: '1.5rem' }}>👤</span>
              </div>
              <div style={styles.metricVal}>{metrics.usersCount} บัญชี</div>
              <div style={styles.metricFooter}>ลูกค้า {users.filter(u => u.role === 'customer').length} | แอดมิน/สตาฟ {users.filter(u => u.role !== 'customer').length}</div>
            </div>
          </div>

          <div style={styles.chartsAndRecentGrid}>
            {/* Sales Chart (SVG representation) */}
            <div className="glass-card" style={styles.chartContainer}>
              <h3 style={styles.sectionHeading}>📊 ยอดขายแยกตามหมวดหมู่ (Category Sales)</h3>
              <div style={{ marginTop: '1.5rem' }}>
                {Object.keys(metrics.categorySales).length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                    ยังไม่มียอดขายที่จะนำมาแสดงสถิติ
                  </p>
                ) : (
                  Object.entries(metrics.categorySales).map(([cat, total]) => {
                    const maxVal = Math.max(...Object.values(metrics.categorySales));
                    const widthPercent = maxVal > 0 ? (total / maxVal) * 100 : 0;
                    return (
                      <div key={cat} style={styles.chartRow}>
                        <div style={styles.chartLabel}>{cat}</div>
                        <div style={styles.chartBarWrapper}>
                          <div style={{ ...styles.chartBar, width: `${widthPercent}%` }}></div>
                          <span style={styles.chartBarText}>{total.toLocaleString()} ฿</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="glass-card" style={styles.recentOrdersContainer}>
              <h3 style={styles.sectionHeading}>🕒 คำสั่งซื้อล่าสุด (Recent Orders)</h3>
              <div style={styles.recentOrdersList}>
                {orders.slice(0, 5).map(o => (
                  <div key={o.id} style={styles.recentOrderRow}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>{o.id}</strong>
                      <div style={styles.recentOrderDate}>
                        {new Date(o.createdAt).toLocaleDateString('th-TH')} - {o.shippingAddress.recipientName}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{o.totalPrice.toLocaleString()} ฿</span>
                      <span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                    ไม่มีคำสั่งซื้อล่าสุด
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDER MANAGEMENT */}
      {activeTab === 'orders' && !error && (
        <div style={styles.tabContent}>
          <div style={styles.filterSection}>
            <input 
              type="text" 
              placeholder="🔍 ค้นหารหัสออเดอร์, ชื่อลูกค้า, หรือสถานะ..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.tableWrapper} className="glass-card">
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>รหัสออเดอร์</th>
                  <th style={styles.th}>ลูกค้า/ผู้รับ</th>
                  <th style={styles.th}>รายการสินค้า</th>
                  <th style={styles.th}>ราคารวม</th>
                  <th style={styles.th}>สถานะ</th>
                  <th style={styles.th}>เลขพัสดุ</th>
                  <th style={styles.th}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {orders
                  .filter(o => 
                    o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                    o.shippingAddress.recipientName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                    o.status.toLowerCase().includes(orderSearch.toLowerCase())
                  )
                  .map(o => {
                    const isEditing = editingOrderId === o.id;
                    return (
                      <tr key={o.id} style={styles.tr}>
                        <td style={styles.td}>
                          <span style={{ fontFamily: 'var(--font-title)', fontWeight: '600' }}>{o.id}</span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {new Date(o.createdAt).toLocaleString('th-TH')}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div><strong>{o.shippingAddress.recipientName}</strong></div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>📞 {o.shippingAddress.phone}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📍 {o.shippingAddress.address}</div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontSize: '0.85rem' }}>
                            {o.items.map((item, idx) => (
                              <div key={idx}>• {item.name} x {item.quantity}</div>
                            ))}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <strong style={{ color: 'var(--primary-glow)' }}>{o.totalPrice.toLocaleString()} ฿</strong>
                        </td>
                        <td style={styles.td}>
                          {isEditing ? (
                            <select 
                              value={statusInput} 
                              onChange={(e) => setStatusInput(e.target.value)}
                              style={styles.selectInput}
                            >
                              <option value="Pending">Pending (รอชำระเงิน)</option>
                              <option value="Paid">Paid (ชำระแล้ว)</option>
                              <option value="Shipped">Shipped (จัดส่งแล้ว)</option>
                              <option value="Delivered">Delivered (สำเร็จ)</option>
                              <option value="Cancelled">Cancelled (ยกเลิก)</option>
                            </select>
                          ) : (
                            <span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={trackingNumInput} 
                              onChange={(e) => setTrackingNumInput(e.target.value)} 
                              placeholder="เลขพัสดุ tracking"
                              style={styles.inlineTextInput}
                            />
                          ) : (
                            <span>{o.trackingNumber || '-'}</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          {isEditing ? (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => handleSaveOrder(o.id)} style={styles.btnSave}>บันทึก</button>
                              <button onClick={() => setEditingOrderId(null)} style={styles.btnCancel}>ยกเลิก</button>
                            </div>
                          ) : (
                            <button onClick={() => handleEditOrderClick(o)} style={styles.btnEdit}>แก้ไข</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INVENTORY MANAGEMENT */}
      {activeTab === 'products' && !error && (
        <div style={styles.tabContent}>
          <div style={styles.filterSection}>
            <input 
              type="text" 
              placeholder="🔍 ค้นหาสินค้า หรือ หมวดหมู่..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              style={styles.searchInput}
            />
            <button onClick={handleOpenAddProduct} style={styles.btnAddProduct}>
              ➕ เพิ่มสินค้าใหม่
            </button>
          </div>

          <div style={styles.tableWrapper} className="glass-card">
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>รูปภาพ</th>
                  <th style={styles.th}>ชื่อสินค้า</th>
                  <th style={styles.th}>หมวดหมู่</th>
                  <th style={styles.th}>ราคา</th>
                  <th style={styles.th}>สต็อกคงเหลือ</th>
                  <th style={styles.th}>ผู้ผลิต & การรับรอง</th>
                  <th style={styles.th}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .filter(p => 
                    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                    p.category.toLowerCase().includes(productSearch.toLowerCase())
                  )
                  .map(p => (
                    <tr key={p.id} style={styles.tr}>
                      <td style={styles.td}>
                        <img src={p.image} alt={p.name} style={styles.productThumbnail} />
                      </td>
                      <td style={styles.td}>
                        <strong>{p.name}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.description}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.categoryBadge}>{p.category}</span>
                      </td>
                      <td style={styles.td}>
                        <strong>{p.price.toLocaleString()} ฿</strong>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button onClick={() => adjustStock(p, -1)} style={styles.stockBtn}>-</button>
                          <span style={{ 
                            fontWeight: '700', 
                            color: p.stock === 0 ? 'var(--danger)' : p.stock < 5 ? 'var(--warning)' : 'var(--text-primary)' 
                          }}>
                            {p.stock}
                          </span>
                          <button onClick={() => adjustStock(p, 1)} style={styles.stockBtn}>+</button>
                        </div>
                        {p.stock === 0 && <div style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>สินค้าหมดสต็อก!</div>}
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontSize: '0.8rem' }}>🏢 {p.specs?.manufacturer || '-'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>🛡️ {p.specs?.warranty || '-'}</div>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleOpenEditProduct(p)} style={styles.btnEdit}>แก้ไข</button>
                          <button onClick={() => handleDeleteProduct(p.id)} style={styles.btnDelete}>ลบ</button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: USER/STAFF MANAGEMENT (Admin only) */}
      {activeTab === 'users' && user?.role === 'admin' && !error && (
        <div style={styles.tabContent}>
          {/* Sub Tabs */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.8rem' }}>
            <button 
              onClick={() => { setUserSubTab('staff'); setUserSearch(''); }}
              style={{
                backgroundColor: userSubTab === 'staff' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                border: 'none',
                color: userSubTab === 'staff' ? 'var(--primary-glow)' : 'var(--text-secondary)',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              💼 พนักงาน & แอดมิน ({users.filter(u => u.role !== 'customer').length})
            </button>
            <button 
              onClick={() => { setUserSubTab('customer'); setUserSearch(''); }}
              style={{
                backgroundColor: userSubTab === 'customer' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                border: 'none',
                color: userSubTab === 'customer' ? 'var(--primary-glow)' : 'var(--text-secondary)',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              👥 ลูกค้า ({users.filter(u => u.role === 'customer').length})
            </button>
          </div>

          <div style={styles.filterSection}>
            <input 
              type="text" 
              placeholder={userSubTab === 'staff' ? "🔍 ค้นหาชื่อพนักงาน, username, หรืออีเมล..." : "🔍 ค้นหาชื่อลูกค้า, username, หรืออีเมล..."}
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              style={styles.searchInput}
            />
            {userSubTab === 'staff' && (
              <button onClick={handleOpenAddUser} style={styles.btnAddProduct}>
                👥 ➕ เพิ่มพนักงานใหม่
              </button>
            )}
          </div>

          <div style={styles.tableWrapper} className="glass-card">
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Username</th>
                  <th style={styles.th}>ชื่อผู้ใช้งาน</th>
                  <th style={styles.th}>อีเมล</th>
                  <th style={styles.th}>บทบาท (Role)</th>
                  <th style={styles.th}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter(u => {
                    const matchesSearch = u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                      u.email.toLowerCase().includes(userSearch.toLowerCase());
                    const matchesSubTab = userSubTab === 'staff' 
                      ? u.role !== 'customer' 
                      : u.role === 'customer';
                    return matchesSearch && matchesSubTab;
                  })
                  .map(u => (
                    <tr key={u.id} style={styles.tr}>
                      <td style={styles.td}>
                        <strong style={{ color: 'var(--text-primary)' }}>{u.username}</strong>
                      </td>
                      <td style={styles.td}>
                        <strong>{u.name}</strong>
                      </td>
                      <td style={styles.td}>
                        <span>{u.email}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          backgroundColor: u.role === 'admin' ? 'var(--secondary-glow)' : u.role === 'staff' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                          color: u.role === 'admin' ? '#000' : u.role === 'staff' ? 'var(--primary-glow)' : 'var(--text-primary)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '4px',
                          fontWeight: '700',
                          fontSize: '0.8rem'
                        }}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {u.id !== user?.id && u.id !== 'u1' ? (
                          <button 
                            onClick={() => handleDeleteUser(u)} 
                            style={styles.btnDelete}
                          >
                            ลบ
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PERFORMANCE QA TESTER */}
      {activeTab === 'performance' && (
        <div style={styles.tabContent}>
          <div className="glass-card" style={styles.qaTesterLayout}>
            <div style={styles.qaSettingsPanel}>
              <h3 style={styles.sectionHeading}>⚙️ ตั้งค่าการจำลองการโหลด (API Benchmark Settings)</h3>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>1. API ปลายทางที่จะยิงทดสอบ (Endpoint Target):</label>
                <select 
                  value={perfTarget} 
                  onChange={(e) => setPerfTarget(e.target.value)} 
                  style={styles.formControl}
                  disabled={perfRunning}
                >
                  <option value="/products">GET /api/products (โหลดรายการสินค้าทั้งหมด)</option>
                  <option value="/orders">GET /api/orders (ดึงประวัติออเดอร์ของแอดมิน)</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  2. อัตราส่งพร้อมกัน (Concurrency Level): <strong style={{ color: 'var(--primary-glow)' }}>{perfConcurrent} workers</strong>
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  value={perfConcurrent}
                  onChange={(e) => setPerfConcurrent(Number(e.target.value))}
                  style={{ width: '100%' }}
                  disabled={perfRunning}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>จำลองการเชื่อมต่อและการส่ง request พร้อมกันของลูกค้า</span>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  3. จำนวน Request ทั้งหมด (Total Requests): <strong style={{ color: 'var(--primary-glow)' }}>{perfTotalReqs} requests</strong>
                </label>
                <input 
                  type="number" 
                  min="10" 
                  max="500" 
                  value={perfTotalReqs}
                  onChange={(e) => setPerfTotalReqs(Number(e.target.value))}
                  style={styles.formControl}
                  disabled={perfRunning}
                />
              </div>

              <button 
                onClick={runPerformanceQA} 
                style={perfRunning ? styles.btnTestRunning : styles.btnTestRun}
                disabled={perfRunning}
              >
                {perfRunning ? `กำลังส่งทดสอบ... (${perfProgress}%)` : '🚀 เริ่มต้นรัน Benchmark ทดสอบ'}
              </button>

              {perfRunning && (
                <div style={styles.progressContainer}>
                  <div style={{ ...styles.progressBar, width: `${perfProgress}%` }}></div>
                </div>
              )}
            </div>

            {/* QA Test Result dashboard */}
            <div style={styles.qaResultPanel}>
              <h3 style={styles.sectionHeading}>📊 ผลลัพธ์การทดสอบประสิทธิภาพ (QA Metrics Report)</h3>
              
              {!perfResults && !perfRunning && (
                <div style={styles.emptyResults}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏱️</div>
                  <p>ยังไม่มีการทำสอบความเร็ว คลิกปุ่มด้านซ้ายเพื่อทดสอบ API</p>
                </div>
              )}

              {perfRunning && (
                <div style={styles.emptyResults}>
                  <div style={styles.spinner}></div>
                  <p style={{ marginTop: '1rem' }}>ระบบหลังบ้านกำลังจำลองโหลดความถี่สูง โปรดรอสักครู่...</p>
                </div>
              )}

              {perfResults && !perfRunning && (
                <div style={styles.resultsGrid}>
                  <div style={styles.resultCard}>
                    <div style={styles.resultLabel}>Requests Per Second (RPS)</div>
                    <div style={styles.resultValBig}>{perfResults.rps.toFixed(1)} req/s</div>
                    <div style={styles.resultFooter}>อัตราความเร็วการประมวลผล</div>
                  </div>

                  <div style={styles.resultCard}>
                    <div style={styles.resultLabel}>Latency เฉลี่ย (Average)</div>
                    <div style={styles.resultValBig}>{perfResults.avgLatencyMs.toFixed(1)} ms</div>
                    <div style={styles.resultFooter}>
                      Min: {perfResults.minLatencyMs.toFixed(1)}ms | Max: {perfResults.maxLatencyMs.toFixed(1)}ms
                    </div>
                  </div>

                  <div style={styles.resultCard}>
                    <div style={styles.resultLabel}>อัตราส่งสำเร็จ (Success Rate)</div>
                    <div style={{ 
                      ...styles.resultValBig, 
                      color: perfResults.errorCount === 0 ? 'var(--success)' : 'var(--danger)' 
                    }}>
                      {((perfResults.successRequests / perfResults.totalRequests) * 100).toFixed(0)} %
                    </div>
                    <div style={styles.resultFooter}>
                      ผ่าน {perfResults.successRequests} | ล้มเหลว {perfResults.errorCount} requests
                    </div>
                  </div>

                  {/* SVG Chart for Latency Timeline */}
                  <div style={styles.latencyChartContainer}>
                    <h4 style={{ marginBottom: '0.8rem', fontSize: '0.9rem' }}>📈 ลำดับของ Latency แต่ละ Request (ms)</h4>
                    <svg viewBox="0 0 500 150" style={styles.svgChart}>
                      {/* Grid lines */}
                      <line x1="40" y1="10" x2="480" y2="10" stroke="rgba(255,255,255,0.05)" />
                      <line x1="40" y1="50" x2="480" y2="50" stroke="rgba(255,255,255,0.05)" />
                      <line x1="40" y1="90" x2="480" y2="90" stroke="rgba(255,255,255,0.05)" />
                      <line x1="40" y1="130" x2="480" y2="130" stroke="rgba(255,255,255,0.1)" />

                      {/* Axes */}
                      <line x1="40" y1="10" x2="40" y2="130" stroke="rgba(255,255,255,0.1)" />

                      {/* Render line path */}
                      {(() => {
                        const maxVal = Math.max(...perfResults.latencies, 10);
                        const points = perfResults.latencies.map((val, idx) => {
                          const x = 40 + (idx / (perfResults.latencies.length - 1)) * 440;
                          const y = 130 - (val / maxVal) * 110;
                          return `${x},${y}`;
                        }).join(' ');
                        
                        return (
                          <>
                            <polyline
                              fill="none"
                              stroke="var(--primary-glow)"
                              strokeWidth="2"
                              points={points}
                            />
                            {/* Dots for each point if under 50 points */}
                            {perfResults.latencies.length <= 50 && perfResults.latencies.map((val, idx) => {
                              const x = 40 + (idx / (perfResults.latencies.length - 1)) * 440;
                              const y = 130 - (val / maxVal) * 110;
                              return (
                                <circle 
                                  key={idx} 
                                  cx={x} 
                                  cy={y} 
                                  r="3" 
                                  fill="var(--secondary-glow)" 
                                />
                              );
                            })}
                          </>
                        );
                      })()}

                      {/* Labels */}
                      <text x="5" y="15" fill="var(--text-secondary)" fontSize="8">
                        {Math.max(...perfResults.latencies).toFixed(0)}ms
                      </text>
                      <text x="5" y="130" fill="var(--text-secondary)" fontSize="8">0ms</text>
                      <text x="250" y="145" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">
                        ลำดับ Request (1 ถึง {perfResults.totalRequests})
                      </text>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CRUD MODAL FOR PRODUCT ADD/EDIT */}
      {showProductModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} className="glass-card">
            <h2 style={{ ...styles.sectionHeading, marginBottom: '1.5rem', color: 'var(--primary-glow)' }}>
              {editingProduct ? `✏️ แก้ไขสินค้า: ${editingProduct.name}` : '➕ เพิ่มสินค้าใหม่เข้าระบบ'}
            </h2>
            <form onSubmit={handleSaveProduct} style={styles.modalForm}>
              <div style={styles.formRow}>
                <div style={styles.formGroupHalf}>
                  <label style={styles.label}>ชื่อสินค้า:</label>
                  <input 
                    type="text" 
                    required 
                    value={prodForm.name} 
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    style={styles.formControl}
                  />
                </div>
                <div style={styles.formGroupHalf}>
                  <label style={styles.label}>หมวดหมู่:</label>
                  <select 
                    value={prodForm.category} 
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                    style={styles.formControl}
                  >
                    <option value="Supplement">Supplement (อาหารเสริม)</option>
                    <option value="Food & Beverage">Food & Beverage (ชา/เครื่องดื่ม/อาหารเพื่อสุขภาพ)</option>
                    <option value="Fitness Gear">Fitness Gear (อุปกรณ์โยคะ/ฟิตเนส)</option>
                    <option value="Skincare">Skincare (บำรุงผิวพรรณเพื่อสุขภาพ)</option>
                  </select>
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroupHalf}>
                  <label style={styles.label}>ราคาสินค้า (บาท):</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    value={prodForm.price} 
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                    style={styles.formControl}
                  />
                </div>
                <div style={styles.formGroupHalf}>
                  <label style={styles.label}>สต็อกเริ่มต้น (ชิ้น):</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    value={prodForm.stock} 
                    onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })}
                    style={styles.formControl}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>URL รูปภาพสินค้า:</label>
                <input 
                  type="url" 
                  required 
                  value={prodForm.image} 
                  onChange={(e) => setProdForm({ ...prodForm, image: e.target.value })}
                  style={styles.formControl}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>คำอธิบายรายละเอียดสินค้า:</label>
                <textarea 
                  required 
                  rows="3"
                  value={prodForm.description} 
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  style={styles.formControl}
                />
              </div>

              {/* Specs Sub-Form */}
              <h4 style={{ ...styles.sectionHeading, fontSize: '1rem', marginTop: '1rem', marginBottom: '0.8rem', color: 'var(--secondary-glow)' }}>
                🔍 ข้อมูลจำเพาะ (Specifications)
              </h4>
              
              <div style={styles.formRow}>
                <div style={styles.formGroupHalf}>
                  <label style={styles.label}>ผู้ผลิต (Manufacturer):</label>
                  <input 
                    type="text" 
                    value={prodForm.manufacturer} 
                    onChange={(e) => setProdForm({ ...prodForm, manufacturer: e.target.value })}
                    style={styles.formControl}
                    placeholder="เช่น Fitpung Labs USA"
                  />
                </div>
                <div style={styles.formGroupHalf}>
                  <label style={styles.label}>น้ำหนักสุทธิ / ขนาด (Weight):</label>
                  <input 
                    type="text" 
                    value={prodForm.weight} 
                    onChange={(e) => setProdForm({ ...prodForm, weight: e.target.value })}
                    style={styles.formControl}
                    placeholder="เช่น 500 กรัม"
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroupHalf}>
                  <label style={styles.label}>ส่วนประกอบสำคัญ / วัสดุ (Materials):</label>
                  <input 
                    type="text" 
                    value={prodForm.materials} 
                    onChange={(e) => setProdForm({ ...prodForm, materials: e.target.value })}
                    style={styles.formControl}
                    placeholder="เช่น เวย์โปรตีนไอโซเลท 100%"
                  />
                </div>
                <div style={styles.formGroupHalf}>
                  <label style={styles.label}>การรับรองความปลอดภัย / การรับประกัน (Certification):</label>
                  <input 
                    type="text" 
                    value={prodForm.warranty} 
                    onChange={(e) => setProdForm({ ...prodForm, warranty: e.target.value })}
                    style={styles.formControl}
                    placeholder="เช่น อย. เลขที่ xx-x-xxxxxx"
                  />
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="submit" style={styles.btnSave}>บันทึกข้อมูลสินค้า</button>
                <button type="button" onClick={() => setShowProductModal(false)} style={styles.btnCancel}>ปิดหน้าต่าง</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showUserModal && (
        <div style={styles.modalOverlay} className="page-fade-in">
          <div style={styles.modalContent} className="glass-card glow-cyan">
            <h2 style={{ ...styles.sectionHeading, marginBottom: '1.5rem', color: 'var(--primary-glow)' }}>
              👥 เพิ่มบัญชีผู้ดูแล / พนักงานใหม่
            </h2>
            <form onSubmit={handleSaveUser} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>ชื่อผู้ใช้งาน (Username):</label>
                <input 
                  type="text" 
                  required 
                  value={userForm.username} 
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  style={styles.formControl}
                  placeholder="เช่น somchai_staff"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>รหัสผ่าน (Password):</label>
                <input 
                  type="password" 
                  required 
                  value={userForm.password} 
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  style={styles.formControl}
                  placeholder="รหัสผ่านขั้นต่ำ 6 ตัว"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>ชื่อผู้ใช้งานจริง (Full Name):</label>
                <input 
                  type="text" 
                  required 
                  value={userForm.name} 
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  style={styles.formControl}
                  placeholder="เช่น สมชาย ใจดี"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>อีเมล (Email):</label>
                <input 
                  type="email" 
                  required 
                  value={userForm.email} 
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  style={styles.formControl}
                  placeholder="เช่น somchai@fitpung.com"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>บทบาทการใช้งาน (Role):</label>
                <select 
                  value={userForm.role} 
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} 
                  style={styles.formControl}
                >
                  <option value="staff">Staff (พนักงานจัดการหลังร้าน)</option>
                  <option value="admin">Admin (ผู้ดูแลระบบหลัก)</option>
                </select>
              </div>

              <div style={styles.modalActions}>
                <button type="submit" style={styles.btnSave}>เพิ่มบัญชีผู้ใช้</button>
                <button type="button" onClick={() => setShowUserModal(false)} style={styles.btnCancel}>ปิดหน้าต่าง</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Styling Object
const styles = {
  container: {
    padding: '2rem 1.5rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  centerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5rem 2rem',
    textAlign: 'center',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-title)',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    marginTop: '0.3rem',
  },
  successNotification: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: 'var(--success)',
    padding: '0.8rem 1.5rem',
    borderRadius: '8px',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    fontWeight: '600',
    animation: 'fadeIn 0.3s ease',
  },
  tabBar: {
    display: 'flex',
    gap: '0.8rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.5rem',
    marginBottom: '2rem',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
  },
  tabBtn: {
    padding: '0.8rem 1.2rem',
    backgroundColor: 'transparent',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: '3px solid transparent',
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '8px 8px 0 0',
    transition: 'all 0.3s ease',
  },
  tabContent: {
    marginTop: '1rem',
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid var(--danger)',
    color: 'var(--text-primary)',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retryBtn: {
    backgroundColor: 'var(--danger)',
    border: 'none',
    color: '#fff',
    padding: '0.4rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2.5rem',
  },
  metricCard: {
    padding: '1.5rem',
    minHeight: '130px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  metricHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
  },
  metricLabel: {
    fontWeight: '500',
  },
  metricVal: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-title)',
    margin: '0.5rem 0',
  },
  metricFooter: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  chartsAndRecentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '2rem',
  },
  '@media (min-width: 900px)': {
    chartsAndRecentGrid: {
      gridTemplateColumns: '1.2fr 1fr',
    }
  },
  chartContainer: {
    padding: '1.5rem',
  },
  sectionHeading: {
    fontSize: '1.2rem',
    fontFamily: 'var(--font-title)',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  chartRow: {
    marginBottom: '1.2rem',
  },
  chartLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginBottom: '0.4rem',
    fontWeight: '600',
  },
  chartBarWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    position: 'relative',
  },
  chartBar: {
    height: '24px',
    backgroundColor: 'var(--primary-glow)',
    borderRadius: '4px',
    backgroundImage: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
    boxShadow: '0 0 10px rgba(16, 185, 129, 0.2)',
    transition: 'width 1s ease-in-out',
  },
  chartBarText: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  recentOrdersContainer: {
    padding: '1.5rem',
  },
  recentOrdersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '1.2rem',
  },
  recentOrderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '0.8rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  recentOrderDate: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginTop: '0.2rem',
  },
  filterSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  searchInput: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    padding: '0.75rem 1.2rem',
    borderRadius: '8px',
    fontSize: '0.95rem',
    flexGrow: 1,
    maxWidth: '500px',
  },
  tableWrapper: {
    overflowX: 'auto',
    padding: '0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
    }
  },
  td: {
    padding: '1rem 1.5rem',
    verticalAlign: 'middle',
    fontSize: '0.9rem',
  },
  selectInput: {
    backgroundColor: '#0c130e',
    color: '#fff',
    border: '1px solid var(--border-color)',
    padding: '0.4rem 0.6rem',
    borderRadius: '4px',
    fontSize: '0.85rem',
  },
  inlineTextInput: {
    backgroundColor: '#0c130e',
    color: '#fff',
    border: '1px solid var(--border-color)',
    padding: '0.4rem 0.6rem',
    borderRadius: '4px',
    fontSize: '0.85rem',
    width: '130px',
  },
  btnSave: {
    backgroundColor: 'var(--primary-glow)',
    color: '#000',
    border: 'none',
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.85rem',
  },
  btnCancel: {
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
  },
  btnEdit: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: 'var(--warning)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
  },
  btnDelete: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: 'var(--danger)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
  },
  productThumbnail: {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
  stockBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#fff',
    border: '1px solid var(--border-color)',
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
  },
  btnAddProduct: {
    backgroundColor: 'var(--primary-glow)',
    color: '#000',
    border: 'none',
    padding: '0.75rem 1.2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontFamily: 'var(--font-title)',
  },
  qaTesterLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '2.5rem',
  },
  // If desktop, side-by-side
  qaSettingsPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  },
  qaResultPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    minHeight: '250px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  formControl: {
    backgroundColor: '#0c130e',
    border: '1px solid var(--border-color)',
    color: '#fff',
    padding: '0.6rem 1rem',
    borderRadius: '6px',
    fontSize: '0.95rem',
  },
  btnTestRun: {
    backgroundColor: 'var(--primary-glow)',
    color: '#000',
    border: 'none',
    padding: '0.8rem 1.5rem',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  btnTestRunning: {
    backgroundColor: 'var(--border-color)',
    color: 'var(--text-secondary)',
    border: 'none',
    padding: '0.8rem 1.5rem',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'not-allowed',
  },
  progressContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '99px',
    height: '8px',
    overflow: 'hidden',
    marginTop: '0.5rem',
  },
  progressBar: {
    backgroundColor: 'var(--secondary-glow)',
    height: '100%',
    transition: 'width 0.1s ease',
  },
  emptyResults: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '3rem',
    border: '1px dashed var(--border-color)',
    borderRadius: '12px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
  },
  resultCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)',
    padding: '1.2rem',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  resultLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  resultValBig: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: 'var(--primary-glow)',
    fontFamily: 'var(--font-title)',
    margin: '0.5rem 0',
  },
  resultFooter: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  latencyChartContainer: {
    gridColumn: '1 / -1',
    backgroundColor: 'rgba(255,255,255,0.01)',
    border: '1px solid var(--border-color)',
    padding: '1.2rem',
    borderRadius: '12px',
    marginTop: '1rem',
  },
  svgChart: {
    width: '100%',
    height: 'auto',
    maxHeight: '180px',
    backgroundColor: '#070c08',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.03)',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    backdropFilter: 'blur(5px)',
  },
  modalContent: {
    width: '100%',
    maxWidth: '650px',
    maxHeight: '90vh',
    overflowY: 'auto',
    border: '1px solid var(--border-color)',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
  },
  formGroupHalf: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '1.5rem',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.2rem',
  },
  spinner: {
    border: '4px solid rgba(255,255,255,0.1)',
    borderLeftColor: 'var(--primary-glow)',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
  },
};
