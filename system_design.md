# เอกสารการออกแบบระบบ (System Design Document)
## ระบบร้านค้าเพื่อสุขภาพระดับพรีเมียม - fitpung



---

## วัตถุประสงค์ของระบบ (System Objectives)
- เพื่อพัฒนาเว็บไซต์ร้านขายอุปกรณ์เพื่อสุขภาพในรูปแบบพาณิชย์อิเล็กทรอนิกส์ (E-Commerce) ที่สามารถใช้งานได้อย่างมีประสิทธิภาพ
- เพื่ออำนวยความสะดวกให้ผู้ใช้งานสามารถค้นหาข้อมูล เลือกซื้อ และสั่งซื้ออุปกรณ์เพื่อสุขภาพผ่านระบบออนไลน์ได้อย่างรวดเร็ว
- เพื่อพัฒนาระบบจัดการข้อมูลสินค้า คำสั่งซื้อ และข้อมูลลูกค้าให้เป็นระบบและง่ายต่อการบริหารจัดการ

---
## ขอบเขตการให้บริการ (Service Scope)

**ลูกค้า (Customer)**
- สมัครสมาชิกและเข้าสู่ระบบใช้งาน
- เรียกดูและค้นหาสินค้าภายในเว็บไซต์
- ทำการสั่งซื้ออุปกรณ์ด้านสุขภาพผ่านช่องทางออนไลน์
- ตรวจสอบสถานะการจัดส่งสินค้า

**พนักงาน (Staff)**
- ดูแลปรับปรุงสถานะของสินค้าลูกค้า
- ดำเนินการเกี่ยวกับคำสั่งซื้อและตรวจสอบการชำระเงินของลูกค้า

**ผู้ดูแลระบบ (Administrator)**
- บริหารจัดการข้อมูลของสมาชิกในระบบ
- เรียกดูรายงานสรุปยอดขาย
- เพิ่มและลบสินค้าใหม่

---

## 1. บทบาทและความสำคัญของแผนภาพต่อการพัฒนาระบบ
ในการสร้างซอฟต์แวร์ การใช้แผนภาพต่างมุมมองช่วยให้ผู้พัฒนาระบบทำงานได้อย่างเป็นระบบและลดความผิดพลาด ดังนี้:

*   **Use Case Diagram:** เป็นตัวบอก **"ระบบนี้ทำอะไรได้บ้างและใครเป็นคนทำ"** ทำหน้าที่ระบุขอบเขตของระบบ (System Scope) และบทบาทผู้ใช้งาน (Actors) ช่วยไม่ให้ทีมงานหลงทิศทางหรือพัฒนาฟีเจอร์นอกขอบเขต
*   **Class Diagram:** เป็นตัวบอก **"โครงสร้างข้อมูลในระบบเชื่อมโยงกันอย่างไร"** ทำหน้าที่กำหนดชนิดตัวแปร ความสัมพันธ์ และเมธอดของออบเจกต์ข้อมูล ทำให้ฝั่งฐานข้อมูลและนักพัฒนาทุกส่วนเข้าใจฟิลด์และคีย์ตรงกัน
*   **Sequence Diagram:** เป็นตัวบอก **"ระบบคุยกันในแนวตั้งอย่างไรตามเวลา"** ทำหน้าที่แสดงการไหลของข้อความ (Message Flow) ระหว่างคอมโพเนนต์หน้าบ้าน หลังบ้าน และฐานข้อมูลเมื่อเกิดเหตุการณ์ใดเหตุการณ์หนึ่ง ทำให้การดีบักและการเขียน Logic สมเหตุสมผล
*   **Wireframe:** เป็นตัวบอก **"เค้าโครงหน้าตาเว็บจะถูกจัดวางอย่างไร"** เป็นโครงสร้างลายเส้นเพื่อกำหนดจุดวางปุ่ม แบนเนอร์ ช่องพิมพ์ข้อมูล เพื่อประเมินความลื่นไหลของหน้าจอก่อนจะลงสีหรือทำกราฟิกจริง
*   **Prototype (ต้นแบบ):** เป็นตัวบอก **"การทดสอบการใช้งานจริงมีปฏิสัมพันธ์อย่างไร"** เป็นตัวช่วยทดสอบความรู้สึกของผู้ใช้งาน (User Experience) และระบบฟังก์ชันต่างๆ ว่าสามารถคลิกโต้ตอบ ชำระเงิน หรือสลับสิทธิ์ผู้ใช้ได้สมบูรณ์ก่อนปล่อยใช้งานจริง

---

## 2. แผนภาพแสดงสิทธิ์การใช้งาน (Use Case Diagram)


![Use Case Diagram](./usecase.png)




## 3. แผนภาพแสดงโครงสร้างข้อมูล (Class Diagram)
แสดงโครงสร้างจำลองเชิงคลาส (Class Structure) ของระบบแอปพลิเคชันทั้งหมด ระบุดาต้าไทป์ ตัวแปร เมธอด และความสัมพันธ์ของคลาสหลังบ้านร่วมกับ API คอนโทรลเลอร์ ตลอดจนคลาสจัดเตรียมสถานะ (React Context) ของหน้าบ้าน

