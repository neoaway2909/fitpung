import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('comp_shop_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [cartWarnings, setCartWarnings] = useState([]);
  const [loadingSync, setLoadingSync] = useState(false);

  useEffect(() => {
    localStorage.setItem('comp_shop_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync and validate cart items with actual backend product catalog
  const validateAndSyncCart = async (showNotifications = true) => {
    setLoadingSync(true);
    setCartWarnings([]);
    try {
      const response = await fetch(`${API_BASE}/products`);
      if (!response.ok) {
        throw new Error('ไม่สามารถตรวจสอบข้อมูลสินค้าจากเซิร์ฟเวอร์ได้');
      }
      const products = await response.json();
      
      setCart((prevCart) => {
        const warnings = [];
        let isChanged = false;
        
        const updatedCart = prevCart.map((item) => {
          const actualProduct = products.find((p) => p.id === item.productId);
          
          if (!actualProduct) {
            // Product no longer exists
            warnings.push(`สินค้า "${item.name}" ไม่มีจำหน่ายในระบบแล้ว`);
            isChanged = true;
            return null;
          }
          
          let validatedQty = item.quantity;
          
          // Validate stock
          if (actualProduct.stock <= 0) {
            warnings.push(`สินค้า "${item.name}" หมดสต็อกชั่วคราว`);
            validatedQty = 0;
            isChanged = true;
          } else if (item.quantity > actualProduct.stock) {
            warnings.push(`สินค้า "${item.name}" มีปริมาณคงเหลือไม่พอ (สต็อกล่าสุด: ${actualProduct.stock} ชิ้น)`);
            validatedQty = actualProduct.stock;
            isChanged = true;
          }
          
          // Validate price
          if (item.price !== actualProduct.price) {
            warnings.push(`สินค้า "${item.name}" มีการปรับเปลี่ยนราคาจาก ${item.price.toLocaleString()} บาท เป็น ${actualProduct.price.toLocaleString()} บาท`);
            isChanged = true;
          }

          // If details changed
          if (
            item.name !== actualProduct.name || 
            item.image !== actualProduct.image || 
            item.stock !== actualProduct.stock ||
            item.price !== actualProduct.price
          ) {
            isChanged = true;
          }
          
          return {
            ...item,
            name: actualProduct.name,
            price: actualProduct.price,
            stock: actualProduct.stock,
            image: actualProduct.image,
            quantity: validatedQty,
            subtotal: actualProduct.price * validatedQty,
          };
        })
        .filter((item) => item !== null && item.quantity > 0);

        if (showNotifications && warnings.length > 0) {
          setCartWarnings(warnings);
        }
        
        return isChanged ? updatedCart : prevCart;
      });
    } catch (error) {
      console.error('Error validation and syncing cart:', error);
      if (showNotifications) {
        setCartWarnings([error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อเช็คสต็อกสินค้า']);
      }
    } finally {
      setLoadingSync(false);
    }
  };

  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.productId === product.id);
      const availableStock = product.stock !== undefined ? product.stock : 999;
      setCartWarnings([]); // reset warnings on action

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        const currentQty = newCart[existingItemIndex].quantity;
        let newQty = currentQty + quantity;
        
        if (newQty > availableStock) {
          setCartWarnings([`ไม่สามารถเพิ่มสินค้า "${product.name}" ได้ชิ้นนี้เนื่องจากสต็อกจำกัด (จำกัดสูงสุด: ${availableStock} ชิ้น)`]);
          newQty = availableStock;
        }
        
        newCart[existingItemIndex].quantity = newQty;
        newCart[existingItemIndex].subtotal = newCart[existingItemIndex].price * newQty;
        newCart[existingItemIndex].stock = availableStock;
        newCart[existingItemIndex].image = product.image;
        return newCart;
      } else {
        let addedQty = quantity;
        if (addedQty > availableStock) {
          setCartWarnings([`ไม่สามารถเพิ่มสินค้า "${product.name}" ได้ชิ้นนี้เนื่องจากสต็อกจำกัด (จำกัดสูงสุด: ${availableStock} ชิ้น)`]);
          addedQty = availableStock;
        }
        
        if (addedQty <= 0) return prevCart;

        return [
          ...prevCart,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: addedQty,
            subtotal: product.price * addedQty,
            stock: availableStock,
            image: product.image,
          },
        ];
      }
    });
  };

  const updateQuantity = (productId, newQty) => {
    setCartWarnings([]); // Reset warning on manual edit
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.productId === productId) {
          const maxStock = item.stock;
          let validatedQty = newQty;
          
          if (validatedQty > maxStock) {
            setCartWarnings([`สินค้า "${item.name}" มีปริมาณสต็อกจำกัด ไม่สามารถเลือกเกิน ${maxStock} ชิ้นได้`]);
            validatedQty = maxStock;
          }
          
          return {
            ...item,
            quantity: validatedQty,
            subtotal: item.price * validatedQty,
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCartWarnings([]);
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCartWarnings([]);
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.subtotal, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        validateAndSyncCart,
        cartWarnings,
        setCartWarnings,
        loadingSync,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
