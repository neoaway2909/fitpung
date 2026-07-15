const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Paths to database files
const USERS_PATH = path.join(__dirname, 'data', 'users.json');
const PRODUCTS_PATH = path.join(__dirname, 'data', 'products.json');
const ORDERS_PATH = path.join(__dirname, 'data', 'orders.json');

// Helper functions to read/write JSON files
function readData(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
}

function writeData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
}

// Ensure data folder and files exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize files if they don't exist
if (!fs.existsSync(USERS_PATH)) writeData(USERS_PATH, []);
if (!fs.existsSync(PRODUCTS_PATH)) writeData(PRODUCTS_PATH, []);
if (!fs.existsSync(ORDERS_PATH)) writeData(ORDERS_PATH, []);

// Seed initial products if file is empty
const initialProducts = [
  {
    id: 'p_1',
    name: 'เวย์โปรตีนไอโซเลทพรีเมียม (Whey Protein Isolate)',
    category: 'Supplement',
    price: 1890,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    description: 'เวย์โปรตีนไอโซเลทเข้มข้น ดูดซึมเร็ว ช่วยเสริมสร้างและฟื้นฟูกล้ามเนื้อได้อย่างมีประสิทธิภาพ เหมาะสำหรับผู้รักสุขภาพและผู้ออกกำลังกาย',
    specs: {
      manufacturer: 'Fitpung Labs USA',
      weight: '900 กรัม',
      materials: 'Whey Protein Isolate 100%',
      warranty: 'GMP Certified / FDA Approved'
    }
  },
  {
    id: 'p_2',
    name: 'ผงมัทฉะออร์แกนิกญี่ปุ่น (Organic Matcha Powder)',
    category: 'Food & Beverage',
    price: 690,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    description: 'ผงชาเขียวมัทฉะออร์แกนิก 100% นำเข้าจากเมืองอูจิ ประเทศญี่ปุ่น อุดมไปด้วยสารต้านอนุมูลอิสระ ช่วยเพิ่มการเผาผลาญและบำมุงสุขภาพ',
    specs: {
      manufacturer: 'Uji Organic Matcha Corp',
      weight: '100 กรัม',
      materials: 'Organic Matcha Green Tea 100%',
      warranty: 'JAS Organic Certified'
    }
  },
  {
    id: 'p_3',
    name: 'เสื่อโยคะยางพาราธรรมชาติ (Natural Rubber Yoga Mat)',
    category: 'Fitness Gear',
    price: 2450,
    stock: 2,
    image: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    description: 'เสื่อโยคะทำจากยางพาราธรรมชาติ 100% ยึดเกาะดีเยี่ยม ไม่ลื่น ซับแรงกระแทกได้ดี ไม่มีกลิ่นสารเคมี เป็นมิตรต่อสิ่งแวดล้อม',
    specs: {
      manufacturer: 'EcoFit Equipment',
      weight: '2.5 กิโลกรัม',
      materials: 'Natural Rubber 100%',
      warranty: 'Eco-Friendly Certified'
    }
  }
];

const currentProducts = readData(PRODUCTS_PATH);
if (currentProducts.length === 0) {
  writeData(PRODUCTS_PATH, initialProducts);
}


// ================= AUTHENTICATION APIs =================