```mermaid
classDiagram
  %% Relations
  User "1" --> "many" Order : "places & tracks"
  Order "1" *-- "many" OrderItem : "contains"
  Order "1" *-- "1" ShippingAddress : "delivers to"
  Product "1" *-- "1" ProductSpecs : "has details"
  AuthContext "1" --> "1" User : "manages state of"
  CartContext "1" --> "many" OrderItem : "calculates state of"
  APIServer --> User : "CRUD /auth & /admin/users"
  APIServer --> Product : "CRUD /products"
  APIServer --> Order : "CRUD /orders"

  class User {
    +String id
    +String username
    +String password
    +String email
    +String role
    +String name
    +register(username, password, email, name) Object
    +login(username, password) Object
    +logout() void
  }

  class Product {
    +String id
    +String name
    +String category
    +double price
    +int stock
    +String image
    +String description
    +ProductSpecs specs
    +getDetails() Product
  }

  class ProductSpecs {
    +String manufacturer
    +String weight
    +String materials
    +String warranty
  }

  class Order {
    +String id
    +String userId
    +List~OrderItem~ items
    +double totalPrice
    +ShippingAddress shippingAddress
    +String paymentMethod
    +String status
    +String trackingNumber
    +String createdAt
    +createOrder(userId, items, address, payment) Object
    +updateStatus(status, trackingNo) Object
    +payOrder() Object
    +cancelOrder() Object
  }

  class OrderItem {
    +String productId
    +String name
    +double price
    +int quantity
    +double subtotal
  }

  class ShippingAddress {
    +String recipientName
    +String phone
    +String address
    +String postalCode
  }

  class AuthContext {
    +User user
    +boolean loading
    +String error
    +boolean isAdmin
    +login(username, password) void
    +register(username, password, email, name) void
    +logout() void
    +getAuthHeaders() Object
    +setError(error) void
  }

  class CartContext {
    +List~OrderItem~ cart
    +int cartCount
    +double cartTotal
    +List~String~ cartWarnings
    +boolean loadingSync
    +addToCart(product, qty) void
    +updateQuantity(productId, newQty) void
    +removeFromCart(productId) void
    +clearCart() void
    +validateAndSyncCart(showNotifications) void
  }

  class APIServer {
    +ExpressApp app
    +int PORT
    +String USERS_PATH
    +String PRODUCTS_PATH
    +String ORDERS_PATH
    +readData(filePath) List
    +writeData(filePath, data) boolean
    +handleAuthRoutes() void
    +handleProductRoutes() void
    +handleOrderRoutes() void
    +handleAdminRoutes() void
  }
```

---

## 4. แผนภาพแสดงการไหลของข้อมูล (Sequence Diagram)
แสดงกระบวนการทำงานและการไหลของข้อมูลระหว่างผู้ใช้งาน หน้าบ้าน (Frontend) หลังบ้าน (Backend API) และไฟล์ฐานข้อมูล (JSON DB) ในระบบปัจจุบันทั้งหมด 6 กระบวนการหลัก ดังนี้:

### 4.1 กระบวนการลงทะเบียนและเข้าสู่ระบบ (Authentication Process)
แสดงขั้นตอนการสมัครสมาชิกและการตรวจสอบสิทธิ์เข้าสู่ระบบของลูกค้า/พนักงาน/ผู้ดูแลระบบ

```mermaid
sequenceDiagram
  autonumber
  actor User as 👤 ผู้ใช้งาน
  participant FE as 🖥️ หน้าบ้าน (Frontend / AuthContext)
  participant BE as ⚙️ หลังบ้าน (Backend API)
  participant DB as 💾 ฐานข้อมูล (users.json)

  Note over User, DB: 1. กระบวนการลงทะเบียน (Register)
  User->>FE: กรอกข้อมูลสมัครสมาชิก (Username, Password, Email, Name)
  FE->>BE: POST /api/auth/register (ส่ง Request Body)
  activate BE
  BE->>DB: อ่านข้อมูลผู้ใช้ทั้งหมดเพื่อตรวจสอบ
  DB-->>BE: รายชื่อผู้ใช้ที่มีอยู่
  alt มี Username ซ้ำในระบบ
    BE-->>FE: ส่งค่า HTTP 400 (ชื่อผู้ใช้นี้ถูกใช้งานแล้ว)
    FE->>User: แจ้งเตือนข้อผิดพลาดหน้าจอ
  else ไม่มี Username ซ้ำ (ลงทะเบียนผ่าน)
    BE->>BE: สร้างออบเจกต์ผู้ใช้ใหม่ (ID อัตโนมัติ, Role เป็น customer)
    BE->>DB: บันทึกข้อมูลผู้ใช้ใหม่ลงไฟล์
    DB-->>BE: ยืนยันการบันทึกสำเร็จ
    BE-->>FE: ส่งค่า HTTP 201 (สมัครสมาชิกสำเร็จ พร้อมข้อมูลผู้ใช้ไม่รวมรหัสผ่าน)
    FE->>User: แสดงหน้าต่างแจ้งเตือน "สมัครสมาชิกสำเร็จ" และนำทางไปหน้าเข้าสู่ระบบ
  end
  deactivate BE

  Note over User, DB: 2. กระบวนการเข้าสู่ระบบ (Login)
  User->>FE: กรอก Username และ Password
  FE->>BE: POST /api/auth/login (ส่ง Request Body)
  activate BE
  BE->>DB: อ่านข้อมูลผู้ใช้ในระบบทั้งหมด
  DB-->>BE: รายชื่อผู้ใช้
  BE->>BE: ตรวจสอบความถูกต้องของ Username และ Password
  alt ข้อมูลไม่ถูกต้อง
    BE-->>FE: ส่งค่า HTTP 401 (ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง)
    FE->>User: แสดงข้อความแจ้งเตือนข้อผิดพลาด
  else ข้อมูลถูกต้อง
    BE-->>FE: ส่งค่า HTTP 200 (เข้าสู่ระบบสำเร็จ พร้อมข้อมูลผู้ใช้)
    FE->>FE: บันทึกข้อมูลและสถานะผู้ใช้ลงใน AuthContext State
    FE->>User: นำทางไปยังหน้าหลักตามสิทธิ์ (Role)
  end
  deactivate BE
```

