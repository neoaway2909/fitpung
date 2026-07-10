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

// Start Server
app.listen(PORT, () => {
  console.log(`VitaLife Health Store Backend Server running on port ${PORT}`);
});