// Register
app.post('/api/auth/register', (req, res) => {
  const { username, password, email, name } = req.body;
  if (!username || !password || !email || !name) {
    return res.status(400).json({ message: 'โปรดกรอกข้อมูลให้ครบถ้วน' });
  }

  const users = readData(USERS_PATH);
  const userExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
  if (userExists) {
    return res.status(400).json({ message: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' });
  }

  const newUser = {
    id: 'u_' + Date.now(),
    username,
    password, // Plain text for simplicity, in production use bcrypt
    email,
    name,
    role: 'customer' // Default role
  };

  users.push(newUser);
  writeData(USERS_PATH, users);

  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ', user: userWithoutPassword });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'โปรดกรอกชื่อผู้ใช้และรหัสผ่าน' });
  }

  const users = readData(USERS_PATH);
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({ message: 'เข้าสู่ระบบสำเร็จ', user: userWithoutPassword });
});

// ================= PRODUCTS APIs =================

// Get all products
app.get('/api/products', (req, res) => {
  const products = readData(PRODUCTS_PATH);
  res.json(products);
});

// ================= ORDERS APIs =================

// Create new order
app.post('/api/orders', (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ' });
  }

  const { items, totalPrice, shippingAddress, paymentMethod } = req.body;
  if (!items || !items.length || !shippingAddress || !shippingAddress.recipientName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.postalCode) {
    return res.status(400).json({ message: 'ข้อมูลการสั่งซื้อหรือที่อยู่จัดส่งไม่ครบถ้วน' });
  }

  const products = readData(PRODUCTS_PATH);
  const orders = readData(ORDERS_PATH);

  // Check and update stock
  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    if (!product) {
      return res.status(400).json({ message: `ไม่พบสินค้า: ${item.name} ในระบบ` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ message: `สินค้า ${product.name} มีสต็อกไม่เพียงพอ (เหลือเพียง ${product.stock} ชิ้น)` });
    }
  }

  // Deduct stock
  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    product.stock -= item.quantity;
  }

  // Save updated products stock
  writeData(PRODUCTS_PATH, products);

  // Create order
  const newOrder = {
    id: 'ord_' + Date.now(),
    userId,
    items: items.map(item => ({
      productId: item.productId,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      subtotal: Number(item.price) * Number(item.quantity)
    })),
    totalPrice: Number(totalPrice),
    shippingAddress,
    paymentMethod: paymentMethod || 'PromptPay',
    status: 'Pending',
    trackingNumber: '',
    createdAt: new Date().toISOString()
  };

  orders.push(newOrder);
  writeData(ORDERS_PATH, orders);

  res.status(201).json({ message: 'สร้างคำสั่งซื้อสำเร็จและรอการชำระเงิน', order: newOrder });
});

// Simulate payment
app.post('/api/orders/:id/pay', (req, res) => {
  const { id } = req.params;
  const orders = readData(ORDERS_PATH);
  const orderIndex = orders.findIndex(o => o.id === id);

  if (orderIndex === -1) {
    return res.status(404).json({ message: 'ไม่พบคำสั่งซื้อนี้' });
  }

  orders[orderIndex].status = 'Paid';
  writeData(ORDERS_PATH, orders);

  res.json({ message: 'จำลองการชำระเงินสำเร็จแล้ว', order: orders[orderIndex] });
});

// Get user orders (or all if admin/staff)
app.get('/api/orders', (req, res) => {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];

  if (!userId) {
    return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
  }

  const orders = readData(ORDERS_PATH);

  // If role is admin or staff, return all orders. Otherwise, filter by userId.
  if (userRole === 'admin' || userRole === 'staff') {
    res.json(orders);
  } else {
    const userOrders = orders.filter(o => o.userId === userId);
    res.json(userOrders);
  }
});

// Update order status/tracking (staff/admin only)
app.put('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, trackingNumber } = req.body;
  const userRole = req.headers['x-user-role'];

  if (userRole !== 'admin' && userRole !== 'staff') {
    return res.status(403).json({ message: 'ไม่มีสิทธิ์ในการจัดการสถานะคำสั่งซื้อ' });
  }

  const orders = readData(ORDERS_PATH);
  const orderIndex = orders.findIndex(o => o.id === id);

  if (orderIndex === -1) {
    return res.status(404).json({ message: 'ไม่พบคำสั่งซื้อนี้' });
  }

  if (status) orders[orderIndex].status = status;
  if (trackingNumber !== undefined) orders[orderIndex].trackingNumber = trackingNumber;

  writeData(ORDERS_PATH, orders);
  res.json({ message: 'อัปเดตสถานะคำสั่งซื้อเรียบร้อยแล้ว', order: orders[orderIndex] });
});