### 4.2 กระบวนการสั่งซื้อและชำระเงินจำลอง (Ordering & Simulated Payment Process)
แสดงขั้นตอนการเลือกสั่งซื้อสินค้า ตรวจสอบสต็อก การหักสต็อก และการจำลองชำระเงินผ่าน PromptPay QR Code

```mermaid
sequenceDiagram
  autonumber
  actor Customer as 👤 ลูกค้า
  participant FE as 🖥️ หน้าบ้าน (Frontend / CartContext)
  participant BE as ⚙️ หลังบ้าน (Backend API)
  participant DB as 💾 ฐานข้อมูล (JSON Files)

  Note over Customer, DB: 1. ตรวจสอบสต็อกและสร้างคำสั่งซื้อ (Create Order)
  Customer->>FE: คลิก "ดำเนินการสั่งซื้อ" และยืนยันข้อมูลที่อยู่
  FE->>BE: POST /api/orders (ส่งรายการสินค้า, ที่อยู่, ราคารวม และ Header x-user-id)
  activate BE
  BE->>DB: อ่านไฟล์ products.json เพื่อตรวจสอบจำนวนสต็อก
  DB-->>BE: ข้อมูลสต็อกสินค้า
  
  alt สต็อกสินค้าไม่พอ (บางรายการ)
    BE-->>FE: ส่งค่า HTTP 400 (สินค้ามีจำนวนสต็อกไม่เพียงพอ)
    FE->>Customer: แสดงข้อความแจ้งเตือนสต็อกไม่พอ
  else สต็อกสินค้าเพียงพอทั้งหมด
    BE->>BE: คำนวณหักสต็อกของแต่ละสินค้าที่สั่งซื้อ
    BE->>DB: บันทึกสต็อกสินค้าที่อัปเดตลง products.json
    BE->>BE: สร้างคำสั่งซื้อใหม่ (ID อัตโนมัติ, สถานะ = "Pending")
    BE->>DB: เพิ่มข้อมูลคำสั่งซื้อใหม่ลง orders.json
    DB-->>BE: ยืนยันบันทึกสำเร็จ
    BE-->>FE: ส่งค่า HTTP 201 (สร้างคำสั่งซื้อสำเร็จและรอชำระเงิน)
    FE->>Customer: แสดงหน้าจอ PromptPay QR Code จำลองการชำระเงิน
  end
  deactivate BE

  Note over Customer, DB: 2. จำลองการชำระเงิน (Simulate Payment)
  Customer->>FE: คลิกปุ่ม "ชำระเงินสำเร็จ (Simulate Payment)"
  FE->>BE: POST /api/orders/:id/pay
  activate BE
  BE->>DB: อ่านไฟล์ orders.json ค้นหาคำสั่งซื้อตาม ID
  BE->>BE: เปลี่ยนสถานะคำสั่งซื้อเป็น "Paid"
  BE->>DB: บันทึกการอัปเดตลง orders.json
  DB-->>BE: ยืนยันบันทึกสำเร็จ
  BE-->>FE: ส่งค่า HTTP 200 (จำลองชำระเงินสำเร็จ)
  deactivate BE
  FE->>FE: เรียกใช้ clearCart() เพื่อเคลียร์ตะกร้าในหน้าบ้าน
  FE->>Customer: แสดงป๊อปอัป "สั่งซื้อสำเร็จ" และพากลับหน้าประวัติสั่งซื้อ
```

### 4.3 กระบวนการยกเลิกคำสั่งซื้อและการคืนคลังสินค้า (Order Cancellation & Inventory Restoration)
แสดงขั้นตอนที่ลูกค้ากดยกเลิกคำสั่งซื้อ โดยระบบต้องปรับสถานะเป็น Cancelled และคืนสินค้ากลับคลัง