// ================= ADMIN APIs =================

// Get all users (admin/staff only)
app.get('/api/admin/users', (req, res) => {
  const userRole = req.headers['x-user-role'];
  if (userRole !== 'admin' && userRole !== 'staff') {
    return res.status(403).json({ message: 'ไม่มีสิทธิ์ในการเข้าถึงข้อมูลผู้ใช้' });
  }
  const users = readData(USERS_PATH);
  // Map users to remove passwords before returning
  const safeUsers = users.map(({ password, ...u }) => u);
  res.json(safeUsers);
});

// Add new product (admin/staff only)
app.post('/api/products', (req, res) => {
  const userRole = req.headers['x-user-role'];
  if (userRole !== 'admin' && userRole !== 'staff') {
    return res.status(403).json({ message: 'ไม่มีสิทธิ์ในการเพิ่มสินค้า' });
  }
  const { name, category, price, stock, image, description, specs } = req.body;
  if (!name || !category || price === undefined || stock === undefined || !image || !description) {
    return res.status(400).json({ message: 'ข้อมูลสินค้าไม่ครบถ้วน' });
  }
  const products = readData(PRODUCTS_PATH);
  const newProduct = {
    id: 'p_' + Date.now(),
    name,
    category,
    price: Number(price),
    stock: Number(stock),
    image,
    description,
    specs: {
      manufacturer: specs?.manufacturer || 'Fitpung Labs',
      weight: specs?.weight || 'N/A',
      materials: specs?.materials || 'N/A',
      warranty: specs?.warranty || 'FDA Approved'
    }
  };
  products.push(newProduct);
  writeData(PRODUCTS_PATH, products);
  res.status(201).json({ message: 'เพิ่มสินค้าสำเร็จ', product: newProduct });
});

// Edit product details & stock (admin/staff only)
app.put('/api/products/:id', (req, res) => {
  const userRole = req.headers['x-user-role'];
  if (userRole !== 'admin' && userRole !== 'staff') {
    return res.status(403).json({ message: 'ไม่มีสิทธิ์ในการแก้ไขสินค้า' });
  }
  const { id } = req.params;
  const { name, category, price, stock, image, description, specs } = req.body;
  const products = readData(PRODUCTS_PATH);
  const productIndex = products.findIndex(p => p.id === id);
  if (productIndex === -1) {
    return res.status(404).json({ message: 'ไม่พบสินค้าในระบบ' });
  }
  const currentProduct = products[productIndex];
  
  // Update fields
  if (name !== undefined) currentProduct.name = name;
  if (category !== undefined) currentProduct.category = category;
  if (price !== undefined) currentProduct.price = Number(price);
  if (stock !== undefined) currentProduct.stock = Number(stock);
  if (image !== undefined) currentProduct.image = image;
  if (description !== undefined) currentProduct.description = description;
  if (specs !== undefined) {
    currentProduct.specs = {
      ...currentProduct.specs,
      ...specs
    };
  }
  
  products[productIndex] = currentProduct;
  writeData(PRODUCTS_PATH, products);
  res.json({ message: 'แก้ไขสินค้าสำเร็จ', product: currentProduct });
});

// Delete product (admin/staff only)
app.delete('/api/products/:id', (req, res) => {
  const userRole = req.headers['x-user-role'];
  if (userRole !== 'admin' && userRole !== 'staff') {
    return res.status(403).json({ message: 'ไม่มีสิทธิ์ในการลบสินค้า' });
  }
  const { id } = req.params;
  const products = readData(PRODUCTS_PATH);
  const filteredProducts = products.filter(p => p.id !== id);
  if (products.length === filteredProducts.length) {
    return res.status(404).json({ message: 'ไม่พบสินค้าในระบบ' });
  }
  writeData(PRODUCTS_PATH, filteredProducts);
  res.json({ message: 'ลบสินค้าสำเร็จ' });
});



// Start Server
app.listen(PORT, () => {
  console.log(`Fitpung Health Store Backend Server running on port ${PORT}`);
});