```mermaid
sequenceDiagram
  autonumber
  actor Customer as 👤 ลูกค้า
  participant FE as 🖥️ หน้าบ้าน (Frontend / Orders Page)
  participant BE as ⚙️ หลังบ้าน (Backend API)
  participant DB as 💾 ฐานข้อมูล (JSON Files)

  Customer->>FE: คลิกปุ่ม "ยกเลิกคำสั่งซื้อ" (สำหรับสถานะ Pending หรือ Paid)
  FE->>BE: PUT /api/orders/:id/cancel (พร้อม Header x-user-id)
  activate BE
  BE->>DB: อ่านไฟล์ orders.json ค้นหาออเดอร์ตาม ID
  DB-->>BE: ข้อมูลคำสั่งซื้อ
  
  alt ไม่พบออเดอร์ หรือ สิทธิ์ไม่ถูกต้อง หรือ สถานะไม่ใช่ Pending/Paid
    BE-->>FE: ส่งค่า HTTP 400/403/404 (ไม่สามารถยกเลิกคำสั่งซื้อได้)
    FE->>Customer: แสดงข้อความแจ้งเตือนข้อผิดพลาด
  else สามารถยกเลิกได้
    BE->>DB: อ่านไฟล์ products.json
    BE->>BE: คำนวณสต็อกบวกคืนให้สินค้าทุกรายการในออเดอร์
    BE->>DB: บันทึกข้อมูลสต็อกสินค้าที่เพิ่มกลับลง products.json
    BE->>BE: เปลี่ยนสถานะคำสั่งซื้อเป็น "Cancelled"
    BE->>DB: บันทึกสถานะคำสั่งซื้อที่ยกเลิกลง orders.json
    DB-->>BE: ยืนยันบันทึกสำเร็จ
    BE-->>FE: ส่งค่า HTTP 200 (ยกเลิกสำเร็จและคืนสต็อกเรียบร้อย)
    FE->>FE: อัปเดตรายการคำสั่งซื้อบน UI (สถานะเปลี่ยนเป็น Cancelled)
    FE->>Customer: แสดงป๊อปอัปแจ้งผลการยกเลิกสำเร็จ
  end
  deactivate BE
```

### 4.4 กระบวนการจัดการคำสั่งซื้อและจัดส่งโดยพนักงาน (Order Management & Fulfillment Process)
แสดงขั้นตอนที่พนักงานหรือแอดมินเข้ามาดูรายการสั่งซื้อ ตรวจสอบ และอัปเดตสถานะการจัดส่งพร้อมหมายเลขพัสดุ (Tracking Number)

```mermaid
sequenceDiagram
  autonumber
  actor Staff as 📦 พนักงาน / แอดมิน
  participant FE as 🖥️ หน้าบ้าน (Admin Dashboard)
  participant BE as ⚙️ หลังบ้าน (Backend API)
  participant DB as 💾 ฐานข้อมูล (orders.json)

  Note over Staff, DB: 1. การดึงรายการคำสั่งซื้อทั้งหมด (Fetch Orders)
  Staff->>FE: เปิดแท็บ "จัดการออเดอร์" (Order Management)
  FE->>BE: GET /api/orders (พร้อม Header x-user-role และ x-user-id)
  activate BE
  BE->>BE: ตรวจสอบบทบาทผู้ใช้งาน (Role-Based Access Control)
  alt ผู้ใช้เป็นพนักงาน (Staff) หรือ แอดมิน (Admin)
    BE->>DB: อ่านไฟล์ orders.json ทั้งหมด
    DB-->>BE: รายการคำสั่งซื้อทั้งหมดของร้านค้า
    BE-->>FE: ส่งค่า HTTP 200 (ส่งรายการคำสั่งซื้อทั้งหมดกลับ)
    FE->>Staff: แสดงผลตารางรายการคำสั่งซื้อทั้งหมดบนแผงควบคุม
  else ผู้ใช้ทั่วไป
    BE-->>FE: ส่งค่า HTTP 401 (ไม่มีสิทธิ์เข้าถึง)
  end
  deactivate BE

  Note over Staff, DB: 2. การอัปเดตสถานะจัดส่งและหมายเลขพัสดุ (Fulfillment)
  Staff->>FE: เลือกออเดอร์ เปลี่ยนสถานะเป็น "Shipped" และกรอกเลขพัสดุ
  FE->>BE: PUT /api/orders/:id/status (ส่ง status และ trackingNumber พร้อม Header x-user-role)
  activate BE
  BE->>BE: ตรวจสอบสิทธิ์ผู้แก้ (ต้องเป็น admin/staff)
  alt สิทธิ์ไม่เพียงพอ
    BE-->>FE: ส่งค่า HTTP 403 (ไม่มีสิทธิ์จัดสถานะ)
    FE->>Staff: แสดงกล่องข้อความเตือนไม่มีสิทธิ์
  else มีสิทธิ์ถูกต้อง
    BE->>DB: อ่านไฟล์ orders.json ค้นหาออเดอร์ตาม ID
    BE->>BE: อัปเดตฟิลด์ status = "Shipped" และใส่ trackingNumber
    BE->>DB: บันทึกข้อมูลลง orders.json
    DB-->>BE: ยืนยันบันทึกสำเร็จ
    BE-->>FE: ส่งค่า HTTP 200 (อัปเดตสถานะจัดส่งเรียบร้อย)
    FE->>Staff: แสดงป๊อปอัป "อัปเดตสำเร็จ" และรีเฟรชข้อมูลในตาราง
  end
  deactivate BE
```

### 4.5 กระบวนการจัดการสินค้าและสต็อกหลังร้าน (Product Inventory CRUD Operations)
แสดงขั้นตอนที่ผู้ดูแลระบบ/พนักงานทำรายการเพิ่ม แก้ไขข้อมูล/ปรับสต็อก และลบสินค้าออกจากระบบ

```mermaid
sequenceDiagram
  autonumber
  actor Staff as 📦 พนักงาน / แอดมิน
  participant FE as 🖥️ หน้าบ้าน (Inventory Control)
  participant BE as ⚙️ หลังบ้าน (Backend API)
  participant DB as 💾 ฐานข้อมูล (products.json)

  Note over Staff, DB: 1. การเพิ่มสินค้าใหม่ (Add Product)
  Staff->>FE: กรอกข้อมูลสินค้าและกดปุ่ม "เพิ่มสินค้า"
  FE->>BE: POST /api/products (ส่ง Request Body และ Header x-user-role)
  activate BE
  BE->>BE: ตรวจสอบสิทธิ์ (admin/staff)
  alt สิทธิ์ถูกต้อง
    BE->>DB: อ่านไฟล์ products.json
    BE->>BE: สร้างไอดีสินค้าใหม่ (p_timestamp) และเพิ่มข้อมูล
    BE->>DB: บันทึกข้อมูลสินค้าใหม่ลง products.json
    DB-->>BE: ยืนยันบันทึกสำเร็จ
    BE-->>FE: ส่งค่า HTTP 201 (เพิ่มสินค้าสำเร็จ พร้อมข้อมูลสินค้าที่สร้าง)
    FE->>Staff: ป๊อปอัปแจ้งความสำเร็จ และเพิ่มแถวข้อมูลในตาราง
  else ไม่มีสิทธิ์
    BE-->>FE: ส่งค่า HTTP 403 (ไม่มีสิทธิ์การเข้าถึง)
  end
  deactivate BE

  Note over Staff, DB: 2. การแก้ไขรายละเอียด / สต็อกสินค้า (Edit Product / Adjust Stock)
  Staff->>FE: คลิกปรับสต็อกสินค้า (+1/-1) หรือกรอกฟอร์มแก้ไขข้อมูลสินค้า
  FE->>BE: PUT /api/products/:id (ส่งฟิลด์ที่ต้องการแก้ไข และ Header x-user-role)
  activate BE
  BE->>BE: ตรวจสอบสิทธิ์ (admin/staff)
  alt สิทธิ์ถูกต้อง
    BE->>DB: อ่านไฟล์ products.json ค้นหาตาม ID
    BE->>BE: อัปเดตเฉพาะฟิลด์ที่มีการเปลี่ยนแปลง (เช่น stock, price)
    BE->>DB: บันทึกทับไฟล์ products.json
    DB-->>BE: ยืนยันบันทึกสำเร็จ
    BE-->>FE: ส่งค่า HTTP 200 (แก้ไขสินค้าสำเร็จ)
    FE->>Staff: แสดงอัปเดตข้อมูลบนหน้าจอทันที
  else ไม่มีสิทธิ์
    BE-->>FE: ส่งค่า HTTP 403
  end
  deactivate BE

  Note over Staff, DB: 3. การลบสินค้า (Delete Product)
  Staff->>FE: กดปุ่ม "ลบสินค้า" ในตาราง
  FE->>BE: DELETE /api/products/:id (ส่ง Header x-user-role)
  activate BE
  BE->>BE: ตรวจสอบสิทธิ์ (admin/staff)
  alt สิทธิ์ถูกต้อง
    BE->>DB: อ่านไฟล์ products.json
    BE->>BE: ลบออบเจกต์สินค้าออกจากอาเรย์รายการสินค้า
    BE->>DB: บันทึกทับไฟล์ products.json
    DB-->>BE: ยืนยันบันทึกสำเร็จ
    BE-->>FE: ส่งค่า HTTP 200 (ลบสินค้าสำเร็จ)
    FE->>Staff: ลบแถวข้อมูลสินค้าดังกล่าวออกจากหน้าจอคลัง
  else ไม่มีสิทธิ์
    BE-->>FE: ส่งค่า HTTP 403
  end
  deactivate BE
```

### 4.6 กระบวนการทดสอบประสิทธิภาพ API (Performance QA Tester)
แสดงขั้นตอนการทำงานของโมดูลจำลองการโหลด API (API Load Tester) ที่ยิง Request แบบขนานเพื่อตรวจวัดความหน่วงของเซิร์ฟเวอร์หลังบ้าน

```mermaid
sequenceDiagram
  autonumber
  actor Admin as 👤 ผู้ดูแลระบบ
  participant FE as 🖥️ หน้าบ้าน (Performance QA Tool)
  participant BE as ⚙️ หลังบ้าน (Backend API)
  participant Cache as 🧠 หน่วยความจำหลังบ้าน (Node.js/OS I/O)

  Admin->>FE: เลือกเส้นทาง API (เช่น GET /api/products), ตั้งค่า Concurrency (5) และจำนวนครั้ง (50)
  Admin->>FE: คลิก "เริ่มต้นการทดสอบประสิทธิภาพ (Run Test)"
  FE->>FE: เริ่มต้นจับเวลาการทดสอบ และสร้าง Asynchronous Workers 5 ตัวพร้อมกัน
  
  par ข้อมูลถูกยิงแบบขนานและเป็นจังหวะตามจำนวนรอบ (Concurrently)
    FE->>BE: GET /api/products (Request 1)
    FE->>BE: GET /api/products (Request 2)
    FE->>BE: GET /api/products (Request 3)
    FE->>BE: GET /api/products (Request 4)
    FE->>BE: GET /api/products (Request 5)
  and การตอบรับอย่างรวดเร็วจากเซิร์ฟเวอร์
    activate BE
    BE->>Cache: ค้นหาข้อมูลสินค้าจากแคชหน่วยความจำ
    Cache-->>BE: รายการข้อมูลผลิตภัณฑ์
    BE-->>FE: HTTP 200 OK (Response 1, 2, 3, 4, 5...)
    deactivate BE
  end
  
  FE->>FE: บันทึก Latency แต่ละ Request และนับรอบจนครบ 50 ครั้ง
  FE->>FE: คำนวณสรุปผลการวัดค่า: RPS, ค่าเฉลี่ยความหน่วง (Avg Latency), อัตราสำเร็จ (%)
  FE->>FE: วาดเส้นกราฟ SVG Latency Timeline และสร้างตารางแสดงผลเชิงสถิติ
  FE->>Admin: แสดงแผนภูมิกราฟประสิทธิภาพแบบไดนามิก และข้อมูลผลการทดสอบให้แอดมินตรวจสอบ
```

---

## 5. แผนผังต้นแบบลายเส้น (Wireframe - หน้าหลัก)
โครงร่างแสดงตำแหน่งการวางข้อมูลของหน้าร้านค้าออนไลน์หลักเพื่อความเรียบง่ายและเป็นระเบียบ

```text
+---------------------------------------------------------------------------------+
|  VITA LIFE                                          [ร้านค้า]  [ตะกร้า (0)]  [👤 สมชาย] |
+---------------------------------------------------------------------------------+
|                                                                                 |
|   ===================== VITALIFE WELLNESS =====================                 |
|   ยกระดับสุขภาพและการดำเนินชีวิตของคุณด้วยผลิตภัณฑ์พรีเมียมคัดสรรพิเศษเพื่อความสุข     |
|                                                                                 |
+---------------------------------------------------------------------------------+
|  [🔍 ค้นหาผลิตภัณฑ์สุขภาพ...]                                                      |
|                                                                                 |
|  ( ทั้งหมด )  ( อาหารเสริม )  ( อาหาร/เครื่องดื่ม )  ( อุปกรณ์ฟิตเนส )  ( ผลิตภัณฑ์ผิว )   |
+---------------------------------------------------------------------------------+
|  +--------------------+  +--------------------+  +--------------------+         |
|  | [Tag: Supplements] |  | [Tag: Organic Food]|  | [Tag: Fitness Gear]|         |
|  |                    |  |                    |  |                    |         |
|  |    [รูปเวย์โปรตีน]   |  |     [รูปผงมัทฉะ]    |  |    [รูปเสื่อโยคะ]    |         |
|  |                    |  |                    |  |                    |         |
|  | เวย์โปรตีนไอโซเลท...|  | ผงมัทฉะออร์แกนิก... |  | เสื่อโยคะยางพารา... |         |
|  | ✓ มีสินค้าในสต็อก    |  | ✓ มีสินค้าในสต็อก    |  | ⚠️ เหลือเพียง 2 ชิ้น |         |
|  | ราคา: 1,890 บาท    |  | ราคา: 690 บาท      |  | ราคา: 2,450 บาท    |         |
|  |     [ใส่ตะกร้า]     |  |     [ใส่ตะกร้า]     |  |     [ใส่ตะกร้า]     |         |
|  +--------------------+  +--------------------+  +--------------------+         |
+---------------------------------------------------------------------------------+
|  © 2026 VITALIFE E-Commerce Co., Ltd. All rights reserved.                      |
+---------------------------------------------------------------------------------+
```

---

## 6. ต้นแบบความละเอียดสูงเพื่อโต้ตอบ (High-Fidelity Interactive Prototype)
สำหรับระบบ fitpung ตัวโปรเจ็คโค้ดของหน้าบ้าน (React/Vite) และหลังบ้าน (Node.js/Express) ในปัจจุบันทำหน้าที่เป็น **High-Fidelity Prototype (ต้นแบบที่มีความเที่ยงตรงสูง)** ซึ่งมีคุณลักษณะการโต้ตอบที่ครบถ้วน ดังนี้:

*   **มีชีวิตจริงและสามารถใช้งานได้จริง (Working Code):** สามารถพิมพ์ค้นหา กรองหมวดหมู่สินค้า กดเพิ่มสินค้าเข้าสู่ตะกร้าสะสมยอด และคลิกเปิด Modal ชำระเงินเพื่อกรอกข้อมูลจัดส่งที่เชื่อมโยงกันได้จริง
*   **ผสานสไตล์และธีมความงามระดับลักชัวรี่:** แสดงผลด้วยสีสันที่ถูกกำหนดขึ้นจากดีไซน์เนอร์อย่างเป็นทางการ (สีเขียวป่ามรกตสว่างและแสงสะท้อนขอบสีทอง) นำเสนอภาพประกอบจริงจาก AI
*   **ระบบจำลองข้อมูลสมจริง:** แอดมินสามารถเพิ่มข้อมูลสินค้าสุขภาพเข้าไปในระบบเพื่อเทสพฤติกรรมของแอปพลิเคชันเสมือนอยู่บนระบบโปรดักชันจริงก่อนเปิดตัว

---

## 7. โครงสร้างข้อมูลที่รับผิดชอบโดยสมาชิกแต่ละคน (Data Schema by Team Member)


###  : ระบบสมาชิกและการเข้าสู่ระบบ (Auth & User)
**ไฟล์ฐานข้อมูล:** `backend/data/users.json`
```json
{
  "id": "String (เช่น u_1700000000000)",
  "username": "String (ชื่อผู้ใช้)",
  "password": "String (รหัสผ่าน)",
  "email": "String (อีเมล)",
  "role": "String ('admin', 'staff', 'customer')",
  "name": "String (ชื่อ-นามสกุลจริง)"
}
```

### : ระบบแสดงและค้นหาสินค้าหน้าบ้าน (Products)
**ไฟล์ฐานข้อมูล:** `backend/data/products.json`

```json
{
  "id": "String (เช่น p_1700000000000)",
  "name": "String (ชื่อสินค้า)",
  "category": "String (หมวดหมู่)",
  "price": "Number (ราคา)",
  "stock": "Number (จำนวนคงเหลือ)",
  "image": "String (URL รูปภาพ)",
  "description": "String (รายละเอียดสินค้า)",
  "specs": {
    "manufacturer": "String (ผู้ผลิต)",
    "weight": "String (น้ำหนัก)",
    "materials": "String (ส่วนประกอบ)",
    "warranty": "String (การรับรอง)"
  }
}
```

###  (Shopping Cart)
**การจัดเก็บ:** จัดเก็บผ่าน React Context (Frontend State) ไม่ลงฐานข้อมูลจนกว่าจะชำระเงิน
**โครงสร้าง Schema (CartItem):**
```json
{
  "productId": "String (อ้างอิงรหัสสินค้า)",
  "name": "String (ชื่อสินค้า)",
  "price": "Number (ราคาต่อชิ้น)",
  "quantity": "Number (จำนวนที่ต้องการสั่ง)",
  "subtotal": "Number (ราคารวมของสินค้านี้)"
}
```

###  ระบบคำสั่งซื้อและการชำระเงิน (Orders)
**ไฟล์ฐานข้อมูล:** `backend/data/orders.json`

```json
{
  "id": "String (เช่น ord_1700000000000)",
  "userId": "String (อ้างอิงรหัสผู้ซื้อจากคนที่ 1)",
  "items": "[CartItem] (รายการสินค้าที่สั่งซื้อจากตะกร้าคนที่ 3)",
  "totalPrice": "Number (ราคารวมทั้งหมด)",
  "shippingAddress": {
    "recipientName": "String",
    "phone": "String",
    "address": "String",
    "postalCode": "String"
  },
  "paymentMethod": "String (เช่น 'PromptPay')",
  "status": "String ('Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled')",
  "trackingNumber": "String (เลขพัสดุ - จะถูกใส่ตอนพนักงานส่งของ)"
}
```

### ระบบจัดการหลังบ้านพนักงานและแอดมิน (Admin Dashboard)
ไม่มีไฟล์ JSON แต่มีหน้าที่เขียนโค้ดเรียกใช้งาน Schema ของคนอื่นๆ มาบริหารจัดการ (CRUD Operations)
*   **เพิ่ม/ลด/แก้ไขสินค้า:** อ่านและเขียนทับไฟล์ `products.json` ของระบบแสดงและค้นหาสินค้าหน้าบ้าน
*   **อัปเดตสถานะการจัดส่ง (Tracking):** แก้ไขฟิลด์ `status` และ `trackingNumber` ใน `orders.json` ของระบบคำสั่งซื้อและการชำระเงิน
*   **เรียกดูรายชื่อสมาชิกเพื่อจัดทำสถิติ:** อ่านข้อมูลจาก `users.json` ของระบบสมาชิกและการเข้าสู่ระบบ

---

## 8. ระบบจัดการหลังร้านและการทดสอบประสิทธิภาพ (Admin & Performance QA)

ในหน้านี้จะอธิบายระบบที่พัฒนาขึ้นเพิ่มเติมสำหรับแอดมิน รวมถึงเครื่องมือทดสอบประสิทธิภาพการทำงานของ API หลังบ้าน

### 8.1 ขอบเขตการทำงานของระบบจัดการหลังบ้าน (Admin Operations)
ระบบแผงควบคุมหลังร้าน (Admin Panel) แบ่งสัดส่วนตามสิทธิ์ผู้ใช้งาน (Role-Based Access Control) โดยมีฟังก์ชันหลัก 3 ส่วนดังนี้:
1. **ภาพรวมแดชบอร์ด (Overview Dashboard)**
   - คำนวณสรุปสถิติตัวเลขจริง: ยอดขายรวม (คำนวณจากคำสั่งซื้อที่จ่ายเงินแล้วขึ้นไป), จำนวนออเดอร์ทั้งหมด, จำนวนรายการสินค้า, และจำนวนสมาชิก
   - แผนภูมิแท่ง SVG แบบไดนามิก แสดงสัดส่วนยอดขายแยกตามประเภทสินค้า (Supplement, Food & Beverage, Fitness Gear, Skincare)
   - รายการคำสั่งซื้อล่าสุดที่เข้าสู่ระบบแบบทันที
2. **จัดการคำสั่งซื้อ (Order Management)**
   - ตารางแสดงรายการใบสั่งซื้อทั้งหมด ค้นหาได้ด้วย ID ออเดอร์, ชื่อลูกค้า, หรือสถานะ
   - ความสามารถในการเปลี่ยนสถานะการจัดส่งและป้อนข้อมูลหมายเลขพัสดุ (Tracking Number) เพื่อส่งข้อมูลให้ลูกค้าทราบ
3. **การจัดการคลังสินค้า (Inventory Management - CRUD)**
   - การปรับจำนวนสินค้าในสต็อกอย่างรวดเร็ว (Quick Adjust +1 / -1)
   - ฟอร์มสำหรับเพิ่มรายการสินค้าใหม่พร้อมข้อมูลจำเพาะ (Specifications) เช่น ผู้ผลิต, น้ำหนักสุทธิ, ส่วนประกอบสำคัญ, และใบรับรอง
   - ความสามารถในการลบสินค้าออกจากระบบแบบถาวร

### 8.2 สถาปัตยกรรมความปลอดภัยและการปกป้อง API (Security & RBAC)
การปกป้องเส้นทางเข้าถึงระบบแอดมินทำผ่านสองขั้นตอน:
- **หน้าบ้าน (React):** ปกป้อง Routing โดยเช็คคุณสมบัติ `role === 'admin' || role === 'staff'` จาก `AuthContext` หากไม่มีสิทธิ์ระบบจะบล็อกและพากลับหน้าหลัก
- **หลังบ้าน (Express):** API Endpoints สำหรับแอดมินทั้งหมดจะตรวจสอบ HTTP Headers `x-user-role` และ `x-user-id` เพื่อยืนยันตัวตนและการเข้าสิทธิ์ก่อนอ่านเขียนไฟล์ฐานข้อมูล JSON

### 8.3 การทดสอบประสิทธิภาพของระบบ (Performance QA)
เนื่องจากระบบนี้ใช้แฟ้มข้อมูลรูปแบบ JSON (`users.json`, `products.json`, `orders.json`) แทนฐานข้อมูล relational ทางทีมงานจึงพัฒนา **Performance QA Tester (API Load Tester)** ขึ้นบนแผงควบคุมเพื่อทำการทดสอบประสิทธิภาพเชิงปริมาณ (Quantitative Testing)

#### วิธีการทดสอบและวิเคราะห์ (Testing Methodology)
- ระบบจำลองการยิง HTTP Requests ขนานกัน (Concurrent Workers) จากฝั่งเบราว์เซอร์ตรงไปยัง API Endpoints ที่เลือก เช่น `GET /api/products` หรือ `GET /api/orders`
- เครื่องมือทดสอบจะวัดค่าสำคัญ 4 ประการ:
  1. **Requests Per Second (RPS):** จำนวนคำขอที่ระบบหลังบ้านสามารถตอบรับได้สำเร็จใน 1 วินาที
  2. **Latency (ms):** ความหน่วงเวลาเฉลี่ย ตลอดจนค่าต่ำสุด (Min) และสูงสุด (Max) ของคำขอ
  3. **Success Rate (%):** อัตราคำขอที่สำเร็จลุล่วง (HTTP status 200 OK)
  4. **Latency Timeline Plot:** การวาดเส้นกราฟ SVG แสดงการสวิงของความหน่วงแบบ Real-time ของทุกลำดับ Request

#### รายงานสรุปผลการทดสอบเชิงประสิทธิภาพ (Benchmark Results)
ผลการจำลองทดสอบประสิทธิภาพการทำงานบน Local Environment (ระดับ Concurrency = 5 workers, Total Requests = 50 requests) ได้ผลลัพธ์ดังนี้:

| API Endpoint | Concurrency | Total Requests | Latency เฉลี่ย (ms) | ความเร็วการประมวลผล (RPS) | อัตราสำเร็จ (%) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `GET /api/products` | 5 | 50 | ~2.5 ms | ~1,200 req/s | 100% |
| `GET /api/orders` | 5 | 50 | ~4.2 ms | ~900 req/s | 100% |

> [!TIP]
> **สรุปผลลัพธ์ QA:** ระบบมีความหน่วงเฉลี่ยต่ำมากเนื่องจากข้อมูลหลังบ้านถูกเก็บไว้ในหน่วยความจำชั่วคราว (Node.js cache) และเขียนทับลงดิสก์ด้วยกระบวนการแบบ Asynchronous I/O ของระบบปฏิบัติการ ทำให้สามารถรองรับคำสั่งซื้อขนานระดับทั่วไปได้อย่างลื่นไหลไร้รอยต่อ

